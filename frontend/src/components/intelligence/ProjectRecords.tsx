import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { intelligenceBase } from '../../api/intelligence';

async function records(path: string, body?: unknown) {
  const response = await fetch(intelligenceBase.replace(/\/intelligence$/, '') + '/project-updates' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Operator-Key': sessionStorage.getItem('operator-key') || '' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const value = await response.json();
  if (!response.ok) throw new Error(typeof value.detail === 'string' ? value.detail : JSON.stringify(value.detail));
  return value.data || value;
}
const field = 'w-full rounded-lg border p-2 mt-1';
export function ProjectRecords({ projectId }: { projectId: number }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [planned, setPlanned] = useState('');
  const [actual, setActual] = useState('');
  const [status, setStatus] = useState('pending');
  const [cost, setCost] = useState('');
  const [variance, setVariance] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const milestones = useQuery({ queryKey: ['record-milestones', projectId], queryFn: () => records('/milestones?project_id=' + projectId), enabled: !!projectId });
  const updates = useQuery({ queryKey: ['record-updates', projectId], queryFn: () => records('?project_id=' + projectId), enabled: !!projectId });
  async function save(path: string, body: unknown) {
    setBusy(true); setMessage('');
    try { await records(path, body); await Promise.all([milestones.refetch(), updates.refetch()]); setMessage(t('projectRecords.saved')); }
    catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  return <details className="rounded-xl border p-4 text-sm">
    <summary className="font-semibold cursor-pointer">{t('projectRecords.summary')}</summary>
    <p className="my-3 text-slate-500">{t('projectRecords.hint')}</p>
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); void save('/milestones', { project_id: projectId, name, planned_date: planned, actual_date: status === 'completed' ? actual : null, status }); }}>
      <label>{t('projectRecords.milestoneName')}<input required value={name} onChange={e => setName(e.target.value)} className={field}/></label>
      <label>{t('projectRecords.plannedDate')}<input required type="date" value={planned} onChange={e => setPlanned(e.target.value)} className={field}/></label>
      <label>{t('projectRecords.status')}<select value={status} onChange={e => setStatus(e.target.value)} className={field}><option value="pending">{t('projectRecords.statusPending')}</option><option value="in_progress">{t('projectRecords.statusInProgress')}</option><option value="completed">{t('projectRecords.statusCompleted')}</option></select></label>
      {status === 'completed' && <label>{t('projectRecords.actualCompletionDate')}<input required type="date" value={actual} onChange={e => setActual(e.target.value)} className={field}/></label>}
      <button disabled={busy || !projectId} className="rounded-lg bg-blue-700 text-white p-2 disabled:opacity-50">{t('projectRecords.saveMilestone')}</button>
    </form>
    <ul className="my-4 space-y-2">{milestones.data?.milestones.map((m: any) => <li key={m.id}>{m.name} · {m.status} · {t('projectRecords.plannedLabel', { date: m.planned_date })}{m.actual_date && ` · ${t('projectRecords.completedLabel', { date: m.actual_date })}`}</li>)}</ul>
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); void save('', { project_id: projectId, cost_actual: Number(cost), schedule_variance: Number(variance), status_text: note }); }}>
      <label>{t('projectRecords.actualExpenditure')}<input required type="number" step="any" min="0" value={cost} onChange={e => setCost(e.target.value)} className={field}/></label>
      <label>{t('projectRecords.scheduleVariance')}<input required type="number" step="any" value={variance} onChange={e => setVariance(e.target.value)} className={field}/></label>
      <label className="sm:col-span-2">{t('projectRecords.progressReference')}<textarea required value={note} onChange={e => setNote(e.target.value)} className={field}/></label>
      <button disabled={busy || !projectId} className="rounded-lg bg-blue-700 text-white p-2 disabled:opacity-50">{t('projectRecords.saveProgress')}</button>
    </form>
    <p role="status" className="my-3">{message || milestones.error?.message || updates.error?.message}</p>
    {updates.data?.updates.map((u: any) => <p key={u.id} className="mt-3 border-t pt-3">{t('projectRecords.updateLine', { status: u.status_text, cost: u.cost_actual, days: u.schedule_variance, timestamp: u.timestamp })}</p>)}
  </details>;
}
