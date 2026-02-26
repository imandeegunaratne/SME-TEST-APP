from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import SME
from .views import _get_profile_or_401


class SMEReportView(APIView):

    def get(self, request, pk):
        profile, err = _get_profile_or_401(request)
        if err:
            return err

        evaluator = profile.user

        try:
            sme = SME.objects.get(id=pk, bank=profile.bank)
        except SME.DoesNotExist:
            return Response({"detail": "SME not found."}, status=404)

        data = {
            "id": sme.id,
            "name": sme.name,
            "br_number": sme.br_number,
            "industry": sme.industry,
            "total_score": sme.total_score,
            "scored_by": sme.scored_by.username if sme.scored_by else None,
            "is_editable": sme.scored_by == evaluator,
        }

        return Response(data)