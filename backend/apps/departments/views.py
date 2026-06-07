from rest_framework import viewsets
from apps.accounts.permissions import IsHR, IsEmployee
from .models import Department
from .serializers import DepartmentSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by('-created_at')
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsEmployee]
        else:
            permission_classes = [IsHR]
        return [permission() for permission in permission_classes]
