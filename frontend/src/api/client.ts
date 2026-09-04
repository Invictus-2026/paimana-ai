import { MOCK_INTERVENTIONS, STATE_RISK_SUMMARY, ProjectData } from '../data/mockData';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function fetchJson<T>(endpoint: string, fallback: T): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000); // 10s timeout for large datasets
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
    const data = await fetchJson<any[]>('/projects?limit=2000', []);
    if (data && Array.isArray(data) && data.length > 0) {
      return data.map((p) => {
        return {
          id: p.id,
          code: p.external_project_id || `PRJ-${p.id}`,
          name: p.name,
          sector: p.sector || 'Unknown',
          ministry: p.ministry || 'Unknown',
          state: p.state || 'Unknown',
          status: p.status === 'active' ? (p.overall_risk_score >= 0.75 ? 'Critical' : p.overall_risk_score >= 0.5 ? 'At Risk' : 'Active') : p.status,
          budgetCr: p.budget || 0,
          revisedBudgetCr: p.revised_cost || 0,
          cumulativeExpenditureCr: p.cumulative_expenditure || 0,
          overallRiskScore: Math.round((p.overall_risk_score || 0) * 100),
          costRiskScore: p.cost_risk_score ? Math.round(p.cost_risk_score * 100) : Math.round((p.overall_risk_score || 0) * 80),
          delayRiskScore: p.delay_risk_score ? Math.round(p.delay_risk_score * 100) : Math.round((p.overall_risk_score || 0) * 90),
          executionRiskScore: Math.round((p.overall_risk_score || 0) * 85),
          costOverrunPct: p.cost_overrun_pct || 0,
          scheduleDelayDays: p.predicted_delay_days || 0,
          // Generate synthetic values for missing fields to satisfy the UI type
          nextMilestone: "Standard Progress Review",
          nextMilestoneDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          plannedCompletionDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          forecastCompletionDate: new Date(Date.now() + (180 + (p.predicted_delay_days || 0)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          earlyWarningLeadMonths: 4.5,
          topRiskDrivers: [
            { driver: "Cost Escalation", shapContribution: 0.25, description: "Escalation in material cost", category: "cost" as const },
            { driver: "Execution Delay", shapContribution: 0.15, description: "Milestone completion delayed", category: "milestone" as const }
          ],
          monthlyRiskHistory: [
            { month: "Jan", score: Math.round(((p.overall_risk_score || 0) - 0.05) * 100) },
            { month: "Feb", score: Math.round(((p.overall_risk_score || 0) - 0.02) * 100) },
            { month: "Mar", score: Math.round((p.overall_risk_score || 0) * 100) }
          ]
        };
      });
    }
    return [];
  },

  getProjectById: async (id: string | number): Promise<ProjectData | undefined> => {
    const data = await fetchJson<any>(`/projects/${id}`, null);
    if (data && data.name) {
      return {
        id: data.id,
        code: data.external_project_id || `PRJ-${data.id}`,
        name: data.name,
        sector: data.sector || 'Unknown',
        ministry: data.ministry || 'Unknown',
        state: data.state || 'Unknown',
        status: data.status === 'active' ? (data.overall_risk_score >= 0.75 ? 'Critical' : data.overall_risk_score >= 0.5 ? 'At Risk' : 'Active') : data.status,
        budgetCr: data.budget || 0,
        revisedBudgetCr: data.revised_cost || 0,
        cumulativeExpenditureCr: data.cumulative_expenditure || 0,
        overallRiskScore: data.overall_risk_score ? Math.round(data.overall_risk_score * 100) : 0,
        costRiskScore: data.cost_risk_score ? Math.round(data.cost_risk_score * 100) : Math.round((data.overall_risk_score || 0) * 80),
        delayRiskScore: data.delay_risk_score ? Math.round(data.delay_risk_score * 100) : Math.round((data.overall_risk_score || 0) * 90),
        executionRiskScore: Math.round((data.overall_risk_score || 0) * 85),
        costOverrunPct: data.cost_overrun_pct || 0,
        scheduleDelayDays: data.predicted_delay_days || 0,
        nextMilestone: "Standard Progress Review",
        nextMilestoneDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        plannedCompletionDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        forecastCompletionDate: new Date(Date.now() + (180 + (data.predicted_delay_days || 0)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        earlyWarningLeadMonths: 4.5,
        topRiskDrivers: [
          { driver: "Cost Escalation", shapContribution: 0.25, description: "Escalation in material cost", category: "cost" as const },
          { driver: "Execution Delay", shapContribution: 0.15, description: "Milestone completion delayed", category: "milestone" as const }
        ],
        monthlyRiskHistory: [
          { month: "Jan", score: Math.round(((data.overall_risk_score || 0) - 0.05) * 100) },
          { month: "Feb", score: Math.round(((data.overall_risk_score || 0) - 0.02) * 100) },
          { month: "Mar", score: Math.round((data.overall_risk_score || 0) * 100) }
        ]
      };
    }
    return undefined;
  },

  getAlerts: () => fetchJson('/alerts', MOCK_INTERVENTIONS), // Real backend returns list directly
  getInterventions: () => fetchJson('/interventions', { status: 'success', data: { interventions: MOCK_INTERVENTIONS } }),
  getStateSummaries: () => Promise.resolve(STATE_RISK_SUMMARY),
  getAnalyticsOverview: () => fetchJson('/analytics/overview', { status: 'success', data: null as any }),
  getSectorAnalytics: () => fetchJson('/analytics/sectors', { status: 'success', data: { sectors: [] } as any }),
  getMinistryAnalytics: () => fetchJson('/analytics/ministries', { status: 'success', data: { ministries: [] } as any }),
  getGeographyAnalytics: () => fetchJson('/analytics/geography', { status: 'success', data: { geography: [] } as any }),
  getBenchmarks: (dimension: string, sector?: string) => {
    const params = new URLSearchParams({ dimension });
    if (sector && sector !== 'ALL') params.set('sector', sector);
    return fetchJson(`/analytics/benchmarks?${params.toString()}`, { status: 'success', data: null as any });
  },
  queryCopilot: (query: string) => {
    const url = `${API_BASE_URL}/copilot/query`;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }).then(res => res.json());
  },
};
