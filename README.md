## GOAL Foundation

Minimal Next.js + TypeScript + Tailwind CSS starter focused on a premium responsive navbar and simple home placeholder.

### Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## SMV scoring model (evidence-first)

The `/smv` module now runs on an evidence-first architecture:

- 8 dimensions are stored in `smv_dimensions`.
- Users log evidence (`smv_evidence_logs`) and metric values (`smv_evidence_metric_values`).
- The scoring engine computes weighted scores per dimension from real metric values (`smv_metrics`).
- Guard rules cap scores when evidence is not strong enough (e.g. confidence cap with low interactions, status cap without income threshold).
- Latest score is persisted in `smv_dimension_scores` and every recalculation snapshot is recorded in `smv_score_history`.
- Improvement tasks are generated from score gaps into `smv_improvement_tasks`.

Current full metric coverage is implemented for: **confidence, look, status, purpose**.
The remaining dimensions are scaffolded for future metric expansion.
