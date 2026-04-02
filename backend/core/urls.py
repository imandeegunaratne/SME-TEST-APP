from django.urls import path

from .views import (
    health,

    EvaluatorSignupView,
    LoginView,
    ChangePasswordView,

    PendingEvaluatorsView,
    ApproveEvaluatorView,
    DisapproveEvaluatorView,
    block_evaluator,
    unblock_evaluator,
    search_evaluators,

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
    SMEDetailForScoringView,

    bank_admin_dashboard_summary,
    bank_admin_pending_evaluators,
    bank_admin_industry_analysis,
    bank_admin_evaluator_analysis,
    bank_admin_evaluator_score_distribution,
    bank_admin_criterion_analysis,
    bank_admin_sme_list,
    bank_admin_sme_comparison,

    evaluator_notifications,
    mark_evaluator_notifications_read,
)

from .viewsreport import SMEReportView, SMEReportPDFView

urlpatterns = [
    # Health
    path("health/", health),

    # Auth
    path("signup/evaluator/", EvaluatorSignupView.as_view()),
    path("login/", LoginView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),

    # Bank Admin - Evaluator Management
    path("bank-admin/pending-evaluators/", PendingEvaluatorsView.as_view()),
    path("bank-admin/approve-evaluator/<int:profile_id>/", ApproveEvaluatorView.as_view()),
    path("bank-admin/disapprove-evaluator/<int:profile_id>/", DisapproveEvaluatorView.as_view()),
    path("bank-admin/block-evaluator/<int:profile_id>/", block_evaluator),
    path("bank-admin/unblock-evaluator/<int:profile_id>/", unblock_evaluator),
    path("bank-admin/search-evaluators/", search_evaluators),

    # SME APIs
    path("smes/", SMECreateView.as_view()),
    path("smes/report-by-br/", SMEReportByBRView.as_view()),
    path("smes/scoring-by-br/", SMEScoringByBRView.as_view()),
    path("smes/<int:pk>/report/", SMEReportView.as_view()),
    path("smes/<int:pk>/report/pdf/", SMEReportPDFView.as_view()),
    path("smes/<int:pk>/score/", SMEScoreUpdateView.as_view()),
    path("smes/<int:pk>/criterion-scores/", SMECriterionScoresView.as_view()),
    path("smes/<int:pk>/submit-capability/", SMESubmitCapabilityView.as_view()),
    path("smes/<int:pk>/capability-result/", SMECapabilityResultView.as_view()),

    # Evaluator
    path("evaluator/smes/", EvaluatorSMEsView.as_view()),
    path("evaluator/summary/", EvaluatorSummaryView.as_view()),

    # Criteria
    path("criteria/weights/", CriterionWeightsView.as_view()),

    # Bank Admin Dashboard
    path("bank-admin/dashboard-summary/", bank_admin_dashboard_summary),
    path("bank-admin/pending-evaluators/", bank_admin_pending_evaluators),
    path("bank-admin/industry-analysis/", bank_admin_industry_analysis),
    path("bank-admin/evaluator-analysis/", bank_admin_evaluator_analysis),
    path("bank-admin/evaluator-score-distribution/<int:evaluator_id>/", bank_admin_evaluator_score_distribution),
    path("bank-admin/criterion-analysis/", bank_admin_criterion_analysis),
    path("bank-admin/smes/", bank_admin_sme_list),
    path("bank-admin/sme-comparison/", bank_admin_sme_comparison),

    # Notifications
    path("evaluator/notifications/", evaluator_notifications),
    path("evaluator/notifications/mark-read/", mark_evaluator_notifications_read),
    path("smes/<int:pk>/", SMEDetailForScoringView.as_view()),
]