from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import SME, SMECriterionScore, CriterionWeight
from .views import _get_evaluator_profile_or_403, _get_sme_or_404, _compute_capability_excel
from decimal import Decimal
from django.http import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO



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

        # Collect all non-empty notes from each criterion
        overall_notes = "\n".join(
        f"{code}: {data['notes']}"
        for code, data in scores_by_code.items()
        if data.get("notes", "").strip()
        )
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
            "additional_details": overall_notes,
        })
class SMEReportPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        profile, err = _get_evaluator_profile_or_403(request)
        if err:
            return err

        sme = _get_sme_or_404(pk, profile.bank)
        if not sme:
            return Response({"detail": "SME not found."}, status=404)

        weights = CriterionWeight.objects.filter(is_active=True).order_by("code")
        weights_by_code = {w.code: Decimal(str(w.weight)) for w in weights}

        score_rows = SMECriterionScore.objects.filter(
            sme=sme,
            evaluator=profile.user
        ).order_by("criterion_code")

        scores_by_code = {
            s.criterion_code: {
                "score": s.score,
            }
            for s in score_rows
        }

        capability, rows, weaknesses = _compute_capability_excel(
            scores_by_code,
            weights_by_code
        )

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)

        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(50, 800, "SME Evaluation Report")

        pdf.setFont("Helvetica", 12)
        pdf.drawString(50, 760, f"SME Name: {sme.name}")
        pdf.drawString(50, 740, f"BR Number: {sme.br_number}")
        pdf.drawString(50, 720, f"Industry: {sme.industry}")
        pdf.drawString(
            50,
            700,
            f"Score: {round(float(capability), 2) if capability is not None else '-'}"
        )

        pdf.save()
        buffer.seek(0)

        return FileResponse(
            buffer,
            as_attachment=True,
            filename=f"SME_Report_{sme.br_number}.pdf"
        )