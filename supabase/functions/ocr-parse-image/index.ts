// Edge Function — OCR Scanner de devoirs (OCR.space via API Gateway)
// Reçoit une image en base64 ou URL et retourne le texte extrait par OCR.

import { handleOptions, errorResponse, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') return handleOptions(origin);
  if (req.method !== 'POST')    return errorResponse('Method Not Allowed', 405, origin);

  let base64Image: string | undefined, imageUrl: string | undefined, language: string;
  try {
    const body = await req.json();
    base64Image = body.base64Image;
    imageUrl    = body.imageUrl;
    language    = body.language ?? 'fre';
    if (!base64Image && !imageUrl)
      throw new Error('Fournir base64Image ou imageUrl');
  } catch {
    return errorResponse('Corps de requête invalide — fournir base64Image ou imageUrl', 400, origin);
  }

  const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
  if (!apiKey) return errorResponse('Configuration serveur manquante', 500, origin);

  const form = new FormData();
  if (base64Image) form.append('base64Image', base64Image);
  if (imageUrl)    form.append('url', imageUrl);
  form.append('language',          language);
  form.append('isOverlayRequired', 'false');
  form.append('detectOrientation', 'true');
  form.append('scale',             'true');
  form.append('OCREngine',         '2');

  const upstream = await fetch(
    'https://app-cfkom5or162p-api-W9z3M6eONl3L.gateway.appmedo.com/parse/image',
    { method: 'POST', headers: { 'X-Gateway-Authorization': apiKey }, body: form },
  );

  if (upstream.status === 429 || upstream.status === 402) {
    return new Response(await upstream.text(), {
      status:  upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!upstream.ok)
    return errorResponse(`Erreur OCR upstream : ${upstream.status}`, 502, origin);

  return jsonResponse(await upstream.json(), origin);
});
