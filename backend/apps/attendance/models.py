from django.db import models
from apps.employees.models import Employee

class Attendance(models.Model):
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='attendances',
        verbose_name="Employé"
    )
    date = models.DateField(verbose_name="Date")
    check_in = models.DateTimeField(verbose_name="Heure d'arrivée")
    check_out = models.DateTimeField(null=True, blank=True, verbose_name="Heure de départ")
    hours_worked = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        verbose_name="Heures travaillées"
    )

    class Meta:
        unique_together = ('employee', 'date')
        verbose_name = "Présence"
        verbose_name_plural = "Présences"

    def __str__(self):
        return f"{self.employee} - {self.date}"
