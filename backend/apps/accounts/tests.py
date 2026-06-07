from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from apps.departments.models import Department
from apps.employees.models import Employee
from apps.leaves.models import LeaveRequest
from apps.attendance.models import Attendance
from datetime import date, timedelta

User = get_user_model()

class HRFlowAPITests(APITestCase):

    def setUp(self):
        # Création d'un département
        self.department = Department.objects.create(nom="IT", description="Service Informatique")
        
        # Création des utilisateurs
        self.admin_user = User.objects.create_user(
            username="admin_test", email="admin@test.com", password="password123", role="ADMIN"
        )
        self.hr_user = User.objects.create_user(
            username="hr_test", email="hr@test.com", password="password123", role="HR"
        )
        self.emp_user = User.objects.create_user(
            username="employee_test", email="employee@test.com", password="password123", role="EMPLOYEE"
        )

        # Profil employé pour l'utilisateur normal
        self.employee = Employee.objects.create(
            user=self.emp_user,
            nom="Test",
            prenom="Employee",
            email="employee@test.com",
            date_embauche=date.today(),
            poste="Développeur",
            department=self.department
        )

    def get_token(self, username, password):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': username, 'password': password})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data['access']

    def test_login_and_jwt(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': 'employee_test', 'password': 'password123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], 'EMPLOYEE')

    def test_auth_me(self):
        token = self.get_token('employee_test', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = reverse('auth_me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'employee_test')
        self.assertEqual(response.data['employee_nom'], 'Test')

    def test_create_department_permission(self):
        # L'employé standard ne doit PAS pouvoir créer de département
        token = self.get_token('employee_test', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        url = reverse('department-list')
        response = self.client.post(url, {'nom': 'Marketing', 'description': 'Service Marketing'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Le RH doit pouvoir le faire
        token = self.get_token('hr_test', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(url, {'nom': 'Marketing', 'description': 'Service Marketing'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_attendance_check_in_out(self):
        token = self.get_token('employee_test', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Check-in
        url_in = reverse('attendance-check-in')
        response = self.client.post(url_in)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('check_in', response.data['data'])
        
        # Un deuxième check-in le même jour doit échouer (code 400)
        response = self.client.post(url_in)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Check-out
        url_out = reverse('attendance-check-out')
        response = self.client.post(url_out)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data['data']['check_out'])
        self.assertIsNotNone(response.data['data']['hours_worked'])

    def test_leave_request_validation(self):
        token = self.get_token('employee_test', 'password123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        url = reverse('leave-list')
        
        # Date fin avant date début -> Échec
        data = {
            'start_date': str(date.today() + timedelta(days=5)),
            'end_date': str(date.today() + timedelta(days=2)),
            'reason': 'Vacances'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Dates correctes -> Succès
        data['end_date'] = str(date.today() + timedelta(days=10))
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'PENDING')
