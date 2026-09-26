export const intelligenceBase = (import.meta.env?.VITE_API_BASE_URL || '/api/v1') + '/intelligence';
export async function intelligence<T = any>(path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), (path.includes('/satellite/compute') || path.includes('/satellite/radar')) ? 300_000 : 60_000);
  try {
    const response = await fetch(intelligenceBase + path, {
      method: body === undefined ? 'GET' : 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(sessionStorage.getItem('operator-key') ? { 'X-Operator-Key': sessionStorage.getItem('operator-key')! } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail || `Request failed (${response.status})`));
    }
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}
export async function encodeFile(file: File): Promise<string> {
  if (file.size > 8_000_000) throw new Error('Choose a file smaller than 8 MB.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.readAsDataURL(file);
  });
}
