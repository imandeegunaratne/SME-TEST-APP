from decimal import Decimal
from io import BytesIO

from django.http import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CriterionWeight, SME, SMECriterionScore
from .permission import IsApprovedUser
from .views import (
    _compute_capability_excel,
    _criterion_code_sort_key,
    _get_evaluator_profile_or_403,
    _get_sme_or_404,
)


class SMEReportView(APIView):
    # Fixed: added IsApprovedUser to match other evaluator views
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def get(self, request, pk):
        profile, err = _get_evaluator_profile_or_403(request)
        if err:
            return err

        sme = _get_sme_or_404(pk, profile.bank)
        if not sme:
            return Response({"detail": "SME not found."}, status=status.HTTP_404_NOT_FOUND)

        if not sme.is_scored:
            return Response({"detail": "Report not completed yet."}, status=status.HTTP_403_FORBIDDEN)

        weights = sorted(
            CriterionWeight.objects.filter(is_active=True),
            key=lambda item: _criterion_code_sort_key(item.code),
        )
        weights_by_code = {
            w.code: {"weight": Decimal(str(w.weight)), "title": w.title}
            for w in weights
        }

        score_rows = SMECriterionScore.objects.filter(sme=sme).order_by("criterion_code")
        scores_by_code = {
            s.criterion_code: {"score": s.score, "notes": s.notes, "followup": s.followup}
            for s in score_rows
        }

        capability, rows, weaknesses = _compute_capability_excel(scores_by_code, weights_by_code)

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
            # Fixed: is_editable now reflects actual state instead of hardcoded True
            "is_editable": not sme.is_scored,
            "criteria": rows,
            "weaknesses": weaknesses,
            "capability_score": capability,
            "additional_details": overall_notes,
        })


class SMEReportPDFView(APIView):
    # Fixed: added IsApprovedUser to match other evaluator views
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def get(self, request, pk):
        profile, err = _get_evaluator_profile_or_403(request)
        if err:
            return err

        sme = _get_sme_or_404(pk, profile.bank)
        if not sme:
            return Response({"detail": "SME not found."}, status=status.HTTP_404_NOT_FOUND)

        weights = sorted(
            CriterionWeight.objects.filter(is_active=True),
            key=lambda item: _criterion_code_sort_key(item.code),
        )
        weights_by_code = {
            w.code: {"weight": Decimal(str(w.weight)), "title": w.title}
            for w in weights
        }

        score_rows = SMECriterionScore.objects.filter(sme=sme).order_by("criterion_code")
        scores_by_code = {
            s.criterion_code: {"score": s.score, "notes": s.notes, "followup": s.followup}
            for s in score_rows
        }

        capability, rows, weaknesses = _compute_capability_excel(scores_by_code, weights_by_code)

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Title
        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawString(20 * mm, height - 20 * mm, "SME Capability Evaluation Report")

        # Basic info
        pdf.setFont("Helvetica", 11)
        y = height - 35 * mm
        for label, value in [
            ("SME Name", sme.name),
            ("BR Number", sme.br_number),
            ("Industry", sme.industry or "—"),
            ("Scored By", sme.scored_by.username if sme.scored_by else "—"),
            ("Capability Score", f"{round(float(capability), 2)} ({round(capability * 100, 0):.0f}%)"),
        ]:
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawString(20 * mm, y, f"{label}:")
            pdf.setFont("Helvetica", 10)
            pdf.drawString(65 * mm, y, str(value))
            y -= 7 * mm

        # Criteria table header
        y -= 5 * mm
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(20 * mm, y, "Code")
        pdf.drawString(35 * mm, y, "Criterion")
        pdf.drawString(130 * mm, y, "Score")
        pdf.drawString(150 * mm, y, "Weighted")
        pdf.drawString(170 * mm, y, "Gap")
        y -= 5 * mm
        pdf.line(20 * mm, y, 190 * mm, y)
        y -= 5 * mm

        pdf.setFont("Helvetica", 9)
        for row in rows:
            if y < 25 * mm:
                pdf.showPage()
                y = height - 20 * mm
                pdf.setFont("Helvetica", 9)

            pdf.drawString(20 * mm, y, str(row.get("code", "")))
            criterion_title = str(row.get("title") or row.get("code", ""))
            pdf.drawString(35 * mm, y, criterion_title[:42])
            pdf.drawString(130 * mm, y, str(row.get("score", "—")))
            pdf.drawString(
                150 * mm, y,
                f"{row['weighted']:.4f}" if row.get("weighted") is not None else "—"
            )
            pdf.drawString(
                170 * mm, y,
                f"{row['gap']:.4f}" if row.get("gap") is not None else "—"
            )
            y -= 6 * mm

        # Weaknesses
        if weaknesses:
            y -= 5 * mm
            if y < 40 * mm:
                pdf.showPage()
                y = height - 20 * mm
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawString(20 * mm, y, "Top Weaknesses (by gap):")
            y -= 7 * mm
            pdf.setFont("Helvetica", 9)
            for w in weaknesses[:5]:
                if y < 20 * mm:
                    pdf.showPage()
                    y = height - 20 * mm
                    pdf.setFont("Helvetica", 9)
                pdf.drawString(
                    20 * mm, y,
                    f"#{w['rank']}  {w['code']}  gap={w['gap']:.4f}"
                )
                y -= 6 * mm

        pdf.save()
        buffer.seek(0)

        return FileResponse(
            buffer,
            as_attachment=True,
            filename=f"SME_Report_{sme.br_number}.pdf",
        )
