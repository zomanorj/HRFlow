from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Sécurité : Un utilisateur ne peut voir et agir que sur ses propres notifications
        return Notification.objects.filter(recipient=self.request.user)

    def perform_create(self, serializer):
        serializer.save(recipient=self.request.user)

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['put', 'post'])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(
            {"message": "Notification marquée comme lue.", "data": NotificationSerializer(notification).data},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['put', 'post'], url_path='read-all')
    def read_all(self, request):
        unread = self.get_queryset().filter(is_read=False)
        count = unread.update(is_read=True)
        return Response(
            {"message": f"{count} notifications marquées comme lues."},
            status=status.HTTP_200_OK
        )
