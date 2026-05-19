from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .models import AuditLog, Bank, LoginAttempt, Profile


TEST_MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


@override_settings(MIDDLEWARE=TEST_MIDDLEWARE, SECURE_SSL_REDIRECT=False)
class SecurityControlsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.bank = Bank.objects.create(code="BANK1", name="Bank One")
        self.evaluator = User.objects.create_user(username="evaluator", password="StrongPass123!")
        self.evaluator_profile = Profile.objects.create(
            user=self.evaluator,
            bank=self.bank,
            role="EVALUATOR",
            is_approved=False,
            is_active=False,
        )
        self.admin_user = User.objects.create_user(username="admin", password="StrongPass123!")
        Profile.objects.create(
            user=self.admin_user,
            bank=self.bank,
            role="BANK_ADMIN",
            is_approved=True,
            is_active=True,
        )

    def test_health_endpoint_is_public(self):
        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "ok")

    @override_settings(LOGIN_LOCKOUT_MAX_FAILURES=3, LOGIN_LOCKOUT_WINDOW_SECONDS=900, LOGIN_LOCKOUT_SECONDS=900)
    def test_failed_login_locks_username_and_ip(self):
        payload = {"username": "evaluator", "password": "wrong-password"}

        for _ in range(3):
            self.client.post("/api/login/", payload, format="json", REMOTE_ADDR="10.1.1.10")

        response = self.client.post("/api/login/", payload, format="json", REMOTE_ADDR="10.1.1.10")

        self.assertEqual(response.status_code, 429)
        self.assertTrue(LoginAttempt.objects.filter(username="evaluator", locked_until__isnull=False).exists())
        self.assertTrue(AuditLog.objects.filter(action="LOGIN_LOCKED").exists())

    def test_successful_login_clears_failed_attempts_and_writes_audit_log(self):
        LoginAttempt.objects.create(username="admin", ip_address="10.1.1.20", failed_count=2)

        response = self.client.post(
            "/api/login/",
            {"username": "admin", "password": "StrongPass123!"},
            format="json",
            REMOTE_ADDR="10.1.1.20",
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(LoginAttempt.objects.filter(username="admin", ip_address="10.1.1.20").exists())
        self.assertTrue(AuditLog.objects.filter(action="LOGIN_SUCCESS", target_user=self.admin_user).exists())

    def test_bank_admin_action_writes_audit_log(self):
        token = Token.objects.create(user=self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        response = self.client.post(f"/api/bank-admin/approve-evaluator/{self.evaluator_profile.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            AuditLog.objects.filter(
                action="EVALUATOR_APPROVED",
                actor=self.admin_user,
                target_user=self.evaluator,
            ).exists()
        )

    def test_super_admin_can_create_bank_admin(self):
        superuser = User.objects.create_superuser(
            username="owner",
            email="owner@example.com",
            password="StrongPass123!",
        )
        token = Token.objects.create(user=superuser)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        response = self.client.post(
            "/api/super-admin/bank-admins/",
            {
                "username": "newbankadmin",
                "password": "StrongPass123!",
                "first_name": "New",
                "last_name": "Admin",
                "email": "new@example.com",
                "bank_id": self.bank.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        created = User.objects.get(username="newbankadmin")
        self.assertEqual(created.profile.role, "BANK_ADMIN")
        self.assertTrue(created.profile.is_approved)
        self.assertTrue(AuditLog.objects.filter(action="BANK_ADMIN_CREATED", target_user=created).exists())

    def test_super_admin_can_reset_existing_bank_admin_password(self):
        superuser = User.objects.create_superuser(
            username="owner2",
            email="owner2@example.com",
            password="StrongPass123!",
        )
        token = Token.objects.create(user=superuser)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        response = self.client.post(
            f"/api/super-admin/bank-admins/{self.admin_user.profile.id}/reset-password/",
            {"new_password": "NewStrongPass123!"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.admin_user.refresh_from_db()
        self.assertTrue(self.admin_user.check_password("NewStrongPass123!"))
        self.assertFalse(Token.objects.filter(user=self.admin_user).exists())
