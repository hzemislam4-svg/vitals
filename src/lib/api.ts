import type { AnalysisResult } from './types';

/**
 * Client helper for the photo → nutrition estimate flow.
 * The actual model call happens in the Expo API route (server-side) so the
 * Gemini key never ships to the device.
 */
export async function analyzeFoodPhoto(base64: string): Promise<AnalysisResult> {
  const res = await fetch('/api/analyze-food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 }),
  });

  if (!res.ok) {
    let message = `Analysis failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.error ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const data = (await res.json()) as AnalysisResult;
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('No food could be recognized. Try a closer, well-lit photo.');
  }
  return data;
}
