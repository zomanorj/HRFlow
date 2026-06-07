from django.db import models
from django.conf import settings
from apps.departments.models import Department

class Employee(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='employee_profile',
        null=True,
        blank=True,
        verbose_name="Compte Utilisateur"
    )
    nom = models.CharField(max_length=100, verbose_name="Nom")
    prenom = models.CharField(max_length=100, verbose_name="Prénom")
    email = models.EmailField(unique=True, verbose_name="Adresse Email")
    telephone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Téléphone")
    adresse = models.TextField(blank=True, null=True, verbose_name="Adresse")
    date_embauche = models.DateField(verbose_name="Date d'embauche")
    poste = models.CharField(max_length=100, verbose_name="Poste")
    department = models.ForeignKey(
        Department, 
        on_delete=models.SET_NULL, 
        related_name='employees', 
        null=True, 
        blank=True,
        verbose_name="Département"
    )

    def __str__(self):
        return f"{self.prenom} {self.nom}"
