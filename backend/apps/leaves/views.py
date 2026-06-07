from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.serializers import ValidationError
from django.http import HttpResponse
from apps.accounts.permissions import IsHR, IsEmployee
from .models import LeaveRequest
from .serializers import LeaveRequestSerializer
from datetime import datetime
from icalendar import Calendar, Event
import pytz

class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer

    def get_permissions(self):
        if self.action in ['approve', 'reject']:
            permission_classes = [IsHR]
        else:
            permission_classes = [IsEmployee]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'HR'] or user.is_superuser:
            return LeaveRequest.objects.all().order_by('-created_at')
        
        # L'employé ne voit que ses propres demandes
        if hasattr(user, 'employee_profile'):
            return LeaveRequest.objects.filter(employee=user.employee_profile).order_by('-created_at')
        return LeaveRequest.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        
        # Si c'est un employé normal ou si aucun employé n'est spécifié, on associe l'employé connecté
        if user.role not in ['ADMIN', 'HR'] or 'employee' not in serializer.validated_data:
            if hasattr(user, 'employee_profile'):
                serializer.save(employee=user.employee_profile)
            else:
                raise ValidationError("Aucun profil employé n'est associé à ce compte utilisateur.")
        else:
            serializer.save()

    @action(detail=True, methods=['put', 'post'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'APPROVED'
        leave.save()
        return Response(
            {"message": "La demande de congé a été approuvée.", "data": LeaveRequestSerializer(leave).data},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['put', 'post'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'REJECTED'
        leave.save()
        return Response(
            {"message": "La demande de congé a été refusée.", "data": LeaveRequestSerializer(leave).data},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def balance(self, request):
        user = request.user
        employee_id = request.query_params.get('employee_id')
        
        if employee_id and user.role in ['ADMIN', 'HR']:
            try:
                from apps.employees.models import Employee
                employee = Employee.objects.get(id=employee_id)
            except Employee.DoesNotExist:
                return Response(
                    {"error": "Employé introuvable."},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            if hasattr(user, 'employee_profile'):
                employee = user.employee_profile
            else:
                # Pour les utilisateurs sans profil employé (Admin, RH), retourner un solde par défaut
                return Response({
                    "available_days": 0,
                    "used_days": 0,
                    "pending_days": 0,
                    "total_days": 0,
                    "message": "Cet utilisateur n'a pas de profil employé."
                }, status=status.HTTP_200_OK)
                
        from .services.leave_balance_service import calculate_leave_balance
        balance_data = calculate_leave_balance(employee)
        return Response(balance_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='export-ical')
    def export_ical(self, request):
        """Export approved leaves as iCalendar format"""
        # Get all approved leaves
        approved_leaves = LeaveRequest.objects.filter(status='APPROVED').select_related('employee', 'employee__user')
        
        # Create calendar
        cal = Calendar()
        cal.add('prodid', '-//HRFlow//Leave Calendar//EN')
        cal.add('version', '2.0')
        cal.add('calscale', 'GREGORIAN')
        cal.add('method', 'PUBLISH')
        cal.add('x-wr-calname', 'HRFlow - Congés')
        cal.add('x-wr-timezone', 'Europe/Paris')
        cal.add('x-wr-caldesc', 'Calendrier des congés approuvés')
        
        # Add events for each leave
        for leave in approved_leaves:
            event = Event()
            event.add('uid', f'leave-{leave.id}@hrflow.local')
            event.add('dtstamp', datetime.now(pytz.UTC))
            event.add('dtstart', leave.start_date)
            event.add('dtend', leave.end_date)
            event.add('summary', f'Congé - {leave.employee.prenom} {leave.employee.nom}')
            event.add('description', f'{leave.employee.prenom} {leave.employee.nom} est en congé')
            event.add('location', leave.employee.department.nom if leave.employee.department else 'Non spécifié')
            event.add('categories', 'Congé,RH')
            event.add('transp', 'TRANSPARENT')
            event.add('status', 'CONFIRMED')
            cal.add_component(event)
        
        # Generate response
        response = HttpResponse(cal.to_ical(), content_type='text/calendar')
        response['Content-Disposition'] = 'attachment; filename="hrflow_calendar.ics"'
        return response
