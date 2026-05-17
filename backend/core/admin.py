from django.contrib import admin

from .models import AuditLog, Bank, CriterionWeight, LoginAttempt, Profile, SME, SMECriterionScore
admin.site.register(Bank)
admin.site.register(Profile)
admin.site.register(SME)
admin.site.register(CriterionWeight)
admin.site.register(SMECriterionScore)


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ("username", "ip_address", "failed_count", "locked_until", "last_failed_at")
    search_fields = ("username", "ip_address")
    list_filter = ("locked_until",)
    readonly_fields = ("first_failed_at", "last_failed_at")


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "action", "actor", "target_user", "ip_address")
    search_fields = ("action", "actor__username", "target_user__username", "ip_address")
    list_filter = ("action", "created_at")
    readonly_fields = ("actor", "target_user", "action", "ip_address", "user_agent", "detail", "created_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
