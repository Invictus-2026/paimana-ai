# PAIMANA PredictIQ 🚀
> **Production-Oriented AI-Powered Infrastructure Project Monitoring and Early-Warning Platform**

PAIMANA PredictIQ is a greenfield monorepo designed to support cost/schedule predictions, explainable risk scoring (SHAP values), automated early-warning alerts, scenario simulation, and LLM copilot capabilities for large-scale infrastructure projects.

---

## 🏗️ Repository Architecture

```text
PAIMANA/
├── frontend/             # React + TypeScript + Vite + Tailwind CSS dashboard shell
├── backend/              # FastAPI + SQLAlchemy 2.0 + Alembic REST API backend
├── ml/                   # Decoupled machine learning pipeline stubs & interfaces
├── data/                 # Managed datasets folder
│   ├── raw/              # Immutable raw ingestion files
│   ├── interim/          # Standardized interim data
│   ├── processed/        # Model-ready feature matrices
│   └── synthetic/        # Explicitly tagged synthetic/demo datasets
├── notebooks/            # Exploratory research notebooks
├── models/               # Serialized model artifacts (.pkl, .joblib)
├── scripts/              # Data generation and pipeline scripts
├── docs/                 # Architectural specifications and diagrams
├── tests/                # Monorepo architecture validation & integration test stubs
├── docker/               # Dockerfiles and web server configurations
├── .env.example          # Environment variable template
├── docker-compose.yml    # Multi-container local orchestration (Postgres, Backend, Frontend)
└── README.md
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript (`strict: true`), Vite, Tailwind CSS v4, React Router v7, TanStack Query v5, Lucide Icons, Recharts, Leaflet.
- **Backend**: Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, Alembic Migrations.
- **Database**: PostgreSQL 16 (SQLite fallback for local unit tests).
- **ML Layer**: pandas, numpy, scikit-learn, XGBoost, SHAP.
- **Infrastructure**: Docker, Docker Compose, Nginx.

---

## ⚡ Quick Start (Local Development)

### Option 1: Running with Docker Compose (Recommended)

Start all services (PostgreSQL, FastAPI Backend, React Frontend) with a single command:

```bash
# 1. Copy environment variables template
cp .env.example .env

# 2. Build and launch containers
docker-compose up --build
```

- **Frontend Application**: `http://localhost:3000` (or `http://localhost:80`)
- **FastAPI Documentation**: `http://localhost:8000/api/v1/docs`
- **Health Check Endpoint**: `http://localhost:8000/api/v1/health`

---

### Option 2: Running Services Individually

#### 1. Backend Setup (FastAPI & Database)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment and install dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run database migrations (Alembic)
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Frontend Setup (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```

- Access frontend dev app at `http://localhost:3000` or `http://localhost:5173`.

---

## 🔌 API Endpoint Contracts (`/api/v1/`)

| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/api/v1/health` | System health check & DB status | Active |
| `GET` | `/api/v1/projects` | List all monitored projects | Active |
| `GET` | `/api/v1/projects/{id}` | Get individual project detail | Active |
| `POST` | `/api/v1/projects` | Create new project metadata entry | Active |
| `GET` | `/api/v1/project-updates` | List historical project snapshots | Placeholder |
| `GET` | `/api/v1/predictions` | Cost and schedule delay predictions | Placeholder |
| `GET` | `/api/v1/risks` | Risk indices & SHAP feature values | Placeholder |
| `GET` | `/api/v1/alerts` | Active early-warning alerts feed | Placeholder |
| `GET` | `/api/v1/analytics` | Aggregated portfolio KPIs & metrics | Placeholder |
| `POST`| `/api/v1/scenarios/simulate`| What-if scenario impact simulation | Placeholder |
| `GET` | `/api/v1/interventions` | Recommended risk mitigation actions | Placeholder |

---

## 🗄️ Database Schema & Alembic Migrations

The relational schema includes SQLAlchemy models for:
- `projects` — Project metadata, budgets, and status.
- `project_updates` — Monthly progress snapshots & cost actuals.
- `milestones` — Planned vs actual milestone dates.
- `cost_records` — Granular expenditure categories.
- `risk_predictions` — Audit history of prediction outputs with model versions.
- `risk_factors` — Explainable SHAP feature values per prediction.
- `alerts` — Severity-rated threshold warning flags.
- `model_versions` — Model artifact registry and training timestamps.
- `interventions` — Actionable risk mitigations.

To generate a new database migration:
```bash
cd backend
alembic revision --autogenerate -m "Add new features"
alembic upgrade head
```

---

## 🧪 Testing & Verification

Run backend unit tests and monorepo architectural validation tests:

```bash
# Run pytest suite
PYTHONPATH=.:backend .venv/bin/pytest backend/tests/ tests/
```

Run frontend build check:

```bash
cd frontend
npm run build
```

---

## 🔒 Architectural Principles

1. **Strict Decoupling**: Frontend communicates strictly via `/api/v1` REST contracts. No direct ML imports in React.
2. **Reproducibility**: Every model prediction records `model_version` and `prediction_timestamp`.
3. **Immutable Raw Data**: `data/raw/` is never modified post-ingestion.
4. **Data Authenticity**: All synthetic or mock data is explicitly flagged with `is_synthetic=True`.

## Roadmap intelligence workspace

Open `/intelligence` for document intelligence, the commodity/climate twin, satellite evidence,
calibrated prediction bounds, contractor delivery records, offline field capture, escalation dispatch,
bilingual voice and PDF dossiers. Setup, evidence requirements, provider configuration and verified
limitations are documented in [the implementation guide](docs/roadmap-implementation.md).
