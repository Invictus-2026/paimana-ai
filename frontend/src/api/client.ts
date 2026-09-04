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

  getProjects: async (month?: string): Promise<ProjectData[]> => {
    let url = '/projects?limit=2000';
    if (month && month !== 'ALL') {
      url = `/monthly/projects?month=${month}`;
    }
    const res = await fetchJson<any>(url, []);
    const data = res.data?.projects || res; // Handle both GenericResponse and pure list
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
          // Remove synthetic fields and use real values if available
          nextMilestone: p.status_text || "Milestone Pending",
          nextMilestoneDate: p.end_date || new Date().toISOString().split('T')[0],
          plannedCompletionDate: p.start_date || new Date().toISOString().split('T')[0],
          forecastCompletionDate: p.end_date || new Date().toISOString().split('T')[0],
          earlyWarningLeadMonths: 0,
          topRiskDrivers: [],
          monthlyRiskHistory: []
        };
      });
    }
    return [];
  },

  getProjectById: async (id: string | number): Promise<ProjectData | null> => {
    // Fetch project details, risk assessment, and predictions concurrently
    const [data, riskRes, trajRes, predRes] = await Promise.all([
      fetchJson<any>(`/projects/${id}`, null),
      fetchJson<any>(`/projects/${id}/risk`, null),
      fetchJson<any>(`/projects/${id}/risk-trajectory`, null),
      fetchJson<any[]>(`/projects/${id}/predictions`, [])
    ]);
    
    if (data && data.name) {
      const risk = riskRes?.data || {};
      const latestPrediction = predRes && predRes.length > 0 ? predRes[0] : null;
      
      const topRiskDrivers = latestPrediction?.factors?.map((f: any) => ({
        driver: f.factor_name,
        shapContribution: f.shap_value,
        description: `Impact on project: ${f.factor_name}`,
        category: 'cost' as const
      })) || [];

      const monthlyHistory = trajRes?.data?.historical_observations?.map((obs: any) => {
        return {
          month: new Date(obs.timestamp).toLocaleString('default', { month: 'short' }),
          score: Math.round(obs.risk_score * 100)
        };
      }) || [];

      return {
        id: data.id,
        code: data.external_project_id || `PRJ-${data.id}`,
        name: data.name,
        sector: data.sector || 'Unknown',
        ministry: data.ministry || 'Unknown',
        state: data.state || 'Unknown',
        status: data.status,
        budgetCr: data.budget || 0,
        revisedBudgetCr: data.revised_cost || 0,
        cumulativeExpenditureCr: data.cumulative_expenditure || 0,
        overallRiskScore: Math.round((risk.overall_risk_score || data.overall_risk_score || 0) * 100),
        costRiskScore: risk.cost_risk_score ? Math.round(risk.cost_risk_score * 100) : 0,
        delayRiskScore: risk.delay_risk_score ? Math.round(risk.delay_risk_score * 100) : 0,
        executionRiskScore: 0,
        costOverrunPct: risk.predicted_cost_overrun_pct || data.cost_overrun_pct || 0,
        scheduleDelayDays: risk.predicted_delay_days || 0,
        nextMilestone: data.status_text || "Milestone Pending",
        nextMilestoneDate: data.end_date || new Date().toISOString().split('T')[0],
        plannedCompletionDate: data.start_date || new Date().toISOString().split('T')[0],
        forecastCompletionDate: data.end_date || new Date().toISOString().split('T')[0],
        earlyWarningLeadMonths: trajRes?.data?.metrics?.time_to_critical_months || 0,
        topRiskDrivers: topRiskDrivers,
        monthlyRiskHistory: monthlyHistory.length > 0 ? monthlyHistory : [{ month: new Date().toLocaleString('default', { month: 'short' }), score: Math.round((data.overall_risk_score || 0) * 100) }]
      };
    }

    // Fallback for real MoSPI CSV data where ID is external_project_id
    const monthlyTraj = await fetchJson<any>(`/monthly/project/${id}`, null);
    if (monthlyTraj && monthlyTraj.data && monthlyTraj.data.summary) {
       const summary = monthlyTraj.data.summary;
       return {
          id: Number(id),
          code: id.toString(),
          name: summary.project_name,
          sector: summary.sector,
          ministry: summary.ministry,
          state: 'Pan-India',
          status: summary.latest_risk_score >= 0.75 ? 'Critical' : (summary.latest_risk_score >= 0.5 ? 'At Risk' : 'Active'),
          budgetCr: summary.latest_original_cost_cr,
          revisedBudgetCr: summary.latest_revised_cost_cr,
          cumulativeExpenditureCr: summary.latest_expenditure_cr,
          overallRiskScore: Math.round(summary.latest_risk_score * 100),
          costRiskScore: Math.round(summary.latest_risk_score * 100),
          delayRiskScore: 0,
          executionRiskScore: Math.round(summary.latest_risk_score * 100),
          costOverrunPct: summary.latest_cost_overrun_pct,
          scheduleDelayDays: 0,
          nextMilestone: "Milestone Pending",
          nextMilestoneDate: new Date().toISOString().split('T')[0],
          plannedCompletionDate: new Date().toISOString().split('T')[0],
          forecastCompletionDate: new Date().toISOString().split('T')[0],
          earlyWarningLeadMonths: 0,
          topRiskDrivers: [],
          monthlyRiskHistory: monthlyTraj.data.trajectory.map((t: any) => ({
             month: t.label.split(' ')[0],
             score: Math.round(t.risk_score * 100)
          }))
       };
    }

    return null;
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
  getMonthlyOverview: () => fetchJson('/monthly/overview', { status: 'success', data: { months: [] } as any }),
  getMonthlyAvailableMonths: () => fetchJson('/monthly/available-months', { status: 'success', data: { months: [] } as any }),
  getMonthlySectors: (month: string) => fetchJson(`/monthly/sectors?month=${month}`, { status: 'success', data: { sectors: [] } as any }),
  getMonthlyState: (month: string) => fetchJson(`/monthly/state?month=${month}`, { status: 'success', data: { states: [] } as any }),
  getMonthlyPhysicalProgress: (month: string) => fetchJson(`/monthly/physical-progress?month=${month}`, { status: 'success', data: { progress: [] } as any }),
  getProjectMonthlyTrajectory: (extProjectId: string) => fetchJson(`/monthly/project/${extProjectId}`, { status: 'success', data: null as any }),
  queryCopilot: (query: string) => {
    const url = `${API_BASE_URL}/copilot/query`;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }).then(res => res.json());
  },
};
