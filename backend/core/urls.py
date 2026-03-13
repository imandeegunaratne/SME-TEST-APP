# backend/core/urls.py

from django.urls import path
from .viewsreport import SMEReportPDFView, SMEReportView

from .views import (
    health,
    LoginView,
    EvaluatorSignupView,
    PendingEvaluatorsView,
    ApproveEvaluatorView,
    SMEReportByBRView,
    SMEScoringByBRView,
    EvaluatorSMEsView,
    EvaluatorSummaryView,
    SMECreateView,
    SMEScoreUpdateView,
    CriterionWeightsView,
    SMECriterionScoresView,
    SMESubmitCapabilityView,
    SMECapabilityResultView,
    ChangePasswordView,
    bank_admin_dashboard_summary,
    bank_admin_pending_evaluators,
    bank_admin_industry_analysis,
    bank_admin_evaluator_analysis,
    bank_admin_criterion_analysis,
    bank_admin_sme_list,
    bank_admin_sme_comparison,
    bank_admin_evaluator_score_distribution
    
)

urlpatterns = [
    path("health/", health),

    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/evaluator-signup/", EvaluatorSignupView.as_view(), name="evaluator-signup"),

    path("bank-admin/pending-evaluators/", PendingEvaluatorsView.as_view(), name="pending-evaluators"),
    path("bank-admin/approve-evaluator/<int:profile_id>/", ApproveEvaluatorView.as_view(), name="approve-evaluator"),

    path("smes/report-by-br/", SMEReportByBRView.as_view(), name="sme-report-by-br"),
    path("smes/scoring-by-br/", SMEScoringByBRView.as_view(), name="sme-scoring-by-br"),
    path("evaluator/smes/", EvaluatorSMEsView.as_view(), name="evaluator-smes"),
    path("evaluator/summary/", EvaluatorSummaryView.as_view(), name="evaluator-summary"),
    path("evaluator/change-password/", ChangePasswordView.as_view(), name="evaluator-change-password"),

    path("smes/", SMECreateView.as_view(), name="sme-create"),
    path("smes/create/", SMECreateView.as_view(), name="sme-create-alt"),

    path("criteria/weights/", CriterionWeightsView.as_view(), name="criteria-weights"),
    path("smes/<int:pk>/criterion-scores/", SMECriterionScoresView.as_view(), name="sme-criterion-scores"),
    path("smes/<int:pk>/submit-capability/", SMESubmitCapabilityView.as_view(), name="sme-submit-capability"),
    path("smes/<int:pk>/capability-result/", SMECapabilityResultView.as_view(), name="sme-capability-result"),

    path("smes/<int:pk>/score/", SMEScoreUpdateView.as_view(), name="sme-score"),

    path("smes/<int:pk>/report/", SMEReportView.as_view(), name="sme-report"),
    path("smes/<int:pk>/report/pdf/", SMEReportPDFView.as_view(), name="sme-report-pdf"),
    path("bank-admin/dashboard-summary/", bank_admin_dashboard_summary),
    path("bank-admin/pending-evaluators/", bank_admin_pending_evaluators),
    path("bank-admin/industry-analysis/", bank_admin_industry_analysis),
    path("bank-admin/evaluator-analysis/", bank_admin_evaluator_analysis),
    path("bank-admin/criterion-analysis/", bank_admin_criterion_analysis),
    path("bank-admin/smes/", bank_admin_sme_list),
    path("bank-admin/sme-comparison/", bank_admin_sme_comparison),
    path("bank-admin/evaluator-score-distribution/<int:evaluator_id>/",bank_admin_evaluator_score_distribution,),
]