# backend/core/urls.py

from django.urls import path
from .viewsreport import SMEReportPDFView, SMEReportView

from .views import (
    health,
    LoginView,
    EvaluatorSignupView,
    PendingEvaluatorsView,
    ApproveEvaluatorView,
    SMEByBRView,
    EvaluatorSMEsView,
    EvaluatorSummaryView,
    SMECreateView,
    SMEScoreUpdateView,

    # ✅ NEW imports
    CriterionWeightsView,
    SMECriterionScoresView,
    SMESubmitCapabilityView,
    SMECapabilityResultView,
)

urlpatterns = [
    # health
    path("health/", health),

    # auth (token-based)
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/evaluator-signup/", EvaluatorSignupView.as_view(), name="evaluator-signup"),

    # bank admin
    path("bank-admin/pending-evaluators/", PendingEvaluatorsView.as_view(), name="pending-evaluators"),
    path("bank-admin/approve-evaluator/<int:profile_id>/", ApproveEvaluatorView.as_view(), name="approve-evaluator"),

    # evaluator / smes
    path("smes/by-br/", SMEByBRView.as_view(), name="sme-by-br"),
    path("evaluator/smes/", EvaluatorSMEsView.as_view(), name="evaluator-smes"),
    path("evaluator/summary/", EvaluatorSummaryView.as_view(), name="evaluator-summary"),

    # SME create (support both routes)
    path("smes/", SMECreateView.as_view(), name="sme-create"),          # ✅ common: POST /api/smes/
    path("smes/create/", SMECreateView.as_view(), name="sme-create-alt"),

    # ✅ NEW: criteria weights (DB)
    path("criteria/weights/", CriterionWeightsView.as_view(), name="criteria-weights"),

    # ✅ NEW: save/load per-criterion scores
    path("smes/<int:pk>/criterion-scores/", SMECriterionScoresView.as_view(), name="sme-criterion-scores"),

    # ✅ NEW: submit final (compute Excel capability + store SME.total_score)
    path("smes/<int:pk>/submit-capability/", SMESubmitCapabilityView.as_view(), name="sme-submit-capability"),

    # ✅ NEW: get capability result (for result page)
    path("smes/<int:pk>/capability-result/", SMECapabilityResultView.as_view(), name="sme-capability-result"),

    # SME scoring (old endpoint kept for compatibility)
    path("smes/<int:pk>/score/", SMEScoreUpdateView.as_view(), name="sme-score"),
    #report views
    path("smes/<int:pk>/report/", SMEReportView.as_view(), name="sme-report"),
    path("smes/<int:pk>/report/pdf/", SMEReportPDFView.as_view()),
]