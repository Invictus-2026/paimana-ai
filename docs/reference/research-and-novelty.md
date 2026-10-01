# PARAM — research basis, novelty and evaluation

**Audit date:** 1 October 2026. [Return to README](../../README.md).

This review combines a source-code audit with primary-source research. Code establishes what PARAM implements; external sources establish the context and limitations of the methods. Neither a roadmap nor a library citation proves that this particular application is accurate, novel in the patent sense, secure, or deployed in government.

## 1. Research question and system hypothesis

**Question:** Can one review workspace help infrastructure teams identify concerns, examine supporting evidence and record defensible follow-up more effectively than disconnected financial summaries, documents and manual correspondence?

PARAM's hypothesis is that linking these workflows reduces the work required to move from a warning to a documented decision. This is a hypothesis about an integrated system and reviewer utility. The current repository does not include a controlled user study or a prospective deployment proving it.

Useful outcomes to measure include time to locate supporting evidence, agreement on priority cases, frequency of unsupported explanations, time to resolve a review, and the completeness of recorded decisions. Model fit statistics alone cannot answer this system-level question.

## 2. Government context and a fair novelty claim

NIC describes government PAIMANA as a unified infrastructure-monitoring platform with reporting, dashboards, integration and role-based access. Its October 2025 account also discusses further AI forecasting work. Consequently, a comparison stating that PAIMANA has “no analytics,” “no digital monitoring” or “no reporting” would be inaccurate. PARAM is this repository's project name, not evidence of an official succession arrangement. [NIC, Infrastructure Project Monitoring Platform](https://informaticsweb.nic.in/article/infrastructure-project-monitoring-platform).

