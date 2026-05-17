from django.core.management.base import BaseCommand
from core.models import CriterionWeight
from decimal import Decimal

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # REPLACE THESE with your actual research weights
        data = [
            {"code": "C1", "title": "Business opportunity gap", "weight": "0.0746000000"},
            {"code": "C2", "title": "Customer pains and gains", "weight": "0.0815000000"},
            {"code": "C3", "title": "Interest to take risk", "weight": "0.0716000000"},
            {"code": "C4", "title": "Stakeholder Engagement & Support", "weight": "0.0541000000"},
            {"code": "C5", "title": "Competitive Position", "weight": "0.1122000000"},
            {"code": "C6", "title": "Management & Workforce Capability", "weight": "0.0462000000"},
            {"code": "C7", "title": "Streams of Revenue", "weight": "0.1872000000"},
            {"code": "C8", "title": "Cost Control & Efficiency", "weight": "0.1822000000"},
            {"code": "C9", "title": "Taking advantage of state assistance", "weight": "0.0896000000"},
            {"code": "C10", "title": "Operational Readiness", "weight": "0.1008000000"},
        ]
        for item in data:
            CriterionWeight.objects.update_or_create(
                code=item['code'], 
                defaults={'title': item['title'], 'weight': item['weight']}
            )
        self.stdout.write("Database seeded with weights!")