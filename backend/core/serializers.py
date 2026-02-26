from rest_framework import serializers
from .models import SME


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