from django.db import models

class Department(models.Model):
    nom = models.CharField(max_length=100, unique=True, verbose_name="Nom du département")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")

    def __str__(self):
        return self.nom
