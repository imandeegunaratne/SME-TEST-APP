# backend/core/views.py

from decimal import Decimal, ROUND_HALF_UP

from django.contrib.auth import authenticate

from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token

from .models import Profile, SME, CriterionWeight, SMECriterionScore
from .serializers import SMEListSerializer, EvaluatorSignupSerializer
from .permission import IsBankAdmin, IsApprovedUser


# ==========================
# Health Check
# ==========================
@api_view(["GET"])
def health(request):
    return Response({"status": "ok", "message": "Django is connected!"})


# ==========================
# Helpers (Token-based auth)
# ==========================
def _get_evaluator_profile_or_403(request):
    """
    Token-based evaluator guard:
    - must be authenticated
    - must have profile
    - must be evaluator
    - must be approved + active
    Returns (profile, None) if ok; otherwise (None, Response)
    """
    user = getattr(request, "user", None)
    if not (user and user.is_authenticated and hasattr(user, "profile")):
        return None, Response(
            {"detail": "Authentication credentials were not provided."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    profile = user.profile

    if profile.role != "EVALUATOR":
        return None, Response(
            {"detail": "Evaluator access required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if not profile.is_approved:
        return None, Response(
            {"detail": "Pending bank admin approval."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if not profile.is_active:
        return None, Response(
            {"detail": "Account disabled. Contact bank admin."},
            status=status.HTTP_403_FORBIDDEN,
        )

    return profile, None


def _get_sme_or_404(pk, bank):
    try:
        return SME.objects.get(pk=pk, bank=bank)
    except SME.DoesNotExist:
        return None


def _block_if_scored_by_other(sme, evaluator_user):
    """
    Same rule you already had:
    - If SME is scored by another evaluator => block editing/submitting
    """
    if sme.is_scored and sme.scored_by and sme.scored_by != evaluator_user:
        return Response(
            {"detail": "This SME was already scored by another evaluator."},
            status=status.HTTP_403_FORBIDDEN,
        )
    return None


def _decimal(n):
    try:
        return Decimal(str(n))
    except Exception:
        return None


def _compute_capability_excel(scores_by_code, weights_by_code):
    """
    Excel logic:
      normalized = score / 10
      weighted   = weight * normalized
      gap        = weight * (1 - normalized)
      capability = ROUND(SUM(weighted), 2)
    """
    rows = []
    total = Decimal("0")

    for code, w in weights_by_code.items():
        raw = scores_by_code.get(code)
        score = raw.get("score") if isinstance(raw, dict) else None

        if score is None:
            normalized = None
            weighted = None
            gap = None
        else:
            s = Decimal(str(score))
            normalized = (s / Decimal("10"))
            weighted = (w * normalized)
            gap = (w * (Decimal("1") - normalized))
            total += weighted

        rows.append(
            {
                "code": code,
                "weight": float(w),
                "score": score,
                "normalized": float(normalized) if normalized is not None else None,
                "weighted": float(weighted) if weighted is not None else None,
                "gap": float(gap) if gap is not None else None,
            }
        )

    capability = total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    # weakness explorer: rank by GAP desc
    weaknesses = [
        r for r in rows if r.get("gap") is not None and r["gap"] > 0
    ]
    weaknesses.sort(key=lambda x: x["gap"], reverse=True)
    for i, w in enumerate(weaknesses, start=1):
        w["rank"] = i

    return float(capability), rows, weaknesses


# ==========================
# Evaluator Signup
# ==========================
class EvaluatorSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = EvaluatorSignupSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(
            {"detail": "Account created. Waiting for bank admin approval."},
            status=status.HTTP_201_CREATED,
        )


# ==========================
# Secure Login
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

        # Block evaluator until approved/active
        if p.role == "EVALUATOR":
            if not p.is_approved:
                return Response({"detail": "Pending bank admin approval."}, status=status.HTTP_403_FORBIDDEN)
            if not p.is_active:
                return Response({"detail": "Account disabled. Contact bank admin."}, status=status.HTTP_403_FORBIDDEN)

        # Bank admin must be active too
        if p.role == "BANK_ADMIN" and not p.is_active:
            return Response({"detail": "Account disabled."}, status=status.HTTP_403_FORBIDDEN)

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "role": p.role,
                "bank_code": p.bank.code if p.bank else None,
                "bank_name": p.bank.name if p.bank else None,
                "username": user.username,
            },
            status=status.HTTP_200_OK,
        )


# ==========================
# Bank Admin: pending evaluators
# ==========================
class PendingEvaluatorsView(APIView):
    permission_classes = [IsAuthenticated, IsBankAdmin]

    def get(self, request):
        bank = request.user.profile.bank

        pending = (
            Profile.objects.filter(bank=bank, role="EVALUATOR", is_approved=False)
            .select_related("user")
            .order_by("-id")
        )

        data = [
            {
                "profile_id": p.id,
                "user_id": p.user.id,
                "username": p.user.username,
                "first_name": p.user.first_name,
                "last_name": p.user.last_name,
                "email": p.user.email,
                "is_active": p.is_active,
                "is_approved": p.is_approved,
            }
            for p in pending
        ]

        return Response(data, status=status.HTTP_200_OK)


# ==========================
# Bank Admin: approve evaluator
# ==========================
class ApproveEvaluatorView(APIView):
    permission_classes = [IsAuthenticated, IsBankAdmin]

    def post(self, request, profile_id):
        bank = request.user.profile.bank

        try:
            p = Profile.objects.select_related("user").get(
                id=profile_id,
                bank=bank,
                role="EVALUATOR",
            )
        except Profile.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        p.is_approved = True
        p.is_active = True
        p.save(update_fields=["is_approved", "is_active"])

        return Response({"detail": "Evaluator approved."}, status=status.HTTP_200_OK)


# ==========================
# SME APIs (existing)
# ==========================
class SMEByBRView(APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def get(self, request):
        br = request.GET.get("br")

        profile, err = _get_evaluator_profile_or_403(request)
        if err:
            return err

        if not br:
            return Response({"detail": "BR number required."}, status=status.HTTP_400_BAD_REQUEST)

        evaluator_user = profile.user

        try:
            sme = SME.objects.get(br_number=br, bank=profile.bank)
        except SME.DoesNotExist:
            return Response({"detail": "SME not found."}, status=status.HTTP_404_NOT_FOUND)

        is_editable = bool(sme.is_scored and sme.scored_by == evaluator_user)

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
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def get(self, request):
        profile, err = _get_evaluator_profile_or_403(request)
        if err:
            return err

        smes = SME.objects.filter(bank=profile.bank).order_by("-id")
        return Response(SMEListSerializer(smes, many=True).data, status=status.HTTP_200_OK)


class EvaluatorSummaryView(APIView):
    """
    GET /api/evaluator/summary/
    Summary for evaluator's bank
    """
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def get(self, request):
        profile, err = _get_evaluator_profile_or_403(request)
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
            status=status.HTTP_200_OK,
        )


class SMECreateView(APIView):
    """
    POST /api/smes/
    """
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def post(self, request):
        profile, err = _get_evaluator_profile_or_403(request)
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
            evaluator=profile.user,
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
    Old endpoint: stores final score on SME (kept for compatibility).
    """
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def post(self, request, pk):
        profile, err = _get_evaluator_profile_or_403(request)
        if err:
            return err

        sme = _get_sme_or_404(pk, profile.bank)
        if not sme:
            return Response({"detail": "SME not found."}, status=status.HTTP_404_NOT_FOUND)

        block = _block_if_scored_by_other(sme, profile.user)
        if block:
            return block

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


# ============================================================
# NEW: Weights API (weights stored in DB)
# ============================================================
class CriterionWeightsView(APIView):
    """
    GET /api/criteria/weights/
    Returns weights from DB (for transparency/debug)
    """
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def get(self, request):
        profile, err = _get_evaluator_profile_or_403(request)
        if err:
            return err

        qs = CriterionWeight.objects.filter(is_active=True).order_by("code")
        data = [{"code": c.code, "title": c.title, "weight": float(c.weight)} for c in qs]
        return Response(data, status=status.HTTP_200_OK)


# ============================================================
# NEW: Save / Load per-criterion scores for an SME
# ============================================================
class SMECriterionScoresView(APIView):
    """
    GET  /api/smes/<id>/criterion-scores/
    POST /api/smes/<id>/criterion-scores/
      body: {"scores":[{"code":"C1","score":7,"notes":"..","followup":false}, ...]}
    """
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def get(self, request, pk):
        profile, err = _get_evaluator_profile_or_403(request)
        if err:
            return err

        sme = _get_sme_or_404(pk, profile.bank)
        if not sme:
            return Response({"detail": "SME not found."}, status=status.HTTP_404_NOT_FOUND)

        # allow viewing even if scored by other evaluator, but not editing (POST blocked below)
        items = SMECriterionScore.objects.filter(
            sme=sme, evaluator=profile.user
        ).order_by("criterion_code")

        out = []
        for it in items:
            out.append(
                {
                    "code": it.criterion_code,
                    "score": it.score,
                    "notes": it.notes,
                    "followup": it.followup,
                }
            )

        return Response(
            {
                "sme_id": sme.id,
                "count": len(out),
                "scores": out,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, pk):
        profile, err = _get_evaluator_profile_or_403(request)
        if err:
            return err

        sme = _get_sme_or_404(pk, profile.bank)
        if not sme:
            return Response({"detail": "SME not found."}, status=status.HTTP_404_NOT_FOUND)

        block = _block_if_scored_by_other(sme, profile.user)
        if block:
            return block

        payload = request.data.get("scores")
        if not isinstance(payload, list):
            return Response(
                {"detail": "scores must be a list."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Valid codes from DB weights (or you can hardcode C1..C10)
        valid_codes = set(
            CriterionWeight.objects.filter(is_active=True).values_list("code", flat=True)
        )

        saved = 0
        for row in payload:
            code = (row.get("code") or "").strip()
            if not code or (valid_codes and code not in valid_codes):
                continue

            score = row.get("score", None)
            notes = row.get("notes", "") or ""
            followup = bool(row.get("followup", False))

            if score is not None:
                try:
                    score = int(score)
                except Exception:
                    score = None

            if score is not None and (score < 1 or score > 10):
                return Response(
                    {"detail": f"{code} score must be between 1 and 10."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            obj, _created = SMECriterionScore.objects.get_or_create(
                sme=sme,
                evaluator=profile.user,
                criterion_code=code,
                defaults={"score": score, "notes": notes, "followup": followup},
            )

            obj.score = score
            obj.notes = notes
            obj.followup = followup
            obj.save(update_fields=["score", "notes", "followup", "updated_at"])

            saved += 1

        return Response(
            {"detail": "Saved.", "saved": saved},
            status=status.HTTP_200_OK,
        )


# ============================================================
# NEW: Submit final capability score using DB weights (Excel logic)
# ============================================================
class SMESubmitCapabilityView(APIView):
    """
    POST /api/smes/<id>/submit-capability/
    - reads SMECriterionScore rows for this evaluator+SME
    - reads CriterionWeight rows
    - computes Excel logic
    - updates SME.total_score, SME.is_scored, SME.scored_by
    - returns result JSON for capability page
    """
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def post(self, request, pk):
        profile, err = _get_evaluator_profile_or_403(request)
        if err:
            return err

        sme = _get_sme_or_404(pk, profile.bank)
        if not sme:
            return Response({"detail": "SME not found."}, status=status.HTTP_404_NOT_FOUND)

        block = _block_if_scored_by_other(sme, profile.user)
        if block:
            return block

        weights = CriterionWeight.objects.filter(is_active=True).order_by("code")
        if not weights.exists():
            return Response(
                {"detail": "No weights found. Insert CriterionWeight rows first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        weights_by_code = {w.code: Decimal(str(w.weight)) for w in weights}

        # load scores from DB
        score_rows = SMECriterionScore.objects.filter(
            sme=sme, evaluator=profile.user
        )

        scores_by_code = {}
        for s in score_rows:
            scores_by_code[s.criterion_code] = {
                "score": s.score,
                "notes": s.notes,
                "followup": s.followup,
            }

        # require all criteria to be scored
        missing = [c for c in weights_by_code.keys() if scores_by_code.get(c, {}).get("score") is None]
        if missing:
            return Response(
                {"detail": "All criteria must be scored before submit.", "missing": missing},
                status=status.HTTP_400_BAD_REQUEST,
            )

        capability, rows, weaknesses = _compute_capability_excel(scores_by_code, weights_by_code)

        sme.total_score = capability
        sme.is_scored = True
        sme.scored_by = profile.user
        sme.save(update_fields=["total_score", "is_scored", "scored_by"])

        return Response(
            {
                "message": "Submitted.",
                "sme_id": sme.id,
                "capability_score": capability,  # 0..1 (Excel style)
                "capability_percent": round(capability * 100, 0),
                "rows": rows,
                "weaknesses": weaknesses,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# NEW: Get capability result (for /smes/:id/capability page)
# ============================================================
class SMECapabilityResultView(APIView):
    """
    GET /api/smes/<id>/capability-result/
    - recompute live from DB (scores + weights)
    - returns capability + weakness explorer
    """
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def get(self, request, pk):
        profile, err = _get_evaluator_profile_or_403(request)
        if err:
            return err

        sme = _get_sme_or_404(pk, profile.bank)
        if not sme:
            return Response({"detail": "SME not found."}, status=status.HTTP_404_NOT_FOUND)

        weights = CriterionWeight.objects.filter(is_active=True).order_by("code")
        if not weights.exists():
            return Response(
                {"detail": "No weights found. Insert CriterionWeight rows first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        weights_by_code = {w.code: Decimal(str(w.weight)) for w in weights}

        score_rows = SMECriterionScore.objects.filter(
            sme=sme, evaluator=profile.user
        )

        scores_by_code = {}
        for s in score_rows:
            scores_by_code[s.criterion_code] = {
                "score": s.score,
                "notes": s.notes,
                "followup": s.followup,
            }

        capability, rows, weaknesses = _compute_capability_excel(scores_by_code, weights_by_code)

        return Response(
            {
                "sme_id": sme.id,
                "sme_name": sme.name,
                "is_scored": sme.is_scored,
                "stored_total_score": sme.total_score,
                "capability_score": capability,
                "capability_percent": round(capability * 100, 0),
                "rows": rows,
                "weaknesses": weaknesses,
            },
            status=status.HTTP_200_OK,
        )