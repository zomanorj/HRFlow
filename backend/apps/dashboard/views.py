from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.employees.models import Employee
from apps.departments.models import Department
from apps.leaves.models import LeaveRequest
from apps.attendance.models import Attendance

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.localdate()

        # Tableau de bord Administrateur ou RH
        if user.role in ['ADMIN', 'HR'] or user.is_superuser:
            employees_count = Employee.objects.count()
            departments_count = Department.objects.count()
            pending_leaves_count = LeaveRequest.objects.filter(status='PENDING').count()
            today_attendance_count = Attendance.objects.filter(date=today).count()
            
            # Demandes de congés récentes
            recent_leaves = LeaveRequest.objects.order_by('-created_at')[:5]
            recent_leaves_data = [
                {
                    "id": leave.id,
                    "employee_name": f"{leave.employee.prenom} {leave.employee.nom}",
                    "start_date": leave.start_date,
                    "end_date": leave.end_date,
                    "reason": leave.reason,
                    "status": leave.status
                }
                for leave in recent_leaves
            ]

            data = {
                "role": user.role,
                "stats": {
                    "employees_count": employees_count,
                    "departments_count": departments_count,
                    "pending_leaves_count": pending_leaves_count,
                    "today_attendance_count": today_attendance_count,
                },
                "recent_leaves": recent_leaves_data
            }
        
        # Tableau de bord Employé
        else:
            if not hasattr(user, 'employee_profile'):
                return Response(
                    {"error": "Aucun profil employé n'est associé à ce compte utilisateur."},
                    status=400
                )
            
            employee = user.employee_profile
            
            # Statistiques personnelles
            pending_leaves = LeaveRequest.objects.filter(employee=employee, status='PENDING').count()
            approved_leaves = LeaveRequest.objects.filter(employee=employee, status='APPROVED').count()
            
            # Pointage du jour
            today_attendance = Attendance.objects.filter(employee=employee, date=today).first()
            if today_attendance:
                if today_attendance.check_out:
                    status_today = "CHECKED_OUT"
                    check_in_time = today_attendance.check_in
                    check_out_time = today_attendance.check_out
                else:
                    status_today = "CHECKED_IN"
                    check_in_time = today_attendance.check_in
                    check_out_time = None
            else:
                status_today = "NOT_CHECKED_IN"
                check_in_time = None
                check_out_time = None

            # Nombre d'heures travaillées ce mois-ci
            start_of_month = today.replace(day=1)
            attendances_this_month = Attendance.objects.filter(
                employee=employee, 
                date__gte=start_of_month,
                hours_worked__isnull=False
            )
            total_hours_this_month = sum(att.hours_worked for att in attendances_this_month)

            data = {
                "role": user.role,
                "stats": {
                    "pending_leaves": pending_leaves,
                    "approved_leaves": approved_leaves,
                    "total_hours_this_month": float(total_hours_this_month),
                    "status_today": status_today,
                },
                "today_attendance": {
                    "check_in": check_in_time,
                    "check_out": check_out_time,
                }
            }

        return Response(data)
