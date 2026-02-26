import json
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt

from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth.models import User
from .models import Profile, SME
from .serializers import SMECreateSerializer, SMEListSerializer

@api_view(["GET"])
def health(request):
    return Response({"status": "ok", "message": "Django is connected!"})


def _get_username_from_request(request):
    # Prefer header first, then body (works with your current simple setup)
    u = (request.headers.get("X-Username") or "").strip()
    if u:
        return u
    # DRF request.data
    try:
        body_user = (request.data.get("username") or "").strip()
        return body_user
    except Exception:
        return ""


def _get_profile_or_401(request):
    username = _get_username_from_request(request)
    if not username:
        return None, Response({"detail": "Missing evaluator username."}, status=status.HTTP_401_UNAUTHORIZED)

    user = User.objects.filter(username=username).first()
    if not user:
        return None, Response({"detail": "Invalid user."}, status=status.HTTP_401_UNAUTHORIZED)

    profile = Profile.objects.filter(user=user, role="EVALUATOR").select_related("bank").first()
    if not profile:
        return None, Response({"detail": "Evaluator profile not found."}, status=status.HTTP_401_UNAUTHORIZED)

    return profile, None


@csrf_exempt
def login_view(request):
    # Only allow POST
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

    # return username so frontend can store it and send it for SME registration
    return JsonResponse({
        "message": "Login successful",
        "username": user.username,
    })


class SMEByBRView(APIView):

    def get(self, request):
        br = request.GET.get("br")
        profile, err = _get_profile_or_401(request)
        if err:
            return err

        if not br:
            return Response({"detail": "BR number required."}, status=400)

        evaluator = profile.user

        try:
            sme = SME.objects.get(br_number=br, bank=profile.bank)
        except SME.DoesNotExist:
            return Response({"detail": "SME not found."}, status=404)

        is_editable = False
        if sme.is_scored and sme.scored_by == evaluator:
            is_editable = True

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

        return Response(data)

class EvaluatorSMEsView(APIView):
    """
    GET /api/evaluator/smes/
    Returns SMEs for evaluator's bank
    """
    def get(self, request):
        profile, err = _get_profile_or_401(request)
        if err:
            return err

        smes = SME.objects.filter(bank=profile.bank).order_by("-created_at")
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

        # avg of total_score for scored SMEs only
        scored_scores = qs.filter(is_scored=True, total_score__isnull=False).values_list("total_score", flat=True)
        scored_scores = list(scored_scores)
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
        industry = request.data.get("industry")

        if SME.objects.filter(bank=profile.bank, br_number=br).exists():
            return Response(
                {"detail": "This SME has already been registered."},
                status=status.HTTP_409_CONFLICT
            )

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
    """POST /api/smes/<id>/score/

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

        # If already scored, only scorer can edit
        if sme.is_scored and sme.scored_by and sme.scored_by != profile.user:
            return Response({"detail": "This SME was already scored by another evaluator."}, status=status.HTTP_403_FORBIDDEN)

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
            status=status.HTTP_200_OK,
        )