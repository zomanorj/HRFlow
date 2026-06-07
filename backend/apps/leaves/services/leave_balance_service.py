from ..models import LeaveRequest

def calculate_used_leave_days(employee) -> int:
    """
    Calcule le total des jours de congés approuvés pris par l'employé.
    Un congé approuvé de start_date à end_date compte pour (end_date - start_date) + 1 jours.
    """
    approved_leaves = LeaveRequest.objects.filter(employee=employee, status='APPROVED')
    used_days = sum((leave.end_date - leave.start_date).days + 1 for leave in approved_leaves)
    return used_days

def calculate_leave_balance(employee) -> dict:
    """
    Calcule le solde de congés restants d'un employé (base annuelle de 30 jours).
    """
    allocated = 30
    used = calculate_used_leave_days(employee)
    remaining = max(0, allocated - used)
    return {
        "allocated": allocated,
        "used": used,
        "remaining": remaining
    }
