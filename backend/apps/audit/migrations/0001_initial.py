# Generated migration for ActivityLog model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ActivityLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('CREATE_EMPLOYEE', "Création d'employé"), ('UPDATE_EMPLOYEE', "Modification d'employé"), ('DELETE_EMPLOYEE', "Suppression d'employé"), ('CREATE_DEPARTMENT', 'Création de département'), ('DELETE_DEPARTMENT', 'Suppression de département'), ('CREATE_LEAVE', 'Création de congé'), ('APPROVE_LEAVE', 'Approbation de congé'), ('REJECT_LEAVE', 'Rejet de congé'), ('CHECK_IN', 'Check-in'), ('CHECK_OUT', 'Check-out'), ('LOGIN', 'Connexion'), ('LOGOUT', 'Déconnexion')], max_length=50, verbose_name='Action')),
                ('target_type', models.CharField(max_length=50, verbose_name='Type de cible')),
                ('target_id', models.CharField(blank=True, max_length=50, null=True, verbose_name='ID de la cible')),
                ('description', models.TextField(verbose_name='Description')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Date de création')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='activity_logs', to=settings.AUTH_USER_MODEL, verbose_name='Utilisateur')),
            ],
            options={
                'verbose_name': "Log d'activité",
                'verbose_name_plural': "Logs d'activité",
            },
        ),
        migrations.AddIndex(
            model_name='activitylog',
            index=models.Index(fields=['-created_at'], name='audit_activ_created_idx'),
        ),
        migrations.AddIndex(
            model_name='activitylog',
            index=models.Index(fields=['user', '-created_at'], name='audit_activ_user_id_idx'),
        ),
        migrations.AddIndex(
            model_name='activitylog',
            index=models.Index(fields=['action'], name='audit_activ_action_idx'),
        ),
    ]
