from django.contrib import admin
from .models import ActivityLog

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'user', 'target_type', 'target_id', 'created_at')
    list_filter = ('action', 'created_at', 'target_type')
    search_fields = ('user__username', 'description', 'target_id')
    readonly_fields = ('created_at',)
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
