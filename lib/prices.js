import { CHAINS } from './chains.js';

const IDS = {
  eth: 'ethereum', bsc: 'binancecoin', polygon: 'matic-network', arbitrum: 'ethereum',
  optimism: 'ethereum', base: 'ethereum', avalanche: 'avalanche-2', linea: 'ethereum',
  scroll: 'ethereum', zksync: 'ethereum', mantle: 'mantle', blast: 'ethereum',
  gnosis: 'xdai', celo: 'celo', cronos: 'crypto-com-chain', 'polygon-zkevm': 'ethereum'
};

const SYMBOL_IDS = {
  USDT: 'tether', USDC: 'usd-coin', 'USDC.e': 'usd-coin', USDbC: 'usd-coin',
  DAI: 'dai', WETH: 'weth', 'WETH.e': 'weth', WBTC: 'wrapped-bitcoin',
  'WBTC.e': 'wrapped-bitcoin', cbBTC: 'coinbase-wrapped-btc', BTCB: 'bitcoin',
  ETH: 'ethereum', WBNB: 'binancecoin', BUSD: 'binance-usd', CAKE: 'pancakeswap-token',
  DOGE: 'dogecoin', XRP: 'ripple', ADA: 'cardano', LINK: 'chainlink', SHIB: 'shiba-inu',
  PEPE: 'pepe', AAVE: 'aave', LDO: 'lido-dao', ENS: 'ethereum-name-service',
  CRV: 'curve-dao-token', MKR: 'maker', WPOL: 'matic-network', UNI: 'uniswap',
  ARB: 'arbitrum', GMX: 'gmx', OP: 'optimism', USDB: 'usdb', WXDAI: 'xdai',
  cUSD: 'celo-dollar'
};

let timer = null;

export function startPriceRefresh() {
  refresh();
  if (!timer) timer = setInterval(refresh, 10 * 60 * 1000);
}

async function refresh() {
  const ids = new Set(Object.values(IDS));
  for (const c of CHAINS) for (const t of c.tokens) {
    const id = SYMBOL_IDS[t.symbol];
    if (id) ids.add(id);
  }
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${[...ids].join(',')}&vs_currencies=usd`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return;
    const data = await res.json();
    for (const c of CHAINS) {
      const nid = IDS[c.key];
      if (nid && data[nid]?.usd) c.nativeUsd = data[nid].usd;
      for (const t of c.tokens) {
        const id = SYMBOL_IDS[t.symbol];
        if (id && data[id]?.usd) t.usd = data[id].usd;
      }
    }
  } catch { /* keep static values */ }
}