The official [MoSPI public dashboard](https://ipm.mospi.gov.in/Home/PublicDashboardNew) provides the institutional context. Public material does not give us a complete audited inventory of every internal government capability. Absence from a public description is not proof that a feature does not exist.

### Defensible contribution statements

| Candidate contribution | What the repository supplies | What would establish stronger novelty/value |
|---|---|---|
| Evidence-connected project review | Financial data, source passages, observations and actions share project context | Compare reviewer effort/error against current practice using the same cases |
| Explicit uncertainty prerequisites | Model-version matching, residual calibration and unavailable states | Prospective coverage/width tests by sector and reporting period |
| Retry-safe field receipt workflow | Stable identity, server deduplication and atomic local acknowledgement | Physical-device fault injection under intermittent connectivity |
| Source-conscious local LLM explanations | Saved prediction/factors, source excerpts and structured outputs | Independent groundedness assessment and prompt-injection testing |
| Review-oriented satellite comparison | Cloud/common-pixel handling, scene provenance and disclosed thresholds | Labeled project-level change study across sensors, seasons and construction types |
| Auditable delivery/decision separation | Persistent attempts, expiring bearer grants, explicit decision POST | Concurrency, incident-recovery and reviewer-usability testing at realistic load |

These are **engineering contributions and research directions**. Do not claim a first-ever algorithm, proven superiority over the government platform, or legal novelty without a much broader prior-art study.

## 3. Predictive modeling: what is being estimated?

PARAM has distinct estimands and code paths:

1. **Recorded cost growth:** revised versus original cost. This measures a revision already present in the input data; it is not a future final cost label.
2. **Composite schedule/risk estimates:** formulas with sector constants. Their numeric output should be evaluated as a heuristic rather than described as learned inference.
3. **Saved-model outputs:** cost classifier/regressor, delay regressor and risk regressor. Quality depends on their feature/target definitions, training data and evaluation split.
4. **Risk-regression target:** the training code can generate a composite score as a target. Predicting a constructed score well is not equivalent to predicting an independently observed project failure.

A proper prospective benchmark requires dated feature snapshots before the evaluation event, documented actual outcomes, known reporting delays, and a comparison against simple baselines. The same project may appear across train/test dates; that can be appropriate for forecasting known projects but does not test generalization to entirely new projects. Report both settings when they matter.

### Evaluation design

| Task | Suggested measures | Required controls |
|---|---|---|
| Cost overrun classification | Precision/recall, PR-AUC, Brier score, calibration curve | Explicit overrun threshold, prevalence, independent labels and decision horizon |
| Cost overrun regression | MAE/RMSE in percentage points; monetary error by size band | Final versus revised cost distinction; outlier reporting |
| Delay regression | MAE in days, median error and tail error | Actual finish dates, incomplete-project handling and censoring |
| Priority ranking | Precision at top-k, missed critical cases, review capacity | Same fixed portfolio/date and policy for all methods |
| New-project generalization | Metrics on held-out project IDs | Group separation, no future sector/ministry statistics |
| Forward performance | Rolling-origin evaluation | No fitting or tuning on future reporting periods |

Training helpers can fill missing values or use domain defaults. Complete API payloads alone do not establish that those fields were measured. Keep a provenance/missingness indicator for externally supplied inputs and audit the target construction before publishing accuracy figures.

## 4. Explainability: TreeSHAP and the LLM serve different purposes

TreeSHAP decomposes a model output under specified assumptions about feature dependence. PARAM's active inference route uses CatBoost's SHAP output for the risk model; the generic SHAP module is a separate implementation. The contributions and baseline correspond to the raw model output, which can differ from the clipped risk returned to users. See the [official SHAP TreeExplainer reference](https://shap.readthedocs.io/en/latest/generated/shap.TreeExplainer.html).

A feature with a large SHAP value influenced the prediction. It does not establish that changing that feature would causally prevent a delay. Correlation, model design and correlated inputs affect interpretation. Interventions require engineering and administrative evidence beyond an attribution ranking.

Ollama provides a chat endpoint and supports structured output controls. PARAM uses it for bounded query planning, document-grounded responses and JSON overrun analysis. The external API capability does not guarantee the truth of the generated text. [Ollama chat reference](https://docs.ollama.com/api/chat).

Recommended explanation evaluation:

- Have reviewers check each factual claim against the supplied record or cited page.
- Report unsupported-claim rate, citation correctness and answer completeness separately.
- Include cases with missing attribution, conflicting documents and no matching text.
- Test whether a document containing malicious instructions can redirect the assistant.
- Assess whether prevention suggestions are appropriate and feasible, not merely fluent.

The overrun endpoint currently creates persistent high/critical alerts based on LLM-assigned severity. Evaluate false-alert rate and duplicate generation before operational automation. Prompting the model to stay grounded is an instruction, not an enforced causal validator.

## 5. Uncertainty: split conformal intervals

The implementation calibrates absolute residuals using an independent declared held-out set, matching the saved model-version string. It uses the finite-sample rank `ceil((n+1) × 0.9)` and clips the lower delay bound at zero. At least nine pairs are needed by this implementation to avoid an unavailable finite rank at 90% coverage.

Conformal prediction's usual marginal-coverage interpretation depends on assumptions such as exchangeability. Temporal drift, changed project populations and a reused calibration set can undermine the intended interpretation. A nominal 90% interval is not a promise for an individual project. [Angelopoulos and Bates, A Gentle Introduction to Conformal Prediction](https://arxiv.org/abs/2107.07511).

For PARAM, report empirical coverage, interval width, calibration sample count, outcome horizon and model artifact identity. Break results down by sector, budget band and time period. A model-fingerprint match is necessary bookkeeping; it does not prove that the pairs were produced independently or sampled representatively. The API currently accepts `held_out: true` as an operator assertion.

A future improvement is a signed, versioned calibration artifact generated from a reproducible split, rather than manually supplied residual pairs. Avoid claiming that this is implemented already.

## 6. Completion curves: survival analysis

Kaplan–Meier estimates survival from event and right-censoring information. In this setting, survival means the project has not yet completed; completion is `1 − survival`. A censored project contributes time at risk without being counted as completed at its observation boundary. [lifelines KaplanMeierFitter reference](https://lifelines.readthedocs.io/en/latest/fitters/univariate/KaplanMeierFitter.html).

PARAM implements its own small Kaplan–Meier calculation and correctly groups tied event/censor times. The UI's financial-year estimate conditions the cohort curve on still being incomplete at current age, where supported by follow-up. It is not a project-specific Cox-PH result, even though baseline Cox artifacts exist elsewhere in the repository.

Evaluate cohort selection, event-date accuracy, censoring mechanism and follow-up support. Publish at-risk counts. A single heterogeneous cohort spanning very different sectors and sizes may be poorly applicable to an individual project. Future work could validate stratified or covariate-based models, but their performance should not be presumed.

## 7. Earth observation: change is not completion

Sentinel-2 processing involves reflectance scaling, quality information and processing-baseline considerations. PARAM uses these when interpreting optical assets, masks invalid/cloud pixels and compares common project pixels. [Copernicus Sentinel-2 processing](https://sentiwiki.copernicus.eu/web/s2-processing).

The Planetary Computer Sentinel-1 RTC collection provides processed radar observations; PARAM consumes that product rather than implementing a complete radar terrain-correction chain. Scene geometry and polarization must be compatible. [Provider RTC collection metadata](https://planetarycomputer.microsoft.com/api/stac/v1/collections/sentinel-1-rtc).

PARAM's current discrepancy rules compare claimed progress with optical-index or radar-power change. These are manually chosen thresholds. They are not trained semantic segmentation, object detection, height estimation or independent measurement of physical percentage completion.

A credible EO study needs surveyed project polygons, dated site truth and expert annotation. Use held-out projects, not merely nearby tiles from the same site. Evaluate false positives from monsoon/seasonality, bare soil, vegetation clearance, flooding, sensor differences and alignment. Compare the satellite signal with an appropriate baseline and report cases where imagery cannot support a decision.

Recommended metrics include precision/recall for review-worthy discrepancy, usable-observation rate, delay from site event to detection and analyst time per accepted signal. Do not advertise “fraud-detection accuracy” without a legally and factually appropriate ground-truth definition.

## 8. Offline evidence and audio architecture

IndexedDB provides transactional browser storage. PARAM uses a transaction to store a matching receipt and remove its queued payload together. This is the foundation of local recovery, while stable client IDs provide server retry identity. [MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

Service workers support caching and offline request handling in secure contexts. PARAM caches application assets and handles navigation fallback; it intentionally does not cache all API responses. This does not guarantee storage persistence forever or execution after the browser closes. [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).

Test actual device/browser combinations under disconnection before/after server commit, duplicate requests, low-storage conditions, page reload, tab concurrency and interrupted backup restore. A file hash shows consistency of bytes; GPS/time supplied by a device are not cryptographic attestation of where and when those bytes were captured.

Gemini Live is a stateful WebSocket interface supporting audio exchange and session setup. PARAM relays it through the backend and uses project context; the provider API's availability does not establish the application's microphone/playback acceptance. [Google Live API reference](https://ai.google.dev/api/live). Keep voice-data disclosure and retention requirements explicit when deploying with actual project records.

## 9. Current gaps that matter to research claims

| Gap | Implication | Priority experiment / engineering change |
|---|---|---|
| Snapshot and temporal paths coexist | Metrics can describe different problems | Dataset/target cards for every artifact |
| Hand-set composite/EO/BOM constants | Numbers can appear more certain than evidence permits | Sensitivity analysis and externally reviewed calibration |
| Legacy fixed fallbacks and approximated UI sub-scores | Some displays can obscure missing evidence | Remove or label them before interpreting screen values as observations |
| Little populated intelligence evidence in local DB | UI breadth is not evidence of full real-project validation | Curated, permissioned end-to-end case study |
| No complete RBAC or tenant isolation | Real sensitive projects need stronger boundaries | Identity/authorization design and access tests |
| Lexical retrieval only | Semantic and scanned-document questions can fail | Compare lexical baseline, OCR and retrieval variants on a labeled corpus |
| In-memory trajectory state | Process restart changes cooldown/state behavior | Persistent state design and recovery tests |
| Selective operator gating | Some writes/reads bypass shared-key policy | Full route-level policy review |
| Large synchronous handlers | Latency and throughput under load are unknown | Timed workload tests and bounded job execution |
| Foreign-key gaps in evidence/grants | Orphan prevention relies on application logic | Explicit referential-integrity/migration plan |
| UI timeout shorter than some provider calls | User can see failure while server completes work | End-to-end request IDs and operation status semantics |

## 10. Recommended evidence package for a paper or judge review

1. **Dataset card:** publishers, permissions, dates, fields, source URLs/hashes, missingness, synthetic flags and known coverage gaps.
2. **Model card per artifact:** feature order/units, target, training split, seed, versions, calibration, subgroup errors and intended use.
3. **Reproducible benchmark:** frozen inputs and separate chronological/project-held-out baselines; no test-set tuning.
4. **Grounding evaluation:** cited-answer scoring by independent reviewers and explicit unsupported-claim examples.
5. **EO case report:** surveyed polygon, scenes/quality, site truth and false-positive analysis.
6. **Device acceptance report:** browser/device, offline steps, receipts and failure recovery evidence.
7. **Operational review:** permission policy, audit persistence, delivery ambiguity, decision replay/concurrency and recovery.
8. **User study:** time/accuracy with and without the integrated workflow, including explanations of uncertain results.

The research contribution becomes stronger when a claim can be traced from a specific implementation to a test, dataset and result. This document intentionally does not invent benchmark results, production integrations or endorsements.

## 11. Source index

All links were consulted on 1 October 2026. They support the context or method named, not PARAM-specific accuracy claims.

| Primary source | Why it matters |
|---|---|
| [NIC: Infrastructure Project Monitoring Platform](https://informaticsweb.nic.in/article/infrastructure-project-monitoring-platform) | Government PAIMANA context and a fair baseline for comparison |
| [MoSPI public dashboard](https://ipm.mospi.gov.in/Home/PublicDashboardNew) | Official monitoring context |
| [Angelopoulos & Bates: conformal prediction](https://arxiv.org/abs/2107.07511) | Finite-sample calibration and coverage interpretation |
| [SHAP TreeExplainer](https://shap.readthedocs.io/en/latest/generated/shap.TreeExplainer.html) | Tree attribution and dependence assumptions |
| [lifelines KaplanMeierFitter](https://lifelines.readthedocs.io/en/latest/fitters/univariate/KaplanMeierFitter.html) | Event/censoring interpretation |
| [Ollama chat API](https://docs.ollama.com/api/chat) | Actual local text-model protocol |
| [Gemini Live protocol](https://ai.google.dev/api/live) | Separate streaming audio protocol |
| [Copernicus Sentinel-2 processing](https://sentiwiki.copernicus.eu/web/s2-processing) | Optical preprocessing/quality context |
| [Planetary Computer Sentinel-1 RTC](https://planetarycomputer.microsoft.com/api/stac/v1/collections/sentinel-1-rtc) | Radar product provenance |
| [MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) | Transactional local storage |
| [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) | Offline shell architecture and browser requirements |
