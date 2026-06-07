from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from datetime import date
from apps.accounts.models import User
from apps.employees.models import Employee
from apps.departments.models import Department
from apps.leaves.models import LeaveRequest
from apps.notifications.models import Notification
from apps.notifications.services import create_notification

class NotificationsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Utilisateurs
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
        
        # Profils
        self.employee = Employee.objects.create(
            user=self.employee_user,
            nom='Dupont',
            prenom='Jean',
            email='jean.dupont@hrflow.com',
            date_embauche=date.today(),
            poste='Développeur'
        )

    def test_create_notification_service(self):
        notif = create_notification(self.employee_user, "Test Title", "Test Message", type='INFO')
        self.assertEqual(notif.recipient, self.employee_user)
        self.assertEqual(notif.title, "Test Title")
        self.assertEqual(notif.message, "Test Message")
        self.assertEqual(notif.type, 'INFO')
        self.assertFalse(notif.is_read)

    def test_api_endpoints_owner_only(self):
        # Création de notifications pour Jean
        create_notification(self.employee_user, "Title 1", "Msg 1")
        create_notification(self.employee_user, "Title 2", "Msg 2")

        # Création d'une notification pour HR
        create_notification(self.hr_user, "Title HR", "Msg HR")

        # Authentifier en tant que Jean
        self.client.force_authenticate(user=self.employee_user)

        # GET /api/notifications/
        url = reverse('notification-list')
        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        titles = [item["title"] for item in response.data]

        # Vérifier que Jean voit ses notifications
        self.assertIn("Title 1", titles)
        self.assertIn("Title 2", titles)

        # Vérifier qu'il ne voit pas celles des RH
        self.assertNotIn("Title HR", titles)

        # GET /api/notifications/unread-count/
        url_count = reverse('notification-unread-count')
        response_count = self.client.get(url_count)

        self.assertEqual(
            response_count.status_code,
            status.HTTP_200_OK
        )

        # Au moins 2 notifications non lues
        self.assertGreaterEqual(
            response_count.data['unread_count'],
            2
        )

    def test_api_read_and_delete_actions(self):
        notif = create_notification(self.employee_user, "Unread Title", "Unread Message")
        self.client.force_authenticate(user=self.employee_user)
        
        # Marquer comme lu
        url_read = reverse('notification-read', args=[notif.id])
        response_read = self.client.post(url_read)
        self.assertEqual(response_read.status_code, status.HTTP_200_OK)
        
        # Vérifier en DB
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)
        
        # Supprimer
        url_delete = reverse('notification-detail', args=[notif.id])
        response_delete = self.client.delete(url_delete)
        self.assertEqual(response_delete.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Notification.objects.filter(id=notif.id).count(), 0)

    def test_api_read_all(self):
        create_notification(self.employee_user, "Title 1", "Msg 1")
        create_notification(self.employee_user, "Title 2", "Msg 2")
        
        self.client.force_authenticate(user=self.employee_user)
        
        url_read_all = reverse('notification-read-all')
        response = self.client.post(url_read_all)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Vérifier qu'il n'y a plus de notifications non lues
        unread_count = Notification.objects.filter(recipient=self.employee_user, is_read=False).count()
        self.assertEqual(unread_count, 0)

    def test_signals_leaves(self):
        # Création d'une nouvelle demande de congé -> doit notifier les RH (hr_user)
        leave = LeaveRequest.objects.create(
            employee=self.employee,
            start_date=date.today(),
            end_date=date.today(),
            reason='Rdv Médical'
        )
        
        # HR doit avoir reçu une notification
        hr_notifs = Notification.objects.filter(recipient=self.hr_user)
        titles = list(
            hr_notifs.values_list("title", flat=True)
        )

        self.assertTrue(
            any(
                "Nouvelle demande de congé" in title
                for title in titles
            )
        )
        
        # Approbation du congé -> doit notifier l'employé
        leave.status = 'APPROVED'
        leave.save()
        
        emp_notifs = Notification.objects.filter(recipient=self.employee_user)
        self.assertTrue(emp_notifs.exists())
        self.assertIn("Demande de congé approuvée", emp_notifs[0].title)
