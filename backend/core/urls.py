# backend/core/urls.py

from django.urls import path

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
    # login_view,  # OPTIONAL: old login (uncomment only if your frontend still uses it)
)

urlpatterns = [
    # health
    path("health/", health),

    # auth (token-based)
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/evaluator-signup/", EvaluatorSignupView.as_view(), name="evaluator-signup"),

    # OPTIONAL: old login (ONLY if still needed)
    # path("login/", login_view, name="legacy-login"),

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

    # SME scoring
    path("smes/<int:pk>/score/", SMEScoreUpdateView.as_view(), name="sme-score"),
]