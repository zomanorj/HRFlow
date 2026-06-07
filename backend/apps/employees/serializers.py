from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from apps.departments.models import Department
from apps.departments.serializers import DepartmentSerializer
from .models import Employee

User = get_user_model()

class EmployeeSerializer(serializers.ModelSerializer):
    department_detail = DepartmentSerializer(source='department', read_only=True)
    username = serializers.CharField(write_only=True, required=False)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, write_only=True, default='EMPLOYEE')
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = Employee
        fields = (
            'id', 'user_id', 'user_role', 'nom', 'prenom', 'email', 
            'telephone', 'adresse', 'date_embauche', 'poste', 
            'department', 'department_detail', 'username', 'role'
        )
        read_only_fields = ('id', 'user_id', 'user_role')

    @transaction.atomic
    def create(self, validated_data):
        username = validated_data.pop('username', None)
        role = validated_data.pop('role', 'EMPLOYEE')
        email = validated_data.get('email')
        
        # Si aucun username n'est fourni, on prend la partie locale de l'email
        if not username:
            username = email.split('@')[0]
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

        # Vérifier si un compte avec cet email existe déjà
        user = User.objects.filter(email=email).first()
        if not user:
            # Création du compte utilisateur avec un mot de passe par défaut
            user = User.objects.create_user(
                username=username,
                email=email,
                password="HRFlowPassword123!", # Mot de passe initial
                first_name=validated_data.get('prenom', ''),
                last_name=validated_data.get('nom', ''),
                role=role
            )
        
        employee = Employee.objects.create(user=user, **validated_data)
        return employee

    @transaction.atomic
    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        email = validated_data.get('email', instance.email)
        
        # Mise à jour des champs de l'employé
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Synchronisation du compte utilisateur lié
        if instance.user:
            user = instance.user
            user.email = email
            user.first_name = instance.prenom
            user.last_name = instance.nom
            if role:
                user.role = role
            user.save()

        return instance
