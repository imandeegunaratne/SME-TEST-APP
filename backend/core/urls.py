from django.urls import path
from .views import (
    health,
    login_view,          # old
    LoginView,           # new token login
    EvaluatorSignupView,
    PendingEvaluatorsView,
    ApproveEvaluatorView,
    SMEByBRView,
    EvaluatorSMEsView,
    EvaluatorSummaryView,
    SMECreateView,
    SMEScoreUpdateView,
)

urlpatterns = [
    path("health/", health),

    # auth
    path("login/", login_view),  # old
    path("auth/login/", LoginView.as_view()),
    path("auth/evaluator-signup/", EvaluatorSignupView.as_view()),

    # bank admin
    path("bank-admin/pending-evaluators/", PendingEvaluatorsView.as_view()),
    path("bank-admin/approve-evaluator/<int:profile_id>/", ApproveEvaluatorView.as_view()),

    # smes
    path("smes/by-br/", SMEByBRView.as_view()),
    path("evaluator/smes/", EvaluatorSMEsView.as_view()),
    path("evaluator/summary/", EvaluatorSummaryView.as_view()),
    path("smes/create/", SMECreateView.as_view()),
    path("smes/<int:pk>/score/", SMEScoreUpdateView.as_view()),
]