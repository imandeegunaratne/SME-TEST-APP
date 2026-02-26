from django.urls import path
from .views import (
    health,
    login_view,
    SMECreateView,
    EvaluatorSMEsView,
    EvaluatorSummaryView,
    SMEScoreUpdateView,
)
from .views_signup import EvaluatorSignupView
from .viewsreport import SMEReportView
from .views import SMEByBRView


urlpatterns =[
    path("health/", health),
    path("auth/signup/", EvaluatorSignupView.as_view()),
    path("auth/login/", login_view),

    path("smes/", SMECreateView.as_view()),
    path("smes/<int:pk>/score/", SMEScoreUpdateView.as_view()),
    path("evaluator/smes/", EvaluatorSMEsView.as_view()),
    path("evaluator/summary/", EvaluatorSummaryView.as_view()),
    path("smes/<int:pk>/report/", SMEReportView.as_view()),
    path("smes/by-br/", SMEByBRView.as_view()),]