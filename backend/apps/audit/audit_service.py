from .models import ActivityLog

def log_activity(user, action, target_type, description, target_id=None):
    """
    Enregistre une activité dans le log d'audit.
    
    Args:
        user: L'utilisateur qui a effectué l'action
        action: Le type d'action (utiliser les constantes ACTION_CHOICES)
        target_type: Le type de cible (ex: 'Employee', 'Department')
        description: La description détaillée de l'action
        target_id: L'ID de la cible (optionnel)
    """
    return ActivityLog.objects.create(
        user=user,
        action=action,
        target_type=target_type,
        target_id=target_id,
        description=description
    )
