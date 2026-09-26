import { intelligence } from '../api/intelligence';
export interface QueuedInspection { client_id: string; _sync?: { attempts: number; lastError?: string; paused?: boolean }; [key: string]: unknown }
export interface InspectionReceipt { client_id: string; receipt: Record<string, unknown>; synced_at: string }
const openDB = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open('paimana-field-v1', 2);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains('queue')) request.result.createObjectStore('queue', { keyPath: 'client_id' });
    if (!request.result.objectStoreNames.contains('receipts')) request.result.createObjectStore('receipts', { keyPath: 'client_id' });
  };
  request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  request.onblocked = () => reject(new Error('Close other PAIMANA tabs to upgrade offline storage.'));
});
async function transaction<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>, store = 'queue'): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode); const req = fn(tx.objectStore(store));
    tx.oncomplete = () => { db.close(); resolve(req.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}
export const queueInspection = (record: QueuedInspection) => transaction('readwrite', s => s.add(record));
export const getQueue = () => transaction<QueuedInspection[]>('readonly', s => s.getAll());
export const getReceipts = () => transaction<InspectionReceipt[]>('readonly', s => s.getAll(), 'receipts');
let syncing: Promise<{ sent: number; errors: string[] }> | null = null;
export async function pauseInspection(id: string, paused: boolean) {
  if (syncing) await syncing;
  const record = await transaction<QueuedInspection | undefined>('readonly', s => s.get(id));
  if (!record) throw new Error('Inspection already synced or no longer queued.');
  return transaction('readwrite', s => s.put({ ...record, _sync: { ...record._sync, attempts: record._sync?.attempts || 0, paused } }));
}
async function acknowledge(clientId: string, receipt: Record<string, unknown>) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(['queue', 'receipts'], 'readwrite');
    // Receipt and queue deletion commit together; interruption cannot lose both.
    const { photo_base64: _photo, ...metadata } = receipt;
    tx.objectStore('receipts').put({ client_id: clientId, receipt: metadata, synced_at: new Date().toISOString() });
    tx.objectStore('queue').delete(clientId);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}
export function syncQueue() {
  if (syncing) return syncing;
  syncing = (async () => {
    let sent = 0; const errors: string[] = [];
    for (const record of await getQueue()) {
      if (record._sync?.paused) continue;
      const { _sync, ...payload } = record;
      try {
        const receipt = await intelligence<Record<string, unknown>>('/inspections', payload);
        if (!receipt.id || receipt.client_id !== record.client_id || !receipt.evidence_sha256) throw new Error('Server did not return a valid inspection receipt. Kept local copy.');
        await acknowledge(record.client_id, receipt); sent++;
      } catch (error) {
        const lastError = (error as Error).message;
        errors.push(`${record.client_id}: ${lastError}`);
        await transaction('readwrite', s => s.put({ ...record, _sync: { ..._sync, attempts: (_sync?.attempts || 0) + 1, lastError } }));
      }
    }
    return { sent, errors };
  })().finally(() => { syncing = null; });
  return syncing;
}

export async function restoreQueueBackup(input: unknown) {
  if (!Array.isArray(input) || input.length > 100) throw new Error('Backup must contain at most 100 inspections.');
  const requiredStrings = ['client_id', 'captured_at', 'note', 'photo_base64', 'photo_sha256'];
  const requiredNumbers = ['project_id', 'latitude', 'longitude', 'accuracy_m'];
  // Validate the entire backup first, so malformed files do not partially import.
  for (const row of input) {
    if (!row || typeof row !== 'object' || requiredStrings.some(k => typeof row[k] !== 'string') || requiredNumbers.some(k => typeof row[k] !== 'number' || !Number.isFinite(row[k]))) throw new Error('Invalid inspection backup schema.');
    if (row.client_id.length < 16 || row.client_id.length > 64 || row.photo_base64.length > 11_000_000 || !/^[a-f0-9]{64}$/.test(row.photo_sha256)) throw new Error('Invalid identity, photo or hash in backup.');
  }
  const known = new Set([...(await getQueue()).map(r => r.client_id), ...(await getReceipts()).map(r => r.client_id)]);
  let restored = 0;
  for (const row of input) {
    if (known.has(row.client_id)) continue;
    const record: QueuedInspection = { client_id: row.client_id };
    for (const key of [...requiredStrings, ...requiredNumbers]) record[key] = row[key];
    // Restored evidence starts paused so the operator can review before sending.
    record._sync = { attempts: 0, paused: true };
    await queueInspection(record); known.add(row.client_id); restored++;
  }
  return { restored, skipped: input.length - restored };
}
