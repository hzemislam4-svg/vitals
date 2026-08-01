import { DEMO_MEAL } from '../../lib/seed';
import type { AnalysisResult, FoodEstimate } from '../../lib/types';

// Server-side only. `process.env` is fully available to API routes and the
// Gemini key never leaves this file.
const API_KEY = process.env.GEMINI_API_KEY ?? '';
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

const SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'string', description: 'Short serving description, e.g. "1 bowl · 260 g"' },
          calories: { type: 'number', description: 'Estimated kcal for the whole serving' },
          protein: { type: 'number', description: 'Grams of protein' },
          carbs: { type: 'number', description: 'Grams of carbohydrates' },
          fat: { type: 'number', description: 'Grams of fat' },
          confidence: { type: 'number', description: 'Confidence 0.0 to 1.0' },
        },
        required: ['name', 'quantity', 'calories', 'protein', 'carbs', 'fat', 'confidence'],
      },
    },
  },
  required: ['items'],
};

const PROMPT = `You are a professional nutritionist who estimates food macros from photos.

Look at the photo and identify the food and drinks in it. For each distinct food item estimate:

- name: a short descriptive name
- quantity: a natural serving description, e.g. "1 bowl · 260 g", "2 slices · 220 g"
- calories: total kcal for that serving (whole number)
- protein, carbs, fat: grams (whole numbers)
- confidence: how confident you are, 0.0 to 1.0

Rules:
- If you cannot see any food clearly, return an empty "items" array.
- Be conservative: if portion size is ambiguous, use a reasonable average portion.
- Prefer round numbers. Do not invent items you cannot see.
- Respond ONLY with the JSON object, no markdown, no commentary.`;

function demoResult(): AnalysisResult {
  return {
    items: [
      {
        name: DEMO_MEAL.name,
        quantity: DEMO_MEAL.quantity,
        calories: DEMO_MEAL.calories,
        protein: DEMO_MEAL.protein,
        carbs: DEMO_MEAL.carbs,
        fat: DEMO_MEAL.fat,
        confidence: 0.72,
        source: 'demo',
      },
    ],
    model: 'demo',
  };
}

function clamp01(v: unknown): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

function normalize(raw: unknown): FoodEstimate[] {
  const items = (raw as { items?: unknown[] })?.items;
  if (!Array.isArray(items)) throw new Error('Malformed model response');
  return items
    .filter((it): it is Record<string, unknown> => !!it && typeof it === 'object')
    .slice(0, 6)
    .map((it) => {
      const num = (v: unknown, fb = 0) => {
        const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
        return Number.isFinite(n) ? Math.max(0, Math.round(n)) : fb;
      };
      return {
        name: String(it.name ?? 'Food').slice(0, 80),
        quantity: String(it.quantity ?? '').slice(0, 60),
        calories: num(it.calories),
        protein: num(it.protein),
        carbs: num(it.carbs),
        fat: num(it.fat),
        confidence: clamp01(Number(it.confidence)),
        source: 'ai' as const,
      };
    });
}

async function callModel(model: string, base64: string): Promise<FoodEstimate[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { inline_data: { mime_type: 'image/jpeg', data: base64 } },
              { text: PROMPT },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: SCHEMA,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    let status = res.status;
    let msg = errText.slice(0, 300);
    try {
      const j = JSON.parse(errText);
      status = j?.error?.status === 'NOT_FOUND' ? 404 : res.status;
      msg = j?.error?.message ?? msg;
    } catch {
      // keep raw text
    }
    const e = new Error(msg) as Error & { status?: number };
    e.status = status;
    throw e;
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty model response');

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    // The model sometimes wraps JSON in markdown fences.
    const cleaned = text.replace(/```(?:json)?/g, '').trim();
    json = JSON.parse(cleaned);
  }
  return normalize(json);
}

export async function POST(request: Request) {
  const hasKey = API_KEY.startsWith('AIza');
  if (!hasKey) {
    return Response.json(
      { error: 'GEMINI_API_KEY is not configured. Returning demo data.', ...demoResult() },
      { status: 200 }
    );
  }

  let image = '';
  try {
    const body = (await request.json()) as { image?: string };
    image = typeof body.image === 'string' ? body.image : '';
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!image) return Response.json({ error: 'Missing image' }, { status: 400 });
  // Rough cap (~9 MB of base64) to protect the route
  if (image.length > 12_000_000) {
    return Response.json({ error: 'Image too large — please retake' }, { status: 413 });
  }

  for (const model of MODELS) {
    try {
      const items = await callModel(model, image);
      return Response.json({ items, model });
    } catch (e) {
      const err = e as Error & { status?: number };
      // Model unavailable → try the next one
      if (err.status === 404 && model !== MODELS[MODELS.length - 1]) continue;
      return Response.json(
        { error: `Gemini analysis failed (${model}): ${err.message}` },
        { status: 502 }
      );
    }
  }

  return Response.json({ error: 'Analysis unavailable' }, { status: 500 });
}
