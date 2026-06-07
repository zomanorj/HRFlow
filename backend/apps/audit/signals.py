from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.employees.models import Employee
from apps.departments.models import Department
from apps.leaves.models import LeaveRequest
from apps.attendance.models import Attendance
from .audit_service import log_activity

@receiver(post_save, sender=Employee)
def employee_saved(sender, instance, created, **kwargs):
    """Logs employee creation or update"""
    if created:
        log_activity(
            user=None,
            action='CREATE_EMPLOYEE',
            target_type='Employee',
            target_id=str(instance.id),
            description=f"Création de l'employé: {instance.prenom} {instance.nom} ({instance.email})"
        )
    else:
        log_activity(
            user=None,
            action='UPDATE_EMPLOYEE',
            target_type='Employee',
            target_id=str(instance.id),
            description=f"Modification de l'employé: {instance.prenom} {instance.nom}"
        )

@receiver(post_delete, sender=Employee)
def employee_deleted(sender, instance, **kwargs):
    """Logs employee deletion"""
    log_activity(
        user=None,
        action='DELETE_EMPLOYEE',
        target_type='Employee',
        target_id=str(instance.id),
        description=f"Suppression de l'employé: {instance.prenom} {instance.nom}"
    )

@receiver(post_save, sender=Department)
def department_saved(sender, instance, created, **kwargs):
    """Logs department creation"""
    if created:
        log_activity(
            user=None,
            action='CREATE_DEPARTMENT',
            target_type='Department',
            target_id=str(instance.id),
            description=f"Création du département: {instance.nom}"
        )

@receiver(post_delete, sender=Department)
def department_deleted(sender, instance, **kwargs):
    """Logs department deletion"""
    log_activity(
        user=None,
        action='DELETE_DEPARTMENT',
        target_type='Department',
        target_id=str(instance.id),
        description=f"Suppression du département: {instance.nom}"
    )

@receiver(post_save, sender=LeaveRequest)
def leave_request_saved(sender, instance, created, **kwargs):
    """Logs leave request creation, approval, or rejection"""
    if created:
        log_activity(
            user=instance.employee.user,
            action='CREATE_LEAVE',
            target_type='LeaveRequest',
            target_id=str(instance.id),
            description=f"Création d'une demande de congé: {instance.start_date} au {instance.end_date}"
        )
    else:
        if instance.status == 'APPROVED':
            log_activity(
                user=None,  # Should ideally be the approver, but not always tracked
                action='APPROVE_LEAVE',
                target_type='LeaveRequest',
                target_id=str(instance.id),
                description=f"Approbation de congé pour {instance.employee.prenom} {instance.employee.nom}: {instance.start_date} au {instance.end_date}"
            )
        elif instance.status == 'REJECTED':
            log_activity(
                user=None,  # Should ideally be the rejector, but not always tracked
                action='REJECT_LEAVE',
                target_type='LeaveRequest',
                target_id=str(instance.id),
                description=f"Rejet de congé pour {instance.employee.prenom} {instance.employee.nom}: {instance.start_date} au {instance.end_date}"
            )

@receiver(post_save, sender=Attendance)
def attendance_saved(sender, instance, created, **kwargs):
    """Logs check-in when attendance is created"""
    if created and instance.check_in:
        log_activity(
            user=instance.employee.user,
            action='CHECK_IN',
            target_type='Attendance',
            target_id=str(instance.id),
            description=f"Check-in pour {instance.employee.prenom} {instance.employee.nom} à {instance.check_in.strftime('%H:%M:%S')}"
        )
    elif not created and instance.check_out:
        # This is a bit tricky since we can't track if check_out was just added
        # We'll check if it was updated
        log_activity(
            user=instance.employee.user,
            action='CHECK_OUT',
            target_type='Attendance',
            target_id=str(instance.id),
            description=f"Check-out pour {instance.employee.prenom} {instance.employee.nom} à {instance.check_out.strftime('%H:%M:%S')} ({instance.hours_worked}h travaillées)"
        )
