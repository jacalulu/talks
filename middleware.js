// Temporary password gate for the whole site.
//
// The password is read from the TALKS_PASSWORD environment variable on
// Vercel - it is not in this repo. To take the gate down, remove that
// variable and redeploy, or delete this file.

import { next } from '@vercel/functions';

const COOKIE = 'talks_access';
const COOKIE_DAYS = 30;

export const config = { runtime: 'nodejs' };

export default async function middleware(request) {
  const password = process.env.TALKS_PASSWORD;
  if (!password) return next();

  const expected = await token(password);
  if (readCookie(request, COOKIE) === expected) return next();

  const url = new URL(request.url);

  if (request.method === 'POST') {
    const form = await request.formData().catch(() => null);
    const attempt = form ? String(form.get('password') ?? '') : '';
    if (await equal(attempt, password)) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: url.pathname + url.search,
          'Set-Cookie':
            `${COOKIE}=${expected}; Path=/; Max-Age=${COOKIE_DAYS * 86400}; ` +
            'HttpOnly; Secure; SameSite=Lax',
          'Cache-Control': 'no-store',
        },
      });
    }
    return page(true);
  }

  return page(false);
}

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

async function token(password) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('talks-access-v1'));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Compare via HMAC digests so the comparison does not leak length or prefix.
async function equal(a, b) {
  const [x, y] = await Promise.all([token(a), token(b)]);
  return x === y;
}

function page(wrong) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Talks &middot; Jaclyn Konzelmann</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%23FF4D6D'/></svg>">
<style>
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&family=Space+Mono:wght@400&display=swap');
:root{--cream:#F6F2EC;--ink:#1F2A44;--ink-soft:#6B6560;--pink:#FF4D6D;
  --grad:linear-gradient(90deg,#FF7235 0%,#FF5E7E 48%,#FF4D6D 100%);
  --face:"Google Sans Medium","Google Sans Text","Google Sans",Figtree,-apple-system,"Helvetica Neue",Arial,sans-serif;
  --mono:"Space Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;background:var(--cream);color:var(--ink);font-family:var(--face);
  font-weight:500;-webkit-font-smoothing:antialiased;line-height:1.5;display:flex;flex-direction:column}
.rule{height:3px;background:var(--grad)}
main{flex:1;display:grid;place-items:center;padding:clamp(2rem,6vw,4rem) clamp(1.25rem,5vw,2.5rem)}
.card{width:100%;max-width:26rem}
.kick{font-family:var(--mono);font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;color:var(--pink);margin:0 0 1rem}
h1{font-size:clamp(1.8rem,5vw,2.4rem);line-height:1.1;letter-spacing:-.02em;margin:0 0 .6rem;font-weight:500}
p{margin:0 0 1.6rem;color:var(--ink-soft)}
label{display:block;font-family:var(--mono);font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft);margin-bottom:.5rem}
input{width:100%;font:inherit;font-size:1.05rem;padding:.8rem 1rem;border:1px solid rgba(31,42,68,.22);border-radius:12px;
  background:#fff;color:var(--ink);outline:none;transition:border-color .2s}
input:focus{border-color:var(--pink)}
button{margin-top:1rem;display:inline-flex;align-items:center;gap:.5rem;font-family:var(--mono);font-size:.76rem;letter-spacing:.16em;
  text-transform:uppercase;color:#fff;background:var(--grad);border:0;border-radius:100px;padding:.8rem 1.4rem;cursor:pointer}
.err{font-family:var(--mono);font-size:.76rem;letter-spacing:.06em;color:var(--pink);margin:.75rem 0 0}
</style>
</head>
<body>
<div class="rule"></div>
<main>
  <form class="card" method="post" autocomplete="off">
    <p class="kick">Talks</p>
    <h1>Not public just yet.</h1>
    <p>This deck is waiting for its talk. If you have the password, come on in.</p>
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autofocus required>
    ${wrong ? '<p class="err">That is not it - try again.</p>' : ''}
    <button type="submit">Open <span>&#8594;</span></button>
  </form>
</main>
</body>
</html>`;
  return new Response(html, {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
