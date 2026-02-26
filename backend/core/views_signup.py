from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import Bank, Profile

class EvaluatorSignupView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        bank_code = (request.data.get("bank_code") or "").strip()
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password") or ""

        # basic validations
        if not bank_code:
            return Response({"detail": "Bank code is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not username:
            return Response({"detail": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)
        if len(password) < 8:
            return Response({"detail": "Password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)

        bank = Bank.objects.filter(code__iexact=bank_code).first()
        if not bank:
            return Response({"detail": "Invalid bank code."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"detail": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password)

        Profile.objects.create(
            user=user,
            bank=bank,
            role="EVALUATOR"
        )

        return Response({"message": "Evaluator created successfully"}, status=status.HTTP_201_CREATED)
