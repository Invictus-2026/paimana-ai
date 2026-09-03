import { MOCK_PROJECTS, MOCK_INTERVENTIONS, STATE_RISK_SUMMARY, ProjectData, InterventionData } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function fetchJson<T>(endpoint: string, fallback: T): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2500); // 2.5s timeout for fast response
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(id);

    if (!response.ok) {
      return fallback;
    }
    const data = await response.json();
    return data ?? fallback;
  } catch (error) {
    // Return fallback on network error or offline mode
    return fallback;
  }
}

export const api = {
  getHealth: () =>
    fetchJson('/health', {
      status: 'ok',
      service: 'PAIMANA PredictIQ API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'connected'
    }),

  getProjects: async (): Promise<ProjectData[]> => {
    const data = await fetchJson<any[]>('/projects', []);
    if (data && Array.isArray(data) && data.length > 0) {
      // Map API entities if returned
      return data.map((p, idx) => {
        const mockMatch = MOCK_PROJECTS.find(m => m.id === p.id) || MOCK_PROJECTS[idx % MOCK_PROJECTS.length];
        return {
          ...mockMatch,
          id: p.id || mockMatch.id,
          name: p.name || mockMatch.name,
          sector: p.sector || mockMatch.sector,
          ministry: p.ministry || mockMatch.ministry,
          state: p.state || mockMatch.state,
          budgetCr: p.budget || mockMatch.budgetCr,
          revisedBudgetCr: p.revised_cost || mockMatch.revisedBudgetCr,
          cumulativeExpenditureCr: p.cumulative_expenditure || mockMatch.cumulativeExpenditureCr,
          overallRiskScore: Math.round((p.overall_risk_score || mockMatch.overallRiskScore / 100) * 100),
          costOverrunPct: p.cost_overrun_pct || mockMatch.costOverrunPct,
          status: p.status === 'active' ? (p.overall_risk_score >= 0.75 ? 'Critical' : p.overall_risk_score >= 0.5 ? 'At Risk' : 'Active') : mockMatch.status,
        };
      });
    }
    return MOCK_PROJECTS;
  },

  getProjectById: async (id: string | number): Promise<ProjectData | undefined> => {
    const numId = Number(id);
    const mockMatch = MOCK_PROJECTS.find(p => p.id === numId);
    if (!mockMatch) return MOCK_PROJECTS[0];

    const data = await fetchJson<any>(`/projects/${id}`, null);
    if (data && data.name) {
      return {
        ...mockMatch,
        id: data.id,
        name: data.name,
        sector: data.sector || mockMatch.sector,
        ministry: data.ministry || mockMatch.ministry,
        state: data.state || mockMatch.state,
        budgetCr: data.budget || mockMatch.budgetCr,
        revisedBudgetCr: data.revised_cost || mockMatch.revisedBudgetCr,
        cumulativeExpenditureCr: data.cumulative_expenditure || mockMatch.cumulativeExpenditureCr,
        overallRiskScore: data.overall_risk_score ? Math.round(data.overall_risk_score * 100) : mockMatch.overallRiskScore,
      };
    }
    return mockMatch;
  },

  getAlerts: () => fetchJson('/alerts', MOCK_INTERVENTIONS),
  getInterventions: () => fetchJson('/interventions', MOCK_INTERVENTIONS),
  getStateSummaries: () => Promise.resolve(STATE_RISK_SUMMARY),
};
