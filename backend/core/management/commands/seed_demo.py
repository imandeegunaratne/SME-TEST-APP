from decimal import Decimal

from django.contrib.auth.models import User
from django.core.management import call_command
from django.core.management.base import BaseCommand

from core.models import AuditLog, Bank, BankLicense, CriterionWeight, EvaluatorNotification, Profile, SME, SMECriterionScore
from core.views import _compute_capability_excel


DEMO_PASSWORD = "DemoPass123!"


class Command(BaseCommand):
    help = "Create demo-ready banking users, SMEs, scores, notifications, and audit events."

    def handle(self, *args, **kwargs):
        call_command("seed_weights")

        bank, _ = Bank.objects.update_or_create(
            code="NEXBANK",
            defaults={"name": "Nexus Commercial Bank", "is_active": True},
        )
        BankLicense.objects.update_or_create(
            bank=bank,
            defaults={
                "status": "ACTIVE",
                "seats": 50,
                "max_smes": 500,
                "features": {
                    "audit_logs": True,
                    "csv_export": True,
                    "pdf_reports": True,
                    "demo_mode": True,
                },
            },
        )

        superuser, _ = User.objects.update_or_create(
            username="demo_superadmin",
            defaults={"email": "superadmin@nexusbank.demo", "is_staff": True, "is_superuser": True, "is_active": True},
        )
        superuser.set_password(DEMO_PASSWORD)
        superuser.save()

        bank_admin, _ = User.objects.update_or_create(
            username="demo_bankadmin",
            defaults={
                "first_name": "Ayesha",
                "last_name": "Fernando",
                "email": "bankadmin@nexusbank.demo",
                "is_active": True,
            },
        )
        bank_admin.set_password(DEMO_PASSWORD)
        bank_admin.save()
        Profile.objects.update_or_create(
            user=bank_admin,
            defaults={"bank": bank, "role": "BANK_ADMIN", "is_approved": True, "is_active": True},
        )

        evaluators = []
        for username, first_name, last_name in [
            ("demo_evaluator", "Nimal", "Perera"),
            ("demo_evaluator2", "Sara", "Jayasinghe"),
        ]:
            user, _ = User.objects.update_or_create(
                username=username,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": f"{username}@nexusbank.demo",
                    "is_active": True,
                },
            )
            user.set_password(DEMO_PASSWORD)
            user.save()
            Profile.objects.update_or_create(
                user=user,
                defaults={"bank": bank, "role": "EVALUATOR", "is_approved": True, "is_active": True},
            )
            evaluators.append(user)

        pending_user, _ = User.objects.update_or_create(
            username="pending_evaluator",
            defaults={
                "first_name": "Pending",
                "last_name": "User",
                "email": "pending@nexusbank.demo",
                "is_active": False,
            },
        )
        pending_user.set_password(DEMO_PASSWORD)
        pending_user.save()
        Profile.objects.update_or_create(
            user=pending_user,
            defaults={"bank": bank, "role": "EVALUATOR", "is_approved": False, "is_active": False},
        )

        weights = {
            item.code: {"weight": Decimal(str(item.weight)), "title": item.title}
            for item in CriterionWeight.objects.filter(is_active=True)
        }

        demo_smes = [
            ("Ceylon Foods Exporters", "BR-DEMO-001", "Food & Beverage", evaluators[0], [8, 7, 7, 6, 8, 7, 9, 8, 6, 7]),
            ("Lanka Precision Tools", "BR-DEMO-002", "Manufacturing", evaluators[1], [7, 6, 8, 7, 7, 8, 7, 7, 5, 8]),
            ("GreenPay Logistics", "BR-DEMO-003", "Logistics", evaluators[0], [6, 8, 6, 7, 8, 6, 8, 6, 7, 7]),
            ("Metro Health Supplies", "BR-DEMO-004", "Healthcare", evaluators[1], [9, 8, 7, 8, 8, 7, 8, 9, 7, 8]),
        ]

        for name, br_number, industry, evaluator, scores in demo_smes:
            sme, _ = SME.objects.update_or_create(
                bank=bank,
                br_number=br_number,
                defaults={"name": name, "industry": industry, "evaluator": evaluator, "is_active": True},
            )
            scores_by_code = {}
            for index, code in enumerate(sorted(weights.keys(), key=lambda value: int(value[1:]))):
                score = scores[index]
                SMECriterionScore.objects.update_or_create(
                    sme=sme,
                    evaluator=evaluator,
                    criterion_code=code,
                    defaults={
                        "score": score,
                        "notes": "Demo assessment evidence captured for bank presentation.",
                        "followup": score <= 6,
                    },
                )
                scores_by_code[code] = {"score": score, "notes": "", "followup": score <= 6}

            capability, _, _ = _compute_capability_excel(scores_by_code, weights)
            sme.total_score = capability
            sme.is_scored = True
            sme.scored_by = evaluator
            sme.save(update_fields=["total_score", "is_scored", "scored_by", "evaluator"])

        SME.objects.update_or_create(
            bank=bank,
            br_number="BR-DEMO-005",
            defaults={
                "name": "Harbor Retail Network",
                "industry": "Retail",
                "evaluator": evaluators[0],
                "is_scored": False,
                "total_score": None,
                "scored_by": None,
                "is_active": True,
            },
        )

        EvaluatorNotification.objects.update_or_create(
            user=evaluators[0],
            title="Demo Workflow Ready",
            defaults={"message": "A pending SME assessment is ready for guided demonstration.", "is_read": False},
        )

        AuditLog.objects.get_or_create(
            actor=bank_admin,
            action="BANK_CREATED",
            defaults={"detail": {"bank_id": bank.id, "bank_code": bank.code, "source": "seed_demo"}},
        )

        self.stdout.write(self.style.SUCCESS("Demo data created."))
        self.stdout.write("Users: demo_superadmin, demo_bankadmin, demo_evaluator, demo_evaluator2")
        self.stdout.write(f"Password for all demo users: {DEMO_PASSWORD}")
