from django.db import models
from apps.employees.models import Employee

class LeaveRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'En attente'),
        ('APPROVED', 'Approuvé'),
        ('REJECTED', 'Refusé'),
    )
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='leave_requests',
        verbose_name="Employé"
    )
    start_date = models.DateField(verbose_name="Date de début")
    end_date = models.DateField(verbose_name="Date de fin")
    reason = models.TextField(verbose_name="Raison du congé")
    status = models.CharField(
        max_length=15, 
        choices=STATUS_CHOICES, 
        default='PENDING',
        verbose_name="Statut"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de demande")

    def __str__(self):
        return f"Congé {self.employee} ({self.start_date} au {self.end_date}) - {self.status}"
