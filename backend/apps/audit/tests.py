from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.employees.models import Employee
from apps.departments.models import Department
from .models import ActivityLog
from .audit_service import log_activity

User = get_user_model()

class AuditLogTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='HR'
        )
        self.department = Department.objects.create(nom='IT', description='Information Technology')

    def test_log_activity(self):
        """Test that log_activity creates an entry"""
        log = log_activity(
            user=self.user,
            action='CREATE_EMPLOYEE',
            target_type='Employee',
            description='Test employee creation'
        )
        self.assertTrue(ActivityLog.objects.filter(id=log.id).exists())
        self.assertEqual(log.user, self.user)
        self.assertEqual(log.action, 'CREATE_EMPLOYEE')

    def test_employee_creation_logged(self):
        """Test that employee creation is automatically logged"""
        employee = Employee.objects.create(
            nom='Dupont',
            prenom='Jean',
            email='jean.dupont@example.com',
            poste='Développeur',
            date_embauche='2024-01-01',
            department=self.department
        )
        
        logs = ActivityLog.objects.filter(action='CREATE_EMPLOYEE', target_id=str(employee.id))
        self.assertTrue(logs.exists())

    def test_department_creation_logged(self):
        """Test that department creation is automatically logged"""
        initial_count = ActivityLog.objects.filter(action='CREATE_DEPARTMENT').count()
        
        Department.objects.create(nom='HR', description='Human Resources')
        
        final_count = ActivityLog.objects.filter(action='CREATE_DEPARTMENT').count()
        self.assertEqual(final_count, initial_count + 1)
