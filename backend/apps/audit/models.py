from django.db import models
from django.conf import settings

class ActivityLog(models.Model):
    ACTION_CHOICES = (
        ('CREATE_EMPLOYEE', 'Création d\'employé'),
        ('UPDATE_EMPLOYEE', 'Modification d\'employé'),
        ('DELETE_EMPLOYEE', 'Suppression d\'employé'),
        ('CREATE_DEPARTMENT', 'Création de département'),
        ('DELETE_DEPARTMENT', 'Suppression de département'),
        ('CREATE_LEAVE', 'Création de congé'),
        ('APPROVE_LEAVE', 'Approbation de congé'),
        ('REJECT_LEAVE', 'Rejet de congé'),
        ('CHECK_IN', 'Check-in'),
        ('CHECK_OUT', 'Check-out'),
        ('LOGIN', 'Connexion'),
        ('LOGOUT', 'Déconnexion'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs',
        verbose_name="Utilisateur"
    )
    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES,
        verbose_name="Action"
    )
    target_type = models.CharField(
        max_length=50,
        verbose_name="Type de cible"
    )
    target_id = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name="ID de la cible"
    )
    description = models.TextField(verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Log d'activité"
        verbose_name_plural = "Logs d'activité"
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action']),
        ]

    def __str__(self):
        return f"{self.get_action_display()} - {self.user} - {self.created_at}"
