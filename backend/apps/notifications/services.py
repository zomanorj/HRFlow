from .models import Notification

def create_notification(recipient, title, message, type='INFO'):
    """
    Crée et enregistre une notification pour un utilisateur spécifique.
    """
    return Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        type=type
    )
