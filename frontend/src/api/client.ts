import { HealthResponse, Project, GenericResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[API Error] Request failed for ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  getHealth: () => fetchJson<HealthResponse>('/health'),
  getProjects: () => fetchJson<Project[]>('/projects'),
  getProjectById: (id: string | number) => fetchJson<Project>(`/projects/${id}`),
  getAlerts: () => fetchJson<GenericResponse>('/alerts'),
  getPredictions: (projectId?: number) => 
    fetchJson<GenericResponse>(`/predictions${projectId ? `?project_id=${projectId}` : ''}`),
  getRisks: (projectId?: number) => 
    fetchJson<GenericResponse>(`/risks${projectId ? `?project_id=${projectId}` : ''}`),
  getAnalytics: () => fetchJson<GenericResponse>('/analytics'),
  getScenarios: () => fetchJson<GenericResponse>('/scenarios'),
  getInterventions: (projectId?: number) => 
    fetchJson<GenericResponse>(`/interventions${projectId ? `?project_id=${projectId}` : ''}`),
};
