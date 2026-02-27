from django.contrib.auth.models import User
from rest_framework import serializers
from .models import SME,Bank,Profile


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
        fields = ["id", "name", "br_number", "industry", "is_scored", "total_score", "created_at"]


class EvaluatorSignupSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    bank_code = serializers.CharField()

    def validate_bank_code(self, value):
        if not Bank.objects.filter(code=value).exists():
            raise serializers.ValidationError("Invalid bank code.")
        return value

    def create(self, validated_data):
        bank_code = validated_data.pop("bank_code")
        bank = Bank.objects.get(code=bank_code)

        username = validated_data["username"]
        password = validated_data["password"]

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            email=validated_data.get("email", ""),
        )

        # ✅ Force evaluator workflow
        Profile.objects.create(
            user=user,
            bank=bank,
            role="EVALUATOR",
            is_approved=False,
            is_active=False,
        )

        return user