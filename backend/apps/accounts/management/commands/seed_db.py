from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta
from apps.departments.models import Department
from apps.employees.models import Employee
from apps.leaves.models import LeaveRequest
from apps.attendance.models import Attendance

User = get_user_model()

class Command(BaseCommand):
    help = "Peuple la base de données avec des données de test réalistes malgaches"

    def handle(self, *args, **kwargs):
        self.stdout.write("Début du peuplement de la base de données (version malgache)...")

        # 1. Nettoyage des anciennes données
        Attendance.objects.all().delete()
        LeaveRequest.objects.all().delete()
        Employee.objects.all().delete()
        Department.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write("Base nettoyée.")

        # 2. Création des Départements
        dep_rh = Department.objects.create(nom="Ressources Humaines", description="Gestion des talents et administration")
        dep_tech = Department.objects.create(nom="Technologie et Informatique", description="Développement produit et infrastructures")
        dep_sales = Department.objects.create(nom="Ventes et Marketing", description="Acquisition clients et communication")
        dep_finance = Department.objects.create(nom="Finances et Comptabilité", description="Gestion financière et budgétaire")

        self.stdout.write("Départements créés.")

        # 3. Création du compte administrateur superuser
        admin_user = User.objects.create_superuser(
            username="admin",
            email="admin@hrflow.mg",
            password="HRFlowPassword123!",
            first_name="Marc",
            last_name="Super",
            role="ADMIN"
        )

        self.stdout.write("Compte administrateur créé.")

        # 4. Liste des 10 Employés avec des noms et numéros malgaches
        employees_data = [
            {
                "username": "rh",
                "email": "rh@hrflow.mg",
                "first_name": "Lalatiana",
                "last_name": "Rakotomalala",
                "role": "HR",
                "telephone": "034 11 234 56",
                "adresse": "Lot IVG 45 Bis Ankorondrano, Antananarivo",
                "date_embauche": date(2023, 1, 15),
                "poste": "Responsable RH",
                "department": dep_rh
            },
            {
                "username": "andry.andria",
                "email": "andry.andria@hrflow.mg",
                "first_name": "Andry",
                "last_name": "Andriamananarivo",
                "role": "EMPLOYEE",
                "telephone": "032 45 678 90",
                "adresse": "Lot II M 80 Andohalo, Antananarivo",
                "date_embauche": date(2024, 3, 1),
                "poste": "Développeur Python / Django",
                "department": dep_tech
            },
            {
                "username": "nirina.rambo",
                "email": "nirina.rambo@hrflow.mg",
                "first_name": "Nirina",
                "last_name": "Rambofasalama",
                "role": "EMPLOYEE",
                "telephone": "033 12 345 67",
                "adresse": "Lot IPJ 23 Ambatoroka, Antananarivo",
                "date_embauche": date(2024, 5, 10),
                "poste": "UX / UI Designer",
                "department": dep_tech
            },
            {
                "username": "hery.rajao",
                "email": "hery.rajao@hrflow.mg",
                "first_name": "Hery",
                "last_name": "Rajaonarimampianina",
                "role": "EMPLOYEE",
                "telephone": "034 56 789 12",
                "adresse": "Lot III F 44 Ambohitrarahaba, Antananarivo",
                "date_embauche": date(2023, 6, 1),
                "poste": "Administrateur Système",
                "department": dep_tech
            },
            {
                "username": "mamy.harimisa",
                "email": "mamy.harimisa@hrflow.mg",
                "first_name": "Mamy",
                "last_name": "Harimisa",
                "role": "EMPLOYEE",
                "telephone": "032 11 987 65",
                "adresse": "Lot IVN 12 Talatamaty, Antananarivo",
                "date_embauche": date(2022, 10, 1),
                "poste": "Comptable Senior",
                "department": dep_finance
            },
            {
                "username": "rado.ravelo",
                "email": "rado.ravelo@hrflow.mg",
                "first_name": "Rado",
                "last_name": "Raveloson",
                "role": "EMPLOYEE",
                "telephone": "033 99 888 77",
                "adresse": "Lot II Y 15 Bis Itaosy, Antananarivo",
                "date_embauche": date(2024, 1, 10),
                "poste": "Responsable des Ventes",
                "department": dep_sales
            },
            {
                "username": "voahangy.rahari",
                "email": "voahangy.rahari@hrflow.mg",
                "first_name": "Voahangy",
                "last_name": "Raharimalala",
                "role": "EMPLOYEE",
                "telephone": "034 22 444 66",
                "adresse": "Lot V A 99 Ambohipo, Antananarivo",
                "date_embauche": date(2023, 9, 15),
                "poste": "Assistante RH",
                "department": dep_rh
            },
            {
                "username": "sitraka.andria",
                "email": "sitraka.andria@hrflow.mg",
                "first_name": "Sitraka",
                "last_name": "Andrianandrasana",
                "role": "EMPLOYEE",
                "telephone": "032 55 555 11",
                "adresse": "Lot II N 140 Ivato, Antananarivo",
                "date_embauche": date(2024, 2, 1),
                "poste": "Développeur React / Frontend",
                "department": dep_tech
            },
            {
                "username": "tahiana.randria",
                "email": "tahiana.randria@hrflow.mg",
                "first_name": "Tahiana",
                "last_name": "Randrianarisoa",
                "role": "EMPLOYEE",
                "telephone": "033 44 333 22",
                "adresse": "Lot IA 32 Ambohibao, Antananarivo",
                "date_embauche": date(2024, 4, 15),
                "poste": "Chargée de Marketing",
                "department": dep_sales
            },
            {
                "username": "lalaina.rakoto",
                "email": "lalaina.rakoto@hrflow.mg",
                "first_name": "Lalaina",
                "last_name": "Rakotonirina",
                "role": "EMPLOYEE",
                "telephone": "034 88 999 00",
                "adresse": "Lot T II 200 Fiadanana, Antananarivo",
                "date_embauche": date(2023, 11, 1),
                "poste": "Développeur Mobile",
                "department": dep_tech
            }
        ]

        created_employees = []

        for emp_info in employees_data:
            # Créer l'utilisateur Django
            user = User.objects.create_user(
                username=emp_info["username"],
                email=emp_info["email"],
                password="HRFlowPassword123!",
                first_name=emp_info["first_name"],
                last_name=emp_info["last_name"],
                role=emp_info["role"]
            )
            
            # Créer le profil employé lié
            employee = Employee.objects.create(
                user=user,
                nom=emp_info["last_name"],
                prenom=emp_info["first_name"],
                email=emp_info["email"],
                telephone=emp_info["telephone"],
                adresse=emp_info["adresse"],
                date_embauche=emp_info["date_embauche"],
                poste=emp_info["poste"],
                department=emp_info["department"]
            )
            created_employees.append(employee)

        self.stdout.write("Les 10 profils d'employés malgaches ont été créés.")

        # 5. Création des demandes de congés
        # Lalalatiana (RH) a rejeté une demande passée
        LeaveRequest.objects.create(
            employee=created_employees[0], # Lalatiana
            start_date=date.today() - timedelta(days=12),
            end_date=date.today() - timedelta(days=10),
            reason="Affaires familiales urgentes",
            status="REJECTED"
        )

        # Andry (Dev) a une demande approuvée pour le mois prochain
        LeaveRequest.objects.create(
            employee=created_employees[1], # Andry
            start_date=date.today() + timedelta(days=15),
            end_date=date.today() + timedelta(days=20),
            reason="Voyage à Sainte-Marie",
            status="APPROVED"
        )

        # Nirina (UX Designer) a une demande en attente
        LeaveRequest.objects.create(
            employee=created_employees[2], # Nirina
            start_date=date.today() + timedelta(days=5),
            end_date=date.today() + timedelta(days=9),
            reason="Examen universitaire",
            status="PENDING"
        )

        # Rado (Sales) a une demande en attente
        LeaveRequest.objects.create(
            employee=created_employees[5], # Rado
            start_date=date.today() + timedelta(days=8),
            end_date=date.today() + timedelta(days=12),
            reason="Repos médical",
            status="PENDING"
        )

        self.stdout.write("Demandes de congés créées.")

        # 6. Création des enregistrements de présence (Pointages)
        hier = date.today() - timedelta(days=1)
        
        # Pointage d'hier pour tout le monde
        for emp in created_employees[:5]:
            Attendance.objects.create(
                employee=emp,
                date=hier,
                check_in=timezone.make_aware(timezone.datetime(hier.year, hier.month, hier.day, 8, 30 + (emp.id % 20), 0)),
                check_out=timezone.make_aware(timezone.datetime(hier.year, hier.month, hier.day, 17, 00 + (emp.id % 15), 0)),
                hours_worked=8.5
            )

        # Pointage d'aujourd'hui (Andry et Nirina arrivés à 8h30, pas encore check-out)
        Attendance.objects.create(
            employee=created_employees[1], # Andry
            date=date.today(),
            check_in=timezone.make_aware(timezone.datetime(date.today().year, date.today().month, date.today().day, 8, 32, 0))
        )
        
        Attendance.objects.create(
            employee=created_employees[2], # Nirina
            date=date.today(),
            check_in=timezone.make_aware(timezone.datetime(date.today().year, date.today().month, date.today().day, 8, 45, 0))
        )

        self.stdout.write("Enregistrements de présence créés.")
        self.stdout.write(self.style.SUCCESS("Base de données initialisée avec succès avec 10 profils malgaches !"))
