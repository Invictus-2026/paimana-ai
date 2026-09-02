import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_INTERVENTIONS, InterventionData } from '../data/mockData';
import { AlertTriangle, CheckCircle2, XCircle, Clock, ShieldAlert, ArrowRight, UserCheck, FileText } from 'lucide-react';

export const InterventionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [interventions, setInterventions] = useState<InterventionData[]>(MOCK_INTERVENTIONS);
  const [activeLogModal, setActiveLogModal] = useState<string | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<string>('');

  const handleUpdateStatus = (id: string, newStatus: 'Approved' | 'Under Review' | 'Rejected') => {
    setInterventions(prev =>
      prev.map(item => item.id === id ? { ...item, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] } : item)
    );
    setActiveLogModal(null);
    setDecisionNotes('');
  };

  const getStatusBadge = (status: InterventionData['status']) => {
    if (status === 'Approved') return <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">APPROVED</span>;
    if (status === 'Under Review') return <span className="px-2.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-[10px] font-bold">UNDER REVIEW</span>;
    if (status === 'Rejected') return <span className="px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold">REJECTED</span>;
    return <span className="px-2.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-bold">PROPOSED</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131c31] border border-[#23304a] p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h1 className="text-xl font-extrabold text-white font-outfit">Action-Oriented Intervention Panel</h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Human-in-the-loop governance workflow for reviewing & authorizing high-impact project risk mitigations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-300 bg-[#1b253b] px-3 py-1.5 rounded-lg border border-[#283654]">
            5 High-Priority Projects Flagged
          </span>
        </div>
      </div>

      {/* Recommended Interventions Feed */}
      <div className="space-y-4">
        {interventions.map((item) => (
          <div key={item.id} className="dark-dashboard-card p-6 space-y-4 border-l-4 border-l-red-500">
            {/* Top Bar: Project Info & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#23304a] pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-blue-400">{item.id}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs font-semibold text-slate-300">{item.ministry} ({item.state})</span>
                </div>
                <h2
                  onClick={() => navigate(`/projects/${item.projectId}`)}
                  className="text-lg font-black text-white font-outfit hover:text-blue-400 cursor-pointer transition mt-0.5"
                >
                  {item.projectName}
                </h2>
              </div>

              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black font-outfit">
                  Risk: {item.currentRiskScore} / 100
                </span>
                {getStatusBadge(item.status)}
              </div>
            </div>

            {/* Middle: Recommended Action & Impact Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommended Human Review Action</span>
                <p className="text-sm font-bold text-white leading-snug">{item.recommendedAction}</p>
                <p className="text-xs text-slate-300 bg-[#162035] p-2.5 rounded-lg border border-[#23304a] leading-relaxed">
                  <strong>Evidence Grounding:</strong> {item.evidence}
                </p>
              </div>

              <div className="md:col-span-4 space-y-2 bg-[#182238] p-3 rounded-xl border border-[#283654]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Mitigation Impact</span>
                <div className="space-y-1 text-xs font-extrabold">
                  <p className="text-emerald-400">{item.estimatedRiskImpact}</p>
                  <p className="text-blue-400">{item.estimatedTimelineImpact}</p>
                </div>
                <p className="text-[10px] text-slate-400 pt-1 border-t border-[#23304a]">
                  Officer: <strong className="text-slate-200">{item.assignedOfficer}</strong>
                </p>
              </div>
            </div>

            {/* Bottom Approval Workflow Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#23304a]">
              <span className="text-[11px] text-slate-400">Last Workflow Audit: {item.lastUpdated}</span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateStatus(item.id, 'Approved')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorize Intervention</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(item.id, 'Under Review')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-300 border border-yellow-500/40 rounded-lg text-xs font-bold transition"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Request Cabinet Review</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(item.id, 'Rejected')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 rounded-lg text-xs font-bold transition"
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
