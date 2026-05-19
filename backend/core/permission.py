from rest_framework.permissions import BasePermission


class IsBankAdmin(BasePermission):
    """Grants access only to active bank admins."""

    def has_permission(self, request, view):
        u = request.user
        return bool(
            u
            and u.is_authenticated
            and hasattr(u, "profile")
            and u.profile.role == "BANK_ADMIN"
            and u.profile.is_active
        )


class IsApprovedUser(BasePermission):
    """
    Evaluators must be approved + active.
    Bank admins must be active.
    """

    def has_permission(self, request, view):
        u = request.user
        if not (u and u.is_authenticated and hasattr(u, "profile")):
            return False

        p = u.profile

        if p.role == "BANK_ADMIN":
            return p.is_active

        if p.role == "EVALUATOR":
            return p.is_active and p.is_approved

        return False


class IsEvaluator(BasePermission):
    """Only approved and active evaluators."""

    def has_permission(self, request, view):
        u = request.user
        if not (u and u.is_authenticated and hasattr(u, "profile")):
            return False
        p = u.profile
        return bool(p.role == "EVALUATOR" and p.is_active and p.is_approved)


class IsSuperAdmin(BasePermission):
    """Only Django superusers can manage banks and bank admins."""

    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.is_active and u.is_superuser)
