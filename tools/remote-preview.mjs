import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer, request } from 'node:http';

const password = randomBytes(12).toString('base64url');
const upstreamPort = Number(process.env.ARENA_PREVIEW_PORT || 3101);
const expected = Buffer.from('Basic ' + Buffer.from('arena:' + password).toString('base64'));
const pages = new Set(['/', '/inscricao', '/inscrever']);
const assets = new Set(['/arena-event.jpg', '/arena-marks.png', '/arena-marks-symbol.png', '/favicon.ico']);

const server = createServer((incoming, outgoing) => {
  const authorization = Buffer.from(incoming.headers.authorization || '');
  outgoing.setHeader('Cache-Control', 'private, no-store');
  outgoing.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (authorization.length !== expected.length || !timingSafeEqual(authorization, expected)) {
    outgoing.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Arena Marks - Previa", charset="UTF-8"' });
    outgoing.end('Acesso restrito.');
    return;
  }

  const path = incoming.url?.split('?')[0] || '';
  const allowed = pages.has(path) || assets.has(path) || /^\/_next\/static\/(?:[\w.%-]+\/)*[\w.%-]+$/.test(path)
    && !path.includes('%') && !path.split('/').some(part => part === '.' || part === '..');
  if (!allowed || !['GET', 'HEAD'].includes(incoming.method)) {
    outgoing.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    outgoing.end('Esta rota não está disponível na prévia.');
    return;
  }

  const headers = {};
  for (const name of ['accept', 'rsc', 'next-router-state-tree', 'next-router-prefetch', 'next-router-segment-prefetch']) {
    if (incoming.headers[name]) headers[name] = incoming.headers[name];
  }
  const upstream = request({ hostname: '127.0.0.1', port: upstreamPort, method: incoming.method, path, headers }, response => {
    for (const name of ['content-type', 'content-length']) {
      if (response.headers[name]) outgoing.setHeader(name, response.headers[name]);
    }
    outgoing.writeHead(response.statusCode || 502);
    response.pipe(outgoing);
  });
  upstream.setTimeout(15_000, () => upstream.destroy());
  upstream.on('error', () => {
    if (!outgoing.headersSent) outgoing.writeHead(502);
    outgoing.end('Previa indisponivel.');
  });
  outgoing.on('close', () => upstream.destroy());
  upstream.end();
});

server.listen(3911, '127.0.0.1', () => console.log(password));
