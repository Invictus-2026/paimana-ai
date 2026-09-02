export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  database: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget: number;
  status: string;
  is_synthetic: boolean;
  created_at: string;
}

export interface GenericResponse<T = any> {
  status: string;
  message: string;
  data?: T;
}

export interface AlertItem {
  id: number;
  project_id: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alert_type: string;
  message: string;
  timestamp: string;
  is_resolved: boolean;
}
