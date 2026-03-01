from django.contrib import admin

from .models import Bank, Profile, SME, CriterionWeight, SMECriterionScore
admin.site.register(Bank)
admin.site.register(Profile)
admin.site.register(SME)
admin.site.register(CriterionWeight)
admin.site.register(SMECriterionScore)