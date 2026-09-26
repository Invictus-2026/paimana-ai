import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getQueue, getReceipts, pauseInspection, queueInspection, restoreQueueBackup, syncQueue } from '../src/lib/inspectionQueue';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: { getItem: () => null } });
});
const item = (id: string) => ({ client_id: id, project_id: 1, note: 'Pier', photo_base64: 'bytes', photo_sha256: 'a'.repeat(64) });
const receipt = (id: string) => ({ id: 42, client_id: id, evidence_sha256: 'verified-hash', photo_base64: 'bytes' });

test('failed upload retains evidence and records the reason for retry', async () => {
  await queueInspection(item('offline-001'));
  globalThis.fetch = async () => { throw new Error('Offline'); };
  const result = await syncQueue();
  assert.equal(result.sent, 0);
  const pending = await getQueue();
  assert.equal(pending[0].photo_base64, 'bytes');
  assert.equal(pending[0]._sync?.lastError, 'Offline');
  assert.equal(pending[0]._sync?.attempts, 1);
});

test('retry after server commit uses the same identity and stores receipt atomically', async () => {
  await queueInspection(item('retry-001')); const ids: string[] = [];
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(String(options?.body)); ids.push(body.client_id);
    assert.equal(body._sync, undefined);
    if (ids.length === 1) throw new Error('Connection lost after commit');
    return Response.json(receipt(body.client_id));
  };
  await syncQueue(); assert.equal((await getQueue()).length, 1);
  await syncQueue(); assert.equal((await getQueue()).length, 0);
  assert.deepEqual(ids, ['retry-001', 'retry-001']);
  const saved = await getReceipts();
  assert.equal(saved.length, 1); assert.equal(saved[0].receipt.photo_base64, undefined);
});

test('simultaneous sync requests send once and partial failures remain queued', async () => {
  await queueInspection(item('good')); await queueInspection(item('bad')); let calls = 0;
  globalThis.fetch = async (_url, options) => {
    calls++; const body = JSON.parse(String(options?.body));
    if (body.client_id === 'bad') return Response.json({ detail: 'Boundary missing' }, { status: 422 });
    return Response.json(receipt(body.client_id));
  };
  const first = syncQueue(); const second = syncQueue(); assert.equal(first, second);
  assert.equal((await first).sent, 1); assert.equal(calls, 2);
  assert.deepEqual((await getQueue()).map(r => r.client_id), ['bad']);
});

test('paused records are retained and can resume without changing evidence', async () => {
  await queueInspection(item('paused'));
  await pauseInspection('paused', true);
  globalThis.fetch = async () => { throw new Error('Must not send paused record'); };
  assert.equal((await syncQueue()).errors.length, 0);
  assert.equal((await getQueue()).length, 1);
  await pauseInspection('paused', false);
  globalThis.fetch = async () => Response.json(receipt('paused'));
  assert.equal((await syncQueue()).sent, 1);
});

test('a success response without a matching receipt cannot delete local evidence', async () => {
  await queueInspection(item('receipt-required'));
  globalThis.fetch = async () => Response.json({ status: 'ok' });
  await syncQueue(); assert.equal((await getQueue()).length, 1);
  assert.equal((await getReceipts()).length, 0);
});

test('duplicate local identity cannot overwrite saved photo evidence', async () => {
  await queueInspection(item('immutable'));
  await assert.rejects(queueInspection({ ...item('immutable'), photo_base64: 'changed' }));
  assert.equal((await getQueue())[0].photo_base64, 'bytes');
});


test('backup restore validates before writing and never overwrites existing evidence', async () => {
  const record = { ...item('restore-identity-01'), captured_at: '2026-01-01T00:00:00Z', latitude: 19, longitude: 72, accuracy_m: 10 };
  await assert.rejects(restoreQueueBackup([record, { client_id: 'broken' }]));
  assert.equal((await getQueue()).length, 0);
  assert.equal((await restoreQueueBackup([record])).restored, 1);
  assert.equal((await getQueue())[0]._sync?.paused, true);
  assert.equal((await restoreQueueBackup([{ ...record, note: 'Changed' }])).skipped, 1);
  assert.equal((await getQueue())[0].note, 'Pier');
});
