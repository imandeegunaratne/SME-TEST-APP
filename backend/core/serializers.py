# backend/core/serializers.py

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import EvaluatorNotification   
from .models import SME, Bank, Profile


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
        # ✅ removed created_at to avoid FieldError if model doesn't have it
        fields = ["id", "name", "br_number", "industry", "is_scored", "total_score"]


class EvaluatorSignupSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    bank_code = serializers.CharField()

    def validate_username(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Username is required.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_bank_code(self, value):
        value = (value or "").strip()
        if not Bank.objects.filter(code__iexact=value).exists():
            raise serializers.ValidationError("Invalid bank code.")
        return value

    def create(self, validated_data):
        bank_code = validated_data.pop("bank_code")
        bank = Bank.objects.get(code__iexact=bank_code)

        user = User.objects.create_user(
            username=validated_data["username"].strip(),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            email=validated_data.get("email", ""),
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