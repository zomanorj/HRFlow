from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.leaves.models import LeaveRequest
from apps.employees.models import Employee
from apps.departments.models import Department
from apps.accounts.models import User
from .services import create_notification

@receiver(post_save, sender=LeaveRequest)
def leave_request_saved(sender, instance, created, **kwargs):
    if created:
        # Nouvelle demande de congé -> Notifier les RH et Admins
        recipients = User.objects.filter(role__in=['ADMIN', 'HR'])
        title = "Nouvelle demande de congé"
        message = f"L'employé {instance.employee.prenom} {instance.employee.nom} a demandé un congé du {instance.start_date} au {instance.end_date}."
        for recipient in recipients:
            create_notification(recipient, title, message, type='INFO')
    else:
        # Mise à jour -> Approbation ou Rejet
        if instance.status == 'APPROVED':
            recipient = instance.employee.user
            if recipient:
                title = "Demande de congé approuvée"
                message = f"Votre demande de congé du {instance.start_date} au {instance.end_date} a été approuvée."
                create_notification(recipient, title, message, type='SUCCESS')
        elif instance.status == 'REJECTED':
            recipient = instance.employee.user
            if recipient:
                title = "Demande de congé refusée"
                message = f"Votre demande de congé du {instance.start_date} au {instance.end_date} a été refusée."
                create_notification(recipient, title, message, type='ERROR')

@receiver(post_save, sender=Employee)
def employee_saved(sender, instance, created, **kwargs):
    if created:
        # Notifier les RH et Admins
        recipients = User.objects.filter(role__in=['ADMIN', 'HR'])
        title = "Nouveau collaborateur"
        message = f"L'employé {instance.prenom} {instance.nom} a rejoint l'entreprise en tant que {instance.poste}."
        for recipient in recipients:
            create_notification(recipient, title, message, type='SUCCESS')
            
        # Notifier l'employé lui-même
        if instance.user:
            create_notification(
                instance.user,
                "Bienvenue chez HRFlow",
                f"Bonjour {instance.prenom}, votre profil collaborateur a été créé avec succès dans notre système.",
                type='INFO'
            )

@receiver(post_delete, sender=Employee)
def employee_deleted(sender, instance, **kwargs):
    recipients = User.objects.filter(role__in=['ADMIN', 'HR'])
    title = "Collaborateur supprimé"
    message = f"L'employé {instance.prenom} {instance.nom} a été retiré des effectifs."
    for recipient in recipients:
        create_notification(recipient, title, message, type='WARNING')

@receiver(post_save, sender=Department)
def department_saved(sender, instance, created, **kwargs):
    if created:
        recipients = User.objects.filter(role__in=['ADMIN', 'HR'])
        title = "Nouveau département"
        message = f"Le département '{instance.nom}' a été créé."
        for recipient in recipients:
            create_notification(recipient, title, message, type='SUCCESS')

@receiver(post_delete, sender=Department)
def department_deleted(sender, instance, **kwargs):
    recipients = User.objects.filter(role__in=['ADMIN', 'HR'])
    title = "Département supprimé"
    message = f"Le département '{instance.nom}' a été supprimé."
    for recipient in recipients:
        create_notification(recipient, title, message, type='WARNING')
