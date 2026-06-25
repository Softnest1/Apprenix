// Edge Function — send-contact-email
// Enregistre le message de contact en base et l'envoie via Brevo (si configuré).

import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleOptions, makeCorsHeaders, errorResponse, jsonResponse } from '../_shared/cors.ts';

const OBJET_LABELS: Record<string, string> = {
  general:     'Question générale',
  technique:   'Problème technique',
  suggestion:  "Suggestion d'amélioration",
  signalement: 'Signalement de contenu',
  rgpd:        'Demande RGPD (accès / suppression)',
  autre:       'Autre',
};

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const cors   = makeCorsHeaders(origin);

  if (req.method === 'OPTIONS') return handleOptions(origin);
  if (req.method !== 'POST')    return errorResponse('Méthode non autorisée', 405, origin);

  try {
    const body = await req.json();
    const { nom, email, objet, message, website } = body;

    // Anti-spam honeypot
    if (website) return jsonResponse({ success: true }, origin);

    // Validation serveur
    if (!nom?.trim() || nom.trim().length < 2)
      return errorResponse('Prénom/Nom invalide', 400, origin);
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return errorResponse('Email invalide', 400, origin);
    if (!objet?.trim())
      return errorResponse('Objet requis', 400, origin);
    if (!message?.trim() || message.trim().length < 10)
      return errorResponse('Message trop court', 400, origin);
    if (message.trim().length > 1000)
      return errorResponse('Message trop long', 400, origin);

    // Enregistrement en base
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({ nom: nom.trim(), email: email.trim().toLowerCase(), objet, message: message.trim() });

    if (dbError) {
      console.error('DB insert error:', dbError);
      return errorResponse("Erreur lors de l'enregistrement", 500, origin);
    }

    // ── Envoi email via Brevo ─────────────────────────────────────────────────
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    const toEmail     = Deno.env.get('BREVO_TO_EMAIL') ?? 'apprenix.contact@gmail.com';

    if (brevoApiKey) {
      const objetLabel = OBJET_LABELS[objet] ?? objet;
      const date       = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

      const htmlBody = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e">
          <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px 32px;border-radius:12px 12px 0 0">
            <h1 style="color:#fff;margin:0;font-size:20px">📬 Nouveau message Apprenix</h1>
          </div>
          <div style="background:#f8f9ff;padding:24px 32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:130px">Expéditeur</td><td style="padding:8px 0;font-weight:600">${nom.trim()}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Email</td><td style="padding:8px 0"><a href="mailto:${email.trim()}" style="color:#4f46e5">${email.trim()}</a></td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Objet</td><td style="padding:8px 0"><span style="background:#ede9fe;color:#6d28d9;padding:2px 8px;border-radius:20px;font-size:13px">${objetLabel}</span></td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Date</td><td style="padding:8px 0;font-size:13px">${date}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">
            <p style="color:#64748b;font-size:13px;margin:0 0 8px">Message :</p>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;white-space:pre-wrap;line-height:1.6">${message.trim().replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px">Apprenix — Plateforme éducative 100 % gratuite · Envoyé via Brevo</p>
        </div>`;

      try {
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender:      { name: 'Apprenix', email: toEmail },
            to:          [{ email: toEmail, name: 'Apprenix Contact' }],
            replyTo:     { email: email.trim(), name: nom.trim() },
            subject:     `[Apprenix Contact] ${objetLabel} — ${nom.trim()}`,
            htmlContent: htmlBody,
            textContent: `Expéditeur: ${nom.trim()}\nEmail: ${email.trim()}\nObjet: ${objetLabel}\nDate: ${date}\n\n${message.trim()}`,
          }),
        });

        if (brevoRes.ok) {
          const data = await brevoRes.json();
          console.log('Brevo email envoyé, messageId:', data.messageId);
        } else {
          console.error('Brevo erreur:', brevoRes.status, await brevoRes.text());
        }
      } catch (mailErr) {
        console.error('Brevo exception:', mailErr);
      }
    } else {
      console.warn('BREVO_API_KEY non configurée — message sauvegardé en base uniquement');
    }

    return jsonResponse({ success: true }, origin);
  } catch (err) {
    console.error('Unexpected error:', err);
    return errorResponse('Erreur inattendue', 500, origin);
  }
});
