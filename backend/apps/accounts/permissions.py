from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Permet l'accès uniquement aux administrateurs.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'ADMIN' or request.user.is_superuser)
        )

class IsHR(permissions.BasePermission):
    """
    Permet l'accès aux administrateurs et membres des RH.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role in ['ADMIN', 'HR'] or request.user.is_superuser)
        )

class IsEmployee(permissions.BasePermission):
    """
    Permet l'accès à tout utilisateur connecté (Admin, RH ou Employé).
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


# Alias
IsAdminOrHR = IsHR
