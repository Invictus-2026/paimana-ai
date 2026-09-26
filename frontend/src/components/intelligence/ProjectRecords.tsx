import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
    try { await records(path, body); await Promise.all([milestones.refetch(), updates.refetch()]); setMessage('Project record saved.'); }
    catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  return <details className="rounded-xl border p-4 text-sm">
    <summary className="font-semibold cursor-pointer">Project milestones and progress records</summary>
    <p className="my-3 text-slate-500">These records require a connection. Photo inspections above can be saved offline.</p>
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); void save('/milestones', { project_id: projectId, name, planned_date: planned, actual_date: status === 'completed' ? actual : null, status }); }}>
      <label>Milestone name<input required value={name} onChange={e => setName(e.target.value)} className={field}/></label>
      <label>Planned date<input required type="date" value={planned} onChange={e => setPlanned(e.target.value)} className={field}/></label>
      <label>Status<select value={status} onChange={e => setStatus(e.target.value)} className={field}><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></label>
      {status === 'completed' && <label>Actual completion date<input required type="date" value={actual} onChange={e => setActual(e.target.value)} className={field}/></label>}
      <button disabled={busy || !projectId} className="rounded-lg bg-blue-700 text-white p-2 disabled:opacity-50">Save milestone record</button>
    </form>
    <ul className="my-4 space-y-2">{milestones.data?.milestones.map((m: any) => <li key={m.id}>{m.name} · {m.status} · Planned {m.planned_date}{m.actual_date && ` · Completed ${m.actual_date}`}</li>)}</ul>
    <form className="grid gap-3 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); void save('', { project_id: projectId, cost_actual: Number(cost), schedule_variance: Number(variance), status_text: note }); }}>
      <label>Actual expenditure (INR crore)<input required type="number" step="any" min="0" value={cost} onChange={e => setCost(e.target.value)} className={field}/></label>
      <label>Schedule variance (days; positive = late)<input required type="number" step="any" value={variance} onChange={e => setVariance(e.target.value)} className={field}/></label>
      <label className="sm:col-span-2">Progress and source reference<textarea required value={note} onChange={e => setNote(e.target.value)} className={field}/></label>
      <button disabled={busy || !projectId} className="rounded-lg bg-blue-700 text-white p-2 disabled:opacity-50">Save progress record</button>
    </form>
    <p role="status" className="my-3">{message || milestones.error?.message || updates.error?.message}</p>
    {updates.data?.updates.map((u: any) => <p key={u.id} className="mt-3 border-t pt-3">{u.status_text} · INR {u.cost_actual} crore · {u.schedule_variance} days · {u.timestamp}</p>)}
  </details>;
}
