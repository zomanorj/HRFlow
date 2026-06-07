from rest_framework import viewsets
from apps.accounts.permissions import IsHR, IsEmployee
from .models import Employee
from .serializers import EmployeeSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by('nom', 'prenom')
    serializer_class = EmployeeSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            permission_classes = [IsHR]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsEmployee]
        else:
            permission_classes = [IsEmployee]
        return [permission() for permission in permission_classes]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        # Si c'est une modification, l'utilisateur doit être Admin/RH OU modifier son propre profil
        if self.action in ['update', 'partial_update']:
            if request.user.role not in ['ADMIN', 'HR'] and obj.user != request.user:
                self.permission_denied(
                    request, 
                    message="Vous n'avez pas l'autorisation de modifier le profil d'un autre employé."
                )
