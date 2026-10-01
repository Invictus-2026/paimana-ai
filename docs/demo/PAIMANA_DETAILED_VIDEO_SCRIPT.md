# PARAM — 7-Minute Video Script

## 0:00–0:30 | Introduction

“Government infrastructure monitoring needs more than a record of expenditure and progress. It needs timely signals that help reviewers decide where to investigate and what to do next.

Our project is PARAM. PAIMANA is the previous government project; PARAM is the platform we are presenting today. It brings together portfolio analytics, predictive models, document intelligence, satellite observations and field evidence to support earlier, better-informed intervention.”

## 0:30–1:05 | Portfolio Dashboard

“The PARAM dashboard provides an overview of the infrastructure portfolio. Reviewers can examine project counts, financial exposure, sector distribution and changes across the available reporting periods.

The charts help identify where attention is needed. We can inspect individual values, expand a chart and compare sectors before moving into a particular project.

The reporting period remains important: these figures represent the records available to the platform. This gives the reviewer a starting point for investigation, with the financial context visible alongside the risk indicators.”

## 1:05–1:45 | Project Monitoring and History

“The project register lets us search and filter by ministry, sector, state and other project attributes. Rather than reviewing the entire portfolio one record at a time, we can narrow our attention to a relevant group.

Opening a project brings its financial position and available monthly history into one view. We can examine cost growth, expenditure and the direction of its recorded risk.

This history helps us ask better questions. Is the issue recent, or has it persisted across reporting periods? Is expenditure increasing while progress remains limited? PARAM brings those records together so reviewers can investigate the pattern before deciding on an intervention.”

## 1:45–2:25 | AI Overrun Analysis

“PARAM also provides an AI Overrun Analysis panel powered by a locally hosted Ollama model.

When we generate an analysis, the backend supplies the project's latest saved prediction and available risk-factor attributions. The response presents an explanation, suggested prevention steps and a severity level.

Where SHAP attribution is available, it describes which features influenced the model output. That influence is evidence about the model's reasoning, not proof of a real-world cause.

If the generated analysis returns high or critical severity, PARAM records an alert for follow-up. The reviewer can then assess the explanation against the underlying records rather than treating the AI's recommendation as an automatic decision.”

## 2:25–3:05 | Cost, Schedule and Predictive Models

“The analytics views help reviewers compare cost exposure and estimated schedule delay across projects. These portfolio views use composite calculations over the available records.

PARAM also has a separate workflow for running saved machine-learning models. It accepts eighteen supplied features covering financial, schedule, progress and historical information, then records the prediction and its model version.

Prediction bounds add another layer: when matching independent calibration outcomes are available, PARAM can display a calibrated delay interval instead of only a single estimate. A completion curve provides cohort-level context. Where the evidence is insufficient, the system reports that limitation rather than presenting an unsupported range.”

## 3:05–3:35 | Benchmarks and State Progress

“A risk indicator becomes more useful when we understand its context. PARAM's benchmarks compare relevant groups and show the sample sizes behind those comparisons. Small groups are marked as insufficient, helping reviewers avoid conclusions based on too little evidence.

State Progress adds a geographic view of the recorded portfolio. Together, the benchmark tables and India map help reviewers compare sectors and regions, identify concentrations of concern and decide which projects need a closer look.”

## 3:35–4:15 | Document Intelligence and Multilingual Access

“PARAM's document workspace connects project questions to uploaded PDFs, text and structured records. Relevant passages are retrieved with document names and page references, allowing the reviewer to check the source behind an answer.

With Ollama configured, the assistant uses that retrieved context to generate a response. Portfolio questions can also filter matching project records, with the applied filters available for inspection.

The interface offers English, Hindi, Tamil and Bengali, and passes the selected language to the assistant. Browser dictation supports spoken questions. A separate Gemini Live integration supports audio conversation when its model, credentials and microphone access are configured.”

## 4:15–4:50 | Cost and Climate Scenarios

“The cost and climate workspace explores how changing assumptions could affect a project. For example, we can increase steel prices, add rain days and specify how much expenditure remains.

PARAM then estimates incremental cost and a schedule buffer using the displayed material and productivity assumptions. The same scenario can be applied across the portfolio.

Dated market observations can also support a comparison between two periods. These are sensitivity calculations: they help reviewers prepare for possible changes, without claiming to predict future prices, weather or final contractual costs.”

## 4:50–5:25 | Satellite-Based Evidence

“Satellite observations provide another source of evidence alongside reported progress. PARAM supports comparisons of optical imagery and compatible radar observations within a registered project boundary.

The comparison retains source dates and measures changes that may warrant investigation. A discrepancy between observed change and claimed progress can trigger a review alert.

The distinction matters: satellite change does not directly establish a construction completion percentage or prove fraud. Cloud conditions, acquisition quality and the nature of the project affect interpretation. PARAM uses this evidence to guide further review and site verification.”

## 5:25–6:00 | Offline Field Inspection and Contractor Performance

“Field inspections connect the site to the monitoring process. An engineer can record a note, photo and location, then save the inspection on the device when connectivity is unavailable. The queue retains it for synchronization, and a successful submission receives a server receipt.

Photo hashes support integrity checks, while location is checked against the registered boundary. Device-reported information still requires appropriate review.

PARAM also brings contractor delivery records together through InfraScore. It shows performance indicators and sample size, with a score requiring at least three projects. This supports delivery assessment, not automatic blacklisting.”

## 6:00–6:40 | Alerts, Human Decisions and Reports

“PARAM connects these findings to an operational review process. Recorded alerts highlight issues, while explicitly generated review actions retain the available risk and exposure evidence.

A reviewer records their name, notes and decision. Configured dispatch adapters support Telegram, WhatsApp, email and Slack, with an audit of the delivery attempt. Signed decision links expire after twenty-four hours and require an explicit approval or rejection; simply opening a link does not approve an action.

Finally, the executive dossier exports the project's financial context, alerts, decisions and available evidence into a PDF, giving the next review meeting a concise record to work from.”

## 6:40–7:00 | Closing

“PARAM brings portfolio visibility, predictive models, document intelligence, scenario planning and site evidence into one review workflow.

Its purpose is to help teams identify concerns earlier, examine the evidence and record accountable decisions. By keeping assumptions visible and human judgment central, PARAM supports a more informed approach to infrastructure monitoring. Thank you.”
