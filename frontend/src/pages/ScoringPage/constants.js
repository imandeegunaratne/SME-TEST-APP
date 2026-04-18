export const bands = [
  { key: "1-2", label: "1-2 Very weak", min: 1, max: 2 },
  { key: "3-4", label: "3-4 Weak", min: 3, max: 4 },
  { key: "5-6", label: "5-6 Moderate", min: 5, max: 6 },
  { key: "7-8", label: "7-8 Strong", min: 7, max: 8 },
  { key: "9-10", label: "9-10 Very strong", min: 9, max: 10 },
];

export const rubric = [
  { code: "C1", title: "Business opportunity gap", desc: { "1-2": "No clear opportunity gap or customer demand", "3-4": "Opportunity gap described but unclear; weak demand signs", "5-6": "Opportunity and customer demand are clear", "7-8": "Clear opportunity gap with real validation", "9-10": "Clear opportunity gap, proven demand with growth potential" } },
  { code: "C2", title: "Customer pains and gains", desc: { "1-2": "No clear identification of customer pains and gains, very similar to others", "3-4": "Some identification; little differentiation", "5-6": "Clear identification; some differentiation", "7-8": "Clear pains/gains and good differentiations", "9-10": "Strong, unique value proposition" } },
  { code: "C3", title: "Interest to take risk", desc: { "1-2": "Poor risk taker", "3-4": "Somewhat risk taker", "5-6": "Moderate risk taker", "7-8": "Effective risk taker", "9-10": "Takes advantage of risk always" } },
  { code: "C4", title: "Stakeholder Engagement & Support", desc: { "1-2": "Weak or unstable relationships", "3-4": "Basic relationships; limited support", "5-6": "Stable relationships with key stakeholders", "7-8": "Strong, supportive relationships", "9-10": "Long-term, trust-based stakeholder support" } },
  { code: "C5", title: "Competitive Position", desc: { "1-2": "Unaware of competition", "3-4": "Knows competitors but reacts late", "5-6": "Understands competition at a basic level", "7-8": "Actively monitors and responds", "9-10": "Strong positioning with managed competitive risk" } },
  { code: "C6", title: "Management & Workforce Capability", desc: { "1-2": "Poor management, role confusion", "3-4": "Basic management; skill gaps", "5-6": "Adequate skills and role clarity", "7-8": "Capable management and motivated staff", "9-10": "Strong leadership and high-performing team" } },
  { code: "C7", title: "Streams of Revenue", desc: { "1-2": "Unstable or irregular income", "3-4": "Some stability but highly dependent", "5-6": "Reasonably stable income", "7-8": "Stable and diversified revenue", "9-10": "Strong, growing, and predictable revenue" } },
  { code: "C8", title: "Cost Control & Efficiency", desc: { "1-2": "Costs unclear; poor control", "3-4": "Basic cost tracking", "5-6": "Costs known and generally controlled", "7-8": "Efficient cost management", "9-10": "Optimized costs with strong margins" } },
  { code: "C9", title: "Taking advantage of state assistance", desc: { "1-2": "No engagement of state", "3-4": "Some engagement of state", "5-6": "Some use of state support programs", "7-8": "Active use of state institutions/networks", "9-10": "Uses state as strategic institutional leverage" } },
  { code: "C10", title: "Operational Readiness", desc: { "1-2": "Lacks basic facilities or equipment; frequent disruptions", "3-4": "Basic resources but often inadequate", "5-6": "Adequate resources with minor issues", "7-8": "Smooth operations with basic backups", "9-10": "Strong resources; reliable operations with backups" } },
];

export function createEmptyScores() {
  return Object.fromEntries(rubric.map((item) => [item.code, { score: null, notes: "", followup: false }]));
}

export function bandKeyFromScore(score) {
  if (score <= 2) return "1-2";
  if (score <= 4) return "3-4";
  if (score <= 6) return "5-6";
  if (score <= 8) return "7-8";
  return "9-10";
}

export function clampScore(value) {
  if (Number.isNaN(value)) return null;
  if (value < 1) return 1;
  if (value > 10) return 10;
  return value;
}

export function scoreForBand(band) {
  return Math.round((band.min + band.max) / 2);
}
