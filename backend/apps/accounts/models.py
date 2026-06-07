from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('HR', 'RH'),
        ('EMPLOYEE', 'Employé'),
    )
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='EMPLOYEE')
    email = models.EmailField(unique=True)

    # Use email or username for login. AbstractUser uses username by default, which is fine, 
    # but we enforce that email is unique and can also be used.
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
