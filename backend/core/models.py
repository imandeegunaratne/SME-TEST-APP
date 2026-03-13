from django.db import models
from django.contrib.auth.models import User



# Bank Model
class Bank(models.Model):
    # Allow null/blank to stay compatible with earlier migrations.
    # In practice the app expects a real unique code.
    code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    name = models.CharField(max_length=200, unique=True)

    is_active = models.BooleanField(default=True)
   

    def __str__(self):
        return self.name



# Profile Model (User Roles + Approval Workflow)
class Profile(models.Model):

    ROLE_CHOICES = (
        ("BANK_ADMIN", "Bank Admin"),
        ("EVALUATOR", "Evaluator"),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    bank = models.ForeignKey(
        Bank,
        on_delete=models.PROTECT,
        related_name="profiles"
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="EVALUATOR"
    )

    is_approved = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)

    

    def __str__(self):
        return f"{self.user.username} - {self.bank.name} - {self.role}"



# SME Model
class SME(models.Model):

    bank = models.ForeignKey(
        Bank,
        on_delete=models.PROTECT,
        related_name="smes"
    )

    name = models.CharField(max_length=255)

    # BR number is unique per bank (enforced via Meta.unique_together)
    br_number = models.CharField(max_length=50)

    industry = models.CharField(
        max_length=120,
        blank=True,
        default=""
    )

    evaluator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_smes",
    )

    # scoring fields used by the frontend + report endpoints
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

        indexes = [
            models.Index(fields=["br_number"]),
           
        ]

    def __str__(self):
        return f"{self.name} ({self.br_number})"

#CriterionWeight Model
class CriterionWeight(models.Model):
    code = models.CharField(max_length=10, unique=True)  
    title = models.CharField(max_length=255)
    weight = models.DecimalField(max_digits=12, decimal_places=10)  
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} ({self.weight})"
    
class SMECriterionScore(models.Model):
    sme = models.ForeignKey("SME", on_delete=models.CASCADE, related_name="criterion_scores")
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="criterion_scores") 
    criterion_code = models.CharField(max_length=10)  # C1..C10
    score = models.PositiveSmallIntegerField(null=True, blank=True)  # 1..10
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, default="")
    followup = models.BooleanField(default=False)
    class Meta:
        unique_together = ("sme", "evaluator", "criterion_code")

    def __str__(self):
        return f"{self.sme_id} {self.criterion_code} = {self.score}"