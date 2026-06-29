from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers

from .models import AuditLog, Bank, BankLicense, EvaluatorNotification, Profile, SME


class SMECreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SME
        fields = ["id", "name", "br_number", "industry"]

    def validate_br_number(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("BR number is required.")
        return value


class SMEListSerializer(serializers.ModelSerializer):
    class Meta:
        model = SME
        fields = ["id", "name", "br_number", "industry", "is_scored", "total_score"]


class EvaluatorSignupSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    bank_code = serializers.CharField()

    def validate_username(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Username is required.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_bank_code(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Bank code is required.")
        if not Bank.objects.filter(code__iexact=value, is_active=True).exists():
            raise serializers.ValidationError("Invalid bank code.")
        bank = Bank.objects.get(code__iexact=value, is_active=True)
        license_obj = getattr(bank, "license", None)
        if not license_obj or not license_obj.is_valid:
            raise serializers.ValidationError("Software license period is over. Renew your software.")
        return value

    def create(self, validated_data):
        bank_code = validated_data.pop("bank_code").strip()
        bank = Bank.objects.get(code__iexact=bank_code, is_active=True)

        user = User.objects.create_user(
            username=validated_data["username"].strip(),
            password=validated_data["password"],
           
            is_active=False,
        )

        Profile.objects.create(
            user=user,
            bank=bank,
            role="EVALUATOR",
            is_approved=False,
            is_active=False,
        )

        return user


class EvaluatorNotificationSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M")

    class Meta:
        model = EvaluatorNotification
        fields = ["id", "title", "message", "is_read", "created_at"]


class AuditLogSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source="actor.username", read_only=True)
    target_username = serializers.CharField(source="target_user.username", read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "created_at",
            "action",
            "actor_username",
            "target_username",
            "ip_address",
            "detail",
        ]


class BankSerializer(serializers.ModelSerializer):
    license = serializers.SerializerMethodField()

    class Meta:
        model = Bank
        fields = ["id", "code", "name", "is_active", "license"]

    def get_license(self, obj):
        license_obj = getattr(obj, "license", None)
        if not license_obj:
            return None
        return BankLicenseSerializer(license_obj).data


class BankLicenseSerializer(serializers.ModelSerializer):
    bank_name = serializers.CharField(source="bank.name", read_only=True)
    bank_code = serializers.CharField(source="bank.code", read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    active_users = serializers.SerializerMethodField()
    smes_used = serializers.SerializerMethodField()
    evaluations_used = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = BankLicense
        fields = [
            "id",
            "bank",
            "bank_name",
            "bank_code",
            "status",
            "seats",
            "max_smes",
            "max_evaluations",
            "starts_on",
            "expires_on",
            "features",
            "is_valid",
            "active_users",
            "smes_used",
            "evaluations_used",
            "days_remaining",
            "issued_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "issued_at",
            "updated_at",
            "bank_name",
            "bank_code",
            "is_valid",
            "active_users",
            "smes_used",
            "evaluations_used",
            "days_remaining",
        ]

    def validate(self, attrs):
        starts_on = attrs.get("starts_on", getattr(self.instance, "starts_on", None))
        expires_on = attrs.get("expires_on", getattr(self.instance, "expires_on", None))
        if starts_on and expires_on and starts_on > expires_on:
            raise serializers.ValidationError("License start date cannot be after expiry date.")
        if "max_smes" in attrs:
            attrs["max_evaluations"] = attrs["max_smes"]
        return attrs

    def get_active_users(self, obj):
        return Profile.objects.filter(bank=obj.bank, is_active=True).count()

    def get_smes_used(self, obj):
        return SME.objects.filter(bank=obj.bank, is_active=True).count()

    def get_evaluations_used(self, obj):
        queryset = SME.objects.filter(
            bank=obj.bank,
            is_active=True,
            is_scored=True,
            evaluated_at__isnull=False,
        ).only("evaluated_at")
        total = 0
        for sme in queryset:
            evaluated_on = timezone.localtime(sme.evaluated_at).date()
            if obj.starts_on and evaluated_on < obj.starts_on:
                continue
            if obj.expires_on and evaluated_on > obj.expires_on:
                continue
            total += 1
        return total

    def get_days_remaining(self, obj):
        if not obj.expires_on:
            return None
        return (obj.expires_on - timezone.localdate()).days


class BankCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bank
        fields = ["id", "code", "name", "is_active"]

    def validate_code(self, value):
        value = (value or "").strip().upper()
        if not value:
            raise serializers.ValidationError("Bank code is required.")
        if Bank.objects.filter(code__iexact=value).exists():
            raise serializers.ValidationError("A bank with this code already exists.")
        return value

    def validate_name(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Bank name is required.")
        if Bank.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("A bank with this name already exists.")
        return value


class BankAdminCreateSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    bank_id = serializers.IntegerField()

    def validate_username(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Username is required.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_bank_id(self, value):
        if not Bank.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Select an active bank.")
        return value

    def create(self, validated_data):
        bank = Bank.objects.get(id=validated_data.pop("bank_id"))
        user = User.objects.create_user(
            username=validated_data["username"].strip(),
            password=validated_data["password"],
            first_name=(validated_data.get("first_name") or "").strip(),
            last_name=(validated_data.get("last_name") or "").strip(),
            email=(validated_data.get("email") or "").strip(),
            is_active=True,
        )
        Profile.objects.create(
            user=user,
            bank=bank,
            role="BANK_ADMIN",
            is_approved=True,
            is_active=True,
        )
        return user
