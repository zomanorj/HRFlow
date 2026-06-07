from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from datetime import date, timedelta
from apps.accounts.models import User
from apps.employees.models import Employee
from apps.leaves.models import LeaveRequest
from apps.leaves.services.leave_balance_service import calculate_used_leave_days, calculate_leave_balance

class LeaveBalanceTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Création des utilisateurs
        self.employee_user = User.objects.create_user(
            username='jean.dupont',
            email='jean.dupont@hrflow.com',
            password='password123',
            role='EMPLOYEE'
        )
        
        self.hr_user = User.objects.create_user(
            username='hr.admin',
            email='hr.admin@hrflow.com',
            password='password123',
            role='HR'
        )
        
        # Création du profil employé
        self.employee = Employee.objects.create(
            user=self.employee_user,
            nom='Dupont',
            prenom='Jean',
            email='jean.dupont@hrflow.com',
            date_embauche=date.today(),
            poste='Développeur'
        )
        
        self.hr_employee = Employee.objects.create(
            user=self.hr_user,
            nom='Admin',
            prenom='HR',
            email='hr.admin@hrflow.com',
            date_embauche=date.today(),
            poste='Responsable RH'
        )

    def test_calculate_used_leave_days_empty(self):
        # Sans demande de congé
        used = calculate_used_leave_days(self.employee)
        self.assertEqual(used, 0)
        
        balance = calculate_leave_balance(self.employee)
        self.assertEqual(balance['allocated'], 30)
        self.assertEqual(balance['used'], 0)
        self.assertEqual(balance['remaining'], 30)

    def test_calculate_used_leave_days_with_leaves(self):
        # Une demande de congé approuvée de 3 jours
        LeaveRequest.objects.create(
            employee=self.employee,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=2), # 3 jours au total (inclusif)
            status='APPROVED',
            reason='Vacances'
        )
        
        # Une demande de congé rejetée (ne doit pas compter)
        LeaveRequest.objects.create(
            employee=self.employee,
            start_date=date.today() + timedelta(days=10),
            end_date=date.today() + timedelta(days=12),
            status='REJECTED',
            reason='Autre'
        )
        
        # Une demande de congé en attente (ne doit pas compter)
        LeaveRequest.objects.create(
            employee=self.employee,
            start_date=date.today() + timedelta(days=20),
            end_date=date.today() + timedelta(days=22),
            status='PENDING',
            reason='Autre 2'
        )
        
        used = calculate_used_leave_days(self.employee)
        self.assertEqual(used, 3)
        
        balance = calculate_leave_balance(self.employee)
        self.assertEqual(balance['allocated'], 30)
        self.assertEqual(balance['used'], 3)
        self.assertEqual(balance['remaining'], 27)

    def test_api_balance_authenticated_employee(self):
        # Authentification de l'employé
        self.client.force_authenticate(user=self.employee_user)
        
        # Ajout d'une demande approuvée de 5 jours
        LeaveRequest.objects.create(
            employee=self.employee,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=4), # 5 jours
            status='APPROVED',
            reason='Vacances'
        )
        
        url = reverse('leave-balance')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['allocated'], 30)
        self.assertEqual(response.data['used'], 5)
        self.assertEqual(response.data['remaining'], 25)

    def test_api_balance_hr_viewing_employee(self):
        # Authentification RH
        self.client.force_authenticate(user=self.hr_user)
        
        # Ajout d'une demande approuvée de 2 jours pour l'employé
        LeaveRequest.objects.create(
            employee=self.employee,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=1), # 2 jours
            status='APPROVED',
            reason='Vacances'
        )
        
        url = f"{reverse('leave-balance')}?employee_id={self.employee.id}"
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['allocated'], 30)
        self.assertEqual(response.data['used'], 2)
        self.assertEqual(response.data['remaining'], 28)
