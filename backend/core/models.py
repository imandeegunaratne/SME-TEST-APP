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


class BankLicense(models.Model):
    PLAN_CHOICES = (
        ("DEMO", "Demo"),
        ("PILOT", "Pilot"),
        ("ENTERPRISE", "Enterprise"),
    )
    STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("TRIAL", "Trial"),
        ("SUSPENDED", "Suspended"),
        ("EXPIRED", "Expired"),
    )

    bank = models.OneToOneField(Bank, on_delete=models.CASCADE, related_name="license")
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default="DEMO")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="TRIAL")
    seats = models.PositiveIntegerField(default=10)
    max_smes = models.PositiveIntegerField(default=100)
    max_evaluations = models.PositiveIntegerField(default=100)
    starts_on = models.DateField(null=True, blank=True)
    expires_on = models.DateField(null=True, blank=True)
    features = models.JSONField(default=dict, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["status", "expires_on"], name="core_bankli_status_6e0213_idx"),
            models.Index(fields=["plan"], name="core_bankli_plan_b092d8_idx"),
        ]

    @property
    def is_valid(self):
        from django.utils import timezone

        if self.status not in {"ACTIVE", "TRIAL"}:
            return False
        today = timezone.localdate()
        if self.starts_on and self.starts_on > today:
            return False
        return self.expires_on is None or self.expires_on >= today

    def __str__(self):
        return f"{self.bank.code} - {self.plan} ({self.status})"


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

    class Meta:
        indexes = [
            models.Index(fields=["bank", "role", "is_active"], name="core_profil_bank_id_b6763d_idx"),
            models.Index(fields=["bank", "role", "is_approved"], name="core_profil_bank_id_a94697_idx"),
        ]

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
    evaluated_at = models.DateTimeField(null=True, blank=True)

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
        indexes = [
            models.Index(fields=["br_number"], name="core_sme_br_numb_723eed_idx"),
            models.Index(fields=["bank", "is_active", "is_scored"], name="core_sme_bank_id_c27fd2_idx"),
            models.Index(fields=["bank", "industry", "is_scored"], name="core_sme_bank_id_fc54cf_idx"),
            models.Index(fields=["bank", "scored_by", "is_scored"], name="core_sme_bank_id_43c3c8_idx"),
        ]

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
        indexes = [
            models.Index(fields=["sme", "evaluator"], name="core_smecri_sme_id_6eaf50_idx"),
            models.Index(fields=["criterion_code"], name="core_smecri_criteri_b41b76_idx"),
        ]

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
        indexes = [
            models.Index(fields=["user", "is_read", "created_at"], name="core_evalua_user_id_9e2a72_idx"),
        ]

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
            models.Index(fields=["username", "ip_address"], name="core_logina_usernam_a2eb75_idx"),
            models.Index(fields=["locked_until"], name="core_logina_locked__14b664_idx"),
        ]

    def __str__(self):
        return f"{self.username} from {self.ip_address or 'unknown'}"


class AuditLog(models.Model):
    ACTION_CHOICES = (
        ("LOGIN_SUCCESS", "Login success"),
        ("LOGIN_FAILURE", "Login failure"),
        ("LOGIN_LOCKED", "Login locked"),
        ("BANK_CREATED", "Bank created"),
        ("BANK_ADMIN_CREATED", "Bank admin created"),
        ("EVALUATOR_APPROVED", "Evaluator approved"),
        ("EVALUATOR_DISAPPROVED", "Evaluator disapproved"),
        ("EVALUATOR_BLOCKED", "Evaluator blocked"),
        ("EVALUATOR_UNBLOCKED", "Evaluator unblocked"),
        ("PASSWORD_CHANGED", "Password changed"),
        ("BANK_ADMIN_PASSWORD_RESET", "Bank admin password reset"),
        ("SME_CREATED", "SME created"),
        ("SME_SCORES_SAVED", "SME scores saved"),
        ("SME_SUBMITTED", "SME submitted"),
        ("REPORT_EXPORTED", "Report exported"),
        ("LICENSE_UPDATED", "License updated"),
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
            models.Index(fields=["action", "created_at"], name="core_auditl_action_29a2bf_idx"),
            models.Index(fields=["actor", "created_at"], name="core_auditl_actor_i_41600a_idx"),
            models.Index(fields=["target_user", "created_at"], name="core_auditl_target__059065_idx"),
        ]

    def __str__(self):
        return f"{self.action} at {self.created_at:%Y-%m-%d %H:%M:%S}"
