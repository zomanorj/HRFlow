from rest_framework import serializers
from .models import ActivityLog

class ActivityLogSerializer(serializers.ModelSerializer):
    user_display = serializers.CharField(source='user.username', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ('id', 'user', 'user_display', 'action', 'action_display', 'target_type', 'target_id', 'description', 'created_at')
        read_only_fields = ('id', 'created_at')
