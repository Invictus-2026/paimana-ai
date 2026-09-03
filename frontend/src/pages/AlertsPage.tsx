import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { AlertTriangle } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { data: alertResponse, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: api.getAlerts,
  });

  const alerts = Array.isArray(alertResponse) ? alertResponse : ((alertResponse as any)?.data?.alerts || []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit">Risk & Early Warning Alerts</h1>
        <p className="text-slate-500 text-sm mt-0.5 font-medium">Real-time threshold monitoring and risk anomaly feed</p>
      </div>

      {isLoading && (
        <div className="p-12 dashboard-card text-center text-slate-500">
          Fetching live alert feed from backend...
        </div>
      )}

      <div className="space-y-4">
        {alerts.map((alert: any) => (
          <div key={alert.id} className="dashboard-card p-5 flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                alert.severity === 'critical' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Project #{alert.project_id}</span>
                  <span className="text-xs text-slate-400">• {new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="font-bold text-slate-800 text-sm mt-2">{alert.message}</p>
              </div>
            </div>

            <button className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition">
              Acknowledge
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
