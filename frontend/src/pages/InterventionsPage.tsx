import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InterventionData } from '../data/mockData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { CheckCircle2, XCircle, Clock, ShieldAlert } from 'lucide-react';

export const InterventionsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: interventionsResponse } = useQuery({
    queryKey: ['interventions'],
    queryFn: api.getInterventions,
  });
  const interventions: InterventionData[] = interventionsResponse?.data?.interventions ?? [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'Approved' | 'Under Review' | 'Rejected' }) => {
      const response = await fetch(`${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/interventions/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_status: newStatus.toUpperCase().replace(' ', '_'), reviewer_name: 'Admin', reviewer_notes: '' }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    },
  });

  const handleUpdateStatus = (id: string, newStatus: 'Approved' | 'Under Review' | 'Rejected') => {
    updateStatusMutation.mutate({ id, newStatus });
  };

  const getStatusBadge = (status: InterventionData['status']) => {
    if (status === 'Approved') return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold">APPROVED</span>;
    if (status === 'Under Review') return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">UNDER REVIEW</span>;
    if (status === 'Rejected') return <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold">REJECTED</span>;
    return <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-bold">PROPOSED</span>;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-800 font-sans pb-6">
      {/* Header Banner */}
      <div className="light-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h1 className="text-xl font-bold text-slate-900">Action-Oriented Risk & Alerts Panel</h1>
          </div>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Human-in-the-loop governance workflow for reviewing & authorizing high-impact project risk mitigations.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
            <strong>{interventions.length}</strong> High-Priority Projects Flagged
          </span>
        </div>
      </div>

      {/* Recommended Interventions Feed */}
      <div className="space-y-4">
        {interventions.map((item) => (
          <div key={item.id} className="light-card p-6 space-y-4 border-l-4 border-l-red-500">
            {/* Top Bar: Project Info & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-[#0d52ce]">{item.id}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-500">{item.ministry} ({item.state})</span>
                </div>
                <h2
                  onClick={() => navigate(`/projects/${item.projectId}`)}
                  className="text-lg font-black text-slate-900 hover:text-[#0d52ce] cursor-pointer transition mt-0.5 font-sans"
                >
                  {item.projectName}
                </h2>
              </div>

              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold">
                  Risk Score: {item.currentRiskScore} / 100
                </span>
                {getStatusBadge(item.status)}
              </div>
            </div>

            {/* Middle: Recommended Action & Impact Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommended Human Review Action</span>
                <p className="text-sm font-bold text-slate-900 leading-snug">{item.recommendedAction}</p>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-medium">
                  <strong>Evidence Grounding:</strong> {item.evidence}
                </p>
              </div>

              <div className="md:col-span-4 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Mitigation Impact</span>
                <div className="space-y-1 text-xs font-extrabold">
                  <p className="text-emerald-600">{item.estimatedRiskImpact}</p>
                  <p className="text-[#0d52ce]">{item.estimatedTimelineImpact}</p>
                </div>
                <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-200 font-medium">
                  Officer: <strong className="text-slate-800">{item.assignedOfficer}</strong>
                </p>
              </div>
            </div>

            {/* Bottom Approval Workflow Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Last Workflow Audit: {item.lastUpdated}</span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateStatus(item.id, 'Approved')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorize Intervention</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(item.id, 'Under Review')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Request Cabinet Review</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(item.id, 'Rejected')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-xl text-xs font-bold transition"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
