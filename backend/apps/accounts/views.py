from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer, UserSerializer
from .models import User
from .permissions import IsAdminOrHR

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        data = serializer.data
        
        # Si l'utilisateur est lié à un profil employé, on l'ajoute à la réponse
        if hasattr(user, 'employee_profile'):
            employee = user.employee_profile
            data['employee_id'] = employee.id
            data['employee_nom'] = employee.nom
            data['employee_prenom'] = employee.prenom
            data['poste'] = employee.poste
            if employee.department:
                data['department_id'] = employee.department.id
                data['department_nom'] = employee.department.nom
        
        return Response(data)


class UserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrHR]

    def get(self, request):
        """Retourner la liste des utilisateurs pour les filtres Admin"""
        users = User.objects.all().values('id', 'username', 'email', 'role')
        return Response(list(users))
