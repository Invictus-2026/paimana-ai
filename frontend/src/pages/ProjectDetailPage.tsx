import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { ChevronLeft, Cpu, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProjectById(id || '1'),
    enabled: !!id,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <Link
        to="/projects"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Projects List</span>
      </Link>

      {loadingProject ? (
        <div className="p-12 dashboard-card text-center text-slate-500">
          Loading project metrics...
        </div>
      ) : project ? (
        <div className="space-y-6">
          <div className="dashboard-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Infrastructure Detail</span>
              <h1 className="text-2xl font-extrabold text-slate-900 font-outfit mt-1">{project.name}</h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">{project.description}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 self-start md:self-auto">
              {project.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dashboard-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 font-outfit">AI Cost & Delay Forecast</h3>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <p className="text-slate-500">Endpoint: <code className="text-blue-600 font-semibold">/api/v1/predictions</code></p>
                <div className="text-slate-800 space-y-1.5 pt-2">
                  <p className="flex justify-between"><span>Predicted Cost Overrun:</span> <strong className="text-amber-600 font-extrabold">+14.5%</strong></p>
                  <p className="flex justify-between"><span>Predicted Schedule Delay:</span> <strong className="text-amber-600 font-extrabold">+42 days</strong></p>
                  <p className="flex justify-between"><span>Model Version:</span> <span className="font-mono text-blue-600 font-bold">cost_v1.0-stub</span></p>
                </div>
              </div>
            </div>

            <div className="dashboard-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 font-outfit">Explainable SHAP Risk Factors</h3>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <p className="text-slate-500">Endpoint: <code className="text-blue-600 font-semibold">/api/v1/risks</code></p>
                <p className="text-slate-700 leading-relaxed pt-2">
                  SHAP Explainability feature importance ranking & Waterfall contribution analysis ready for model deployment.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500">Project record not found.</div>
      )}
    </div>
  );
};
