import json

from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token

from .models import Profile, SME
from .serializers import (
    SMECreateSerializer,
    SMEListSerializer,
    EvaluatorSignupSerializer,
)
from .permission import IsBankAdmin


# ==========================
# Health Check
# ==========================
@api_view(["GET"])
def health(request):
    return Response({"status": "ok", "message": "Django is connected!"})


# ==========================
# Helpers (your current auth style for evaluator endpoints)
# ==========================
def _get_username_from_request(request):
    """
    Your current frontend sends evaluator username in:
      - Header: X-Username
      - or Body: { "username": "..." }

    (Not secure for production, but kept for compatibility.)
    """
    u = (request.headers.get("X-Username") or "").strip()
    if u:
        return u

    try:
        return (request.data.get("username") or "").strip()
    except Exception:
        return ""


def _get_profile_or_401(request):
    """
    Returns (profile, None) if valid.
    Returns (None, Response(...)) if invalid.
    Enforces:
      - must be an evaluator profile
      - must be approved + active
    """
    username = _get_username_from_request(request)
    if not username:
        return None, Response(
            {"detail": "Missing evaluator username."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    user = User.objects.filter(username=username).first()
    if not user:
        return None, Response({"detail": "Invalid user."}, status=status.HTTP_401_UNAUTHORIZED)

    profile = Profile.objects.filter(user=user, role="EVALUATOR").select_related("bank").first()
    if not profile:
        return None, Response({"detail": "Evaluator profile not found."}, status=status.HTTP_401_UNAUTHORIZED)

    if not profile.is_approved:
        return None, Response({"detail": "Pending bank admin approval."}, status=status.HTTP_403_FORBIDDEN)

    if not profile.is_active:
        return None, Response({"detail": "Account disabled. Contact bank admin."}, status=status.HTTP_403_FORBIDDEN)

    return profile, None


# ==========================
# OLD login (kept for compatibility)
# ==========================
@csrf_exempt
def login_view(request):
    """
    OLD SIMPLE LOGIN:
    Returns username only (no token).
    You can delete later after frontend moves to Token login.
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Only POST method allowed"}, status=405)

    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return JsonResponse({"detail": "Username and password required"}, status=400)

    user = authenticate(username=username, password=password)
    if user is None:
        return JsonResponse({"detail": "Invalid username or password"}, status=400)

    return JsonResponse({"message": "Login successful", "username": user.username})


# ==========================
# NEW: Evaluator Signup (always creates pending evaluator)
# ==========================
class EvaluatorSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = EvaluatorSignupSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()

        return Response(
            {"detail": "Account created. Waiting for bank admin approval."},
            status=status.HTTP_201_CREATED
        )


# ==========================
# NEW: Secure Login (Token + approval checks)
# ==========================
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if not user:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

        if not hasattr(user, "profile"):
            return Response({"detail": "Profile not found. Contact admin."}, status=status.HTTP_403_FORBIDDEN)

        p = user.profile

        # Block evaluator until approved
        if p.role == "EVALUATOR":
            if not p.is_approved:
                return Response({"detail": "Pending bank admin approval."}, status=status.HTTP_403_FORBIDDEN)
            if not p.is_active:
                return Response({"detail": "Account disabled. Contact bank admin."}, status=status.HTTP_403_FORBIDDEN)

        # Bank admin must be active too
        if p.role == "BANK_ADMIN" and not p.is_active:
            return Response({"detail": "Account disabled."}, status=status.HTTP_403_FORBIDDEN)

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "token": token.key,
            "role": p.role,
            "bank_code": p.bank.code,
            "bank_name": p.bank.name,
            "username": user.username,
        })


# ==========================
# Bank Admin: list pending evaluators (same bank only)
# ==========================
class PendingEvaluatorsView(APIView):
    permission_classes = [IsAuthenticated, IsBankAdmin]

    def get(self, request):
        bank = request.user.profile.bank

        pending = Profile.objects.filter(
            bank=bank,
            role="EVALUATOR",
            is_approved=False
        ).select_related("user").order_by("-id")  # ✅ no created_at

        data = []
        for p in pending:
            data.append({
                "profile_id": p.id,
                "user_id": p.user.id,
                "username": p.user.username,
                "first_name": p.user.first_name,
                "last_name": p.user.last_name,
                "email": p.user.email,
                "is_active": p.is_active,
                "is_approved": p.is_approved,
            })

        return Response(data, status=status.HTTP_200_OK)


# ==========================
# Bank Admin: approve evaluator (same bank only)
# ==========================
class ApproveEvaluatorView(APIView):
    permission_classes = [IsAuthenticated, IsBankAdmin]

    def post(self, request, profile_id):
        bank = request.user.profile.bank

        try:
            p = Profile.objects.select_related("user").get(
                id=profile_id,
                bank=bank,
                role="EVALUATOR"
            )
        except Profile.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        p.is_approved = True
        p.is_active = True
        p.save(update_fields=["is_approved", "is_active"])

        return Response({"detail": "Evaluator approved."}, status=status.HTTP_200_OK)


# ==========================
# SME APIs (your existing endpoints)
# ==========================
class SMEByBRView(APIView):
    def get(self, request):
        br = request.GET.get("br")
        profile, err = _get_profile_or_401(request)
        if err:
            return err

        if not br:
            return Response({"detail": "BR number required."}, status=status.HTTP_400_BAD_REQUEST)

        evaluator = profile.user

        try:
            sme = SME.objects.get(br_number=br, bank=profile.bank)
        except SME.DoesNotExist:
            return Response({"detail": "SME not found."}, status=status.HTTP_404_NOT_FOUND)

        is_editable = bool(sme.is_scored and sme.scored_by == evaluator)

        data = {
            "id": sme.id,
            "name": sme.name,
            "br_number": sme.br_number,
            "industry": sme.industry,
            "is_scored": sme.is_scored,
            "total_score": sme.total_score,
            "scored_by": sme.scored_by.username if sme.scored_by else None,
            "is_editable": is_editable,
        }
        return Response(data, status=status.HTTP_200_OK)


class EvaluatorSMEsView(APIView):
    """
    GET /api/evaluator/smes/
    Returns SMEs for evaluator's bank
    """
    def get(self, request):
        profile, err = _get_profile_or_401(request)
        if err:
            return err

        smes = SME.objects.filter(bank=profile.bank).order_by("-id")  # ✅ no created_at
        return Response(SMEListSerializer(smes, many=True).data, status=status.HTTP_200_OK)


class EvaluatorSummaryView(APIView):
    """
    GET /api/evaluator/summary/
    Summary for evaluator's bank
    """
    def get(self, request):
        profile, err = _get_profile_or_401(request)
        if err:
            return err

        qs = SME.objects.filter(bank=profile.bank)
        total = qs.count()
        scored = qs.filter(is_scored=True).count()
        pending = qs.filter(is_scored=False).count()

        scored_scores = list(
            qs.filter(is_scored=True, total_score__isnull=False).values_list("total_score", flat=True)
        )
        avg = round(sum(scored_scores) / len(scored_scores), 2) if scored_scores else 0

        return Response(
            {
                "total_smes": total,
                "scored_smes": scored,
                "pending_smes": pending,
                "avg_score": avg,
            },
            status=status.HTTP_200_OK
        )


class SMECreateView(APIView):
    def post(self, request):
        profile, err = _get_profile_or_401(request)
        if err:
            return err

        name = request.data.get("name")
        br = request.data.get("br_number")
        industry = request.data.get("industry", "")

        if not name or not br:
            return Response({"detail": "name and br_number are required."}, status=status.HTTP_400_BAD_REQUEST)

        if SME.objects.filter(bank=profile.bank, br_number=br).exists():
            return Response({"detail": "This SME has already been registered."}, status=status.HTTP_409_CONFLICT)

        sme = SME.objects.create(
            name=name,
            br_number=br,
            industry=industry,
            bank=profile.bank,
            evaluator=profile.user
        )

        return Response(
            {
                "message": "SME registered successfully",
                "sme": {
                    "id": sme.id,
                    "name": sme.name,
                    "br_number": sme.br_number,
                    "industry": sme.industry,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class SMEScoreUpdateView(APIView):
    """
    POST /api/smes/<id>/score/
    Stores the final score on the SME record.
    - First score: any evaluator from the same bank can score.
    - Re-score/edit: only the evaluator who scored it can edit.
    """
    def post(self, request, pk):
        profile, err = _get_profile_or_401(request)
        if err:
            return err

        try:
            sme = SME.objects.get(pk=pk, bank=profile.bank)
        except SME.DoesNotExist:
            return Response({"detail": "SME not found."}, status=status.HTTP_404_NOT_FOUND)

        if sme.is_scored and sme.scored_by and sme.scored_by != profile.user:
            return Response(
                {"detail": "This SME was already scored by another evaluator."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            score = float(request.data.get("total_score"))
        except (TypeError, ValueError):
            return Response({"detail": "total_score must be a number."}, status=status.HTTP_400_BAD_REQUEST)

        if score < 0:
            return Response({"detail": "total_score must be >= 0."}, status=status.HTTP_400_BAD_REQUEST)

        sme.total_score = score
        sme.is_scored = True
        sme.scored_by = profile.user
        sme.save(update_fields=["total_score", "is_scored", "scored_by"])

        return Response(
            {
                "message": "Score saved.",
                "id": sme.id,
                "total_score": sme.total_score,
                "is_scored": sme.is_scored,
                "scored_by": sme.scored_by.username if sme.scored_by else None,
            },
            status=status.HTTP_200_OK
        )