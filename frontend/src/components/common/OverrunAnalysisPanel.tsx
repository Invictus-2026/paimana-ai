import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { intelligence } from '../../api/intelligence';

interface OverrunAnalysis {
  project_id: number;
  reason: string;
  prevention_steps: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  alert_message: string;
  factors: { name: string; value: number; shap_value: number }[];
  provider: string;
}

const SEVERITY_STYLES: Record<OverrunAnalysis['severity'], string> = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const OverrunAnalysisPanel: React.FC<{ projectId: number }> = ({ projectId }) => {
  const { t } = useTranslation();
  const mutation = useMutation({
    mutationFn: () => intelligence<OverrunAnalysis>(`/overrun-analysis/${projectId}`, {}),
  });

  const analysis = mutation.data;

  return (
    <div className="light-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500" />
          {t('projectDetail.overrunAnalysis.title')}
        </h2>
        <button
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending
            ? t('projectDetail.overrunAnalysis.loading')
            : analysis
              ? t('projectDetail.overrunAnalysis.regenerate')
              : t('projectDetail.overrunAnalysis.generate')}
        </button>
      </div>

      {mutation.isError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-xs text-red-700 flex items-start gap-2">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>{(mutation.error as Error)?.message || t('projectDetail.overrunAnalysis.error')}</span>
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${SEVERITY_STYLES[analysis.severity]}`}>
              {t('projectDetail.overrunAnalysis.severity')}: {analysis.severity}
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('projectDetail.overrunAnalysis.reason')}</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{analysis.reason}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('projectDetail.overrunAnalysis.prevention')}</h3>
            <ul className="list-disc list-inside space-y-1">
              {analysis.prevention_steps.map((step, i) => (
                <li key={i} className="text-sm text-slate-700">{step}</li>
              ))}
            </ul>
          </div>
          {(analysis.severity === 'high' || analysis.severity === 'critical') && (
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 text-xs text-orange-700">
              {t('projectDetail.overrunAnalysis.alertCreated', { severity: analysis.severity })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OverrunAnalysisPanel;
