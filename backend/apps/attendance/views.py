from django.utils import timezone
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.accounts.permissions import IsEmployee
from apps.notifications.services import create_notification
from apps.leaves.models import LeaveRequest
from .models import Attendance
from .serializers import AttendanceSerializer
import csv
from datetime import datetime, timedelta

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        return [IsEmployee()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'HR'] or user.is_superuser:
            return Attendance.objects.all().order_by('-date', '-check_in')
        
        # Les employés ne voient que leurs propres pointages
        if hasattr(user, 'employee_profile'):
            return Attendance.objects.filter(employee=user.employee_profile).order_by('-date', '-check_in')
        return Attendance.objects.none()

    @action(detail=False, methods=['post'], url_path='check-in')
    def check_in(self, request):
        user = request.user
        if not hasattr(user, 'employee_profile'):
            return Response(
                {"error": "Aucun profil employé n'est associé à ce compte utilisateur."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        employee = user.employee_profile
        today = timezone.localdate()
        
        # Vérifier si déjà pointé aujourd'hui
        if Attendance.objects.filter(employee=employee, date=today).exists():
            return Response(
                {"error": "Vous avez déjà effectué votre check-in aujourd'hui."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attendance = Attendance.objects.create(
            employee=employee,
            date=today,
            check_in=timezone.now()
        )
        
        # Créer une notification
        create_notification(
            user,
            "Check-in effectué",
            f"Vous avez effectué votre check-in à {attendance.check_in.strftime('%H:%M:%S')}.",
            type='SUCCESS'
        )
        
        return Response(
            {"message": "Check-in effectué avec succès.", "data": AttendanceSerializer(attendance).data},
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['post'], url_path='check-out')
    def check_out(self, request):
        user = request.user
        if not hasattr(user, 'employee_profile'):
            return Response(
                {"error": "Aucun profil employé n'est associé à ce compte utilisateur."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        employee = user.employee_profile
        today = timezone.localdate()
        
        # Récupérer le pointage du jour
        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
        except Attendance.DoesNotExist:
            return Response(
                {"error": "Vous devez d'abord effectuer votre check-in avant de faire un check-out."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier si déjà check-out
        if attendance.check_out is not None:
            return Response(
                {"error": "Vous avez déjà effectué votre check-out aujourd'hui."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        now = timezone.now()
        attendance.check_out = now
        
        # Calcul des heures travaillées
        diff = now - attendance.check_in
        hours = diff.total_seconds() / 3600.0
        attendance.hours_worked = round(hours, 2)
        attendance.save()
        
        # Créer une notification
        create_notification(
            user,
            "Check-out effectué",
            f"Vous avez effectué votre check-out à {now.strftime('%H:%M:%S')}. Heures travaillées : {attendance.hours_worked}h.",
            type='SUCCESS'
        )
        
        return Response(
            {"message": "Check-out effectué avec succès.", "data": AttendanceSerializer(attendance).data},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='export-payroll')
    def export_payroll(self, request):
        """Export payroll data as CSV"""
        user = request.user
        
        # Only ADMIN and HR can export
        if user.role not in ['ADMIN', 'HR'] and not user.is_superuser:
            return Response(
                {"error": "Vous n'avez pas les permissions nécessaires."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get date range from query params
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        # Default: last month
        if not date_to:
            date_to = timezone.now().date()
        else:
            date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
        
        if not date_from:
            date_from = date_to - timedelta(days=30)
        else:
            date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
        
        # Get attendance records
        attendances = Attendance.objects.filter(
            date__gte=date_from,
            date__lte=date_to
        ).select_related('employee', 'employee__department')
        
        # Group by employee
        employee_data = {}
        for attendance in attendances:
            emp = attendance.employee
            if emp.id not in employee_data:
                employee_data[emp.id] = {
                    'nom': emp.nom,
                    'prenom': emp.prenom,
                    'email': emp.email,
                    'department': emp.department.nom if emp.department else '',
                    'jours_travailles': 0,
                    'heures_travaillees': 0,
                    'conges_approuves': 0,
                    'retards': 0,
                }
            
            if attendance.hours_worked:
                employee_data[emp.id]['jours_travailles'] += 1
                employee_data[emp.id]['heures_travaillees'] += float(attendance.hours_worked)
        
        # Get approved leaves
        leaves = LeaveRequest.objects.filter(
            status='APPROVED',
            start_date__gte=date_from,
            end_date__lte=date_to
        ).select_related('employee')
        
        for leave in leaves:
            emp = leave.employee
            if emp.id in employee_data:
                days_count = (leave.end_date - leave.start_date).days + 1
                employee_data[emp.id]['conges_approuves'] += days_count
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="payroll_export_{datetime.now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response, delimiter=';')
        writer.writerow([
            'Nom',
            'Prénom',
            'Email',
            'Département',
            'Jours travaillés',
            'Congés approuvés',
            'Heures travaillées',
            'Retards',
            f'Date d\'export: {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}'
        ])
        
        for emp_id, data in sorted(employee_data.items(), key=lambda x: (x[1]['nom'], x[1]['prenom'])):
            writer.writerow([
                data['nom'],
                data['prenom'],
                data['email'],
                data['department'],
                data['jours_travailles'],
                data['conges_approuves'],
                f"{data['heures_travaillees']:.2f}",
                data['retards'],
            ])
        
        return response
