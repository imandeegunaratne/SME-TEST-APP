from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.contrib.auth.models import User


class Bank(models.Model):
    # code is required and unique — null removed to enforce data integrity
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Profile(models.Model):
    ROLE_CHOICES = (
        ("BANK_ADMIN", "Bank Admin"),
        ("EVALUATOR", "Evaluator"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bank = models.ForeignKey(Bank, on_delete=models.PROTECT, related_name="profiles")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="EVALUATOR")
    is_approved = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.bank.name} - {self.role}"


class SME(models.Model):
    bank = models.ForeignKey(Bank, on_delete=models.PROTECT, related_name="smes")
    name = models.CharField(max_length=255)
    br_number = models.CharField(max_length=50)
    industry = models.CharField(max_length=120, blank=True, default="")

    evaluator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_smes",
    )

    is_scored = models.BooleanField(default=False)
    total_score = models.FloatField(null=True, blank=True)

    scored_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scored_smes",
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("bank", "br_number")
        indexes = [models.Index(fields=["br_number"])]

    def __str__(self):
        return f"{self.name} ({self.br_number})"


class CriterionWeight(models.Model):
    code = models.CharField(max_length=10, unique=True)
    title = models.CharField(max_length=255)
    weight = models.DecimalField(max_digits=12, decimal_places=10)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} ({self.weight})"


class SMECriterionScore(models.Model):
    sme = models.ForeignKey(SME, on_delete=models.CASCADE, related_name="criterion_scores")
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="criterion_scores")
    criterion_code = models.CharField(max_length=10)

    # Validators enforce 1–10 at the model level regardless of how data enters
    score = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
    )

    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, default="")
    followup = models.BooleanField(default=False)

    class Meta:
        unique_together = ("sme", "evaluator", "criterion_code")

    def __str__(self):
        return f"{self.sme_id} {self.criterion_code} = {self.score}"


class EvaluatorNotification(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="evaluator_notifications"
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class LoginAttempt(models.Model):
    username = models.CharField(max_length=150)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    failed_count = models.PositiveSmallIntegerField(default=0)
    first_failed_at = models.DateTimeField(auto_now_add=True)
    last_failed_at = models.DateTimeField(auto_now=True)
    locked_until = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("username", "ip_address")
        indexes = [
            models.Index(fields=["username", "ip_address"]),
            models.Index(fields=["locked_until"]),
        ]

    def __str__(self):
        return f"{self.username} from {self.ip_address or 'unknown'}"


class AuditLog(models.Model):
    ACTION_CHOICES = (
        ("LOGIN_SUCCESS", "Login success"),
        ("LOGIN_FAILURE", "Login failure"),
        ("LOGIN_LOCKED", "Login locked"),
        ("EVALUATOR_APPROVED", "Evaluator approved"),
        ("EVALUATOR_DISAPPROVED", "Evaluator disapproved"),
        ("EVALUATOR_BLOCKED", "Evaluator blocked"),
        ("EVALUATOR_UNBLOCKED", "Evaluator unblocked"),
    )

    actor = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_events",
    )
    target_user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="targeted_audit_events",
    )
    action = models.CharField(max_length=40, choices=ACTION_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default="")
    detail = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["action", "created_at"]),
            models.Index(fields=["actor", "created_at"]),
            models.Index(fields=["target_user", "created_at"]),
        ]

    def __str__(self):
        return f"{self.action} at {self.created_at:%Y-%m-%d %H:%M:%S}"
