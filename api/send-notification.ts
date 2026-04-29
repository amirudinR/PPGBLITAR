// @ts-nocheck
/* eslint-disable */
import * as crypto from 'crypto';

function base64url(data: string | Buffer): string {
  const buf = typeof data === 'string' ? Buffer.from(data) : data;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function getGoogleAccessToken(sa: Record<string, string>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${claim}`);
  const signature = base64url(sign.sign(sa.private_key));
  const jwt = `${header}.${claim}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const json = await res.json() as { access_token?: string; error?: string };
  if (!json.access_token) throw new Error(`OAuth2 failed: ${json.error}`);
  return json.access_token;
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const saJson = process.env.FIREBASE_SA_JSON;
  if (!saJson) {
    return res.status(500).json({ error: 'FIREBASE_SA_JSON env var not set' });
  }

  const { token, title, body, link } = req.body as {
    token?: string;
    title?: string;
    body?: string;
    link?: string;
  };

  if (!token || !title) {
    return res.status(400).json({ error: 'token and title are required' });
  }

  try {
    const sa = JSON.parse(saJson) as Record<string, string>;
    const accessToken = await getGoogleAccessToken(sa);

    const fcmRes = await fetch(
      `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body: body ?? '' },
            webpush: {
              notification: {
                icon: '/logo.png',
                badge: '/logo.png',
                requireInteraction: false,
              },
              fcm_options: { link: link ? `https://ppg-samarinda.vercel.app/?section=${link}` : '/' },
              data: link ? { link } : undefined,
            },
          },
        }),
      },
    );

    const fcmData = await fcmRes.json();
    if (!fcmRes.ok) {
      return res.status(fcmRes.status).json({ error: fcmData });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ success: true, name: fcmData.name });
  } catch (err: any) {
    console.error('send-notification error:', err);
    return res.status(500).json({ error: err.message });
  }
}
