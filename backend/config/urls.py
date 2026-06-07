from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('apps.accounts.urls')),
    path('api/departments/', include('apps.departments.urls')),
    path('api/employees/', include('apps.employees.urls')),
    path('api/leaves/', include('apps.leaves.urls')),
    path('api/attendance/', include('apps.attendance.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/audit/', include('apps.audit.urls')),
]
