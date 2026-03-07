from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import SME, SMECriterionScore, CriterionWeight
from .views import _get_evaluator_profile_or_403, _get_sme_or_404, _compute_capability_excel
from decimal import Decimal


class SMEReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        profile, err = _get_evaluator_profile_or_403(request)
        if err:
            return err

        sme = _get_sme_or_404(pk, profile.bank)
        if not sme:
            return Response({"detail": "SME not found."}, status=status.HTTP_404_NOT_FOUND)

        if sme.scored_by and sme.scored_by != profile.user:
            return Response(
                {"detail": "This SME is assigned to another evaluator."},
                status=status.HTTP_403_FORBIDDEN
            )

        weights = CriterionWeight.objects.filter(is_active=True).order_by("code")
        weights_by_code = {w.code: Decimal(str(w.weight)) for w in weights}

        score_rows = SMECriterionScore.objects.filter(
            sme=sme,
            evaluator=profile.user
        ).order_by("criterion_code")

        scores_by_code = {
            s.criterion_code: {
                "score": s.score,
                "notes": s.notes,
                "followup": s.followup,
            }
            for s in score_rows
        }

        capability, rows, weaknesses = _compute_capability_excel(scores_by_code, weights_by_code)

        return Response({
            "id": sme.id,
            "name": sme.name,
            "br_number": sme.br_number,
            "industry": sme.industry,
            "total_score": sme.total_score,
            "scored_by": sme.scored_by.username if sme.scored_by else None,
            "is_scored": sme.is_scored,
            "is_editable": True,
            "criteria": rows,
            "weaknesses": weaknesses,
            "capability_score": capability,
        })