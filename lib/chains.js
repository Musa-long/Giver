export const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)'
];

const T = (symbol, address, decimals, usd) => ({ symbol, address, decimals, usd });

export const CHAINS = [
  {
    key: 'eth', id: 1, name: 'Ethereum', symbol: 'ETH', nativeUsd: 3100,
    rpc: ['https://eth.llamarpc.com', 'https://ethereum-rpc.publicnode.com'],
    explorer: 'https://etherscan.io',
    tokens: [
      T('USDT', '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 1),
      T('USDC', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 1),
      T('DAI', '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 1),
      T('WETH', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 3100),
      T('WBTC', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 96000),
      T('LINK', '0x514910771AF9Ca656af840dff83E8264EcF986CA', 18, 18),
      T('UNI', '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', 18, 9),
      T('SHIB', '0x95aD61b0a150d79219dCF64E1A6496F7C1B9bA0f', 18, 0.00002),
      T('PEPE', '0x6982508145454Ce325dDbE47a25d4ec3d2311933', 18, 0.00001),
      T('AAVE', '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', 18, 250),
      T('LDO', '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', 18, 1.5),
      T('ENS', '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72', 18, 25),
      T('CRV', '0xD533a949740bb3306d119CC777fa900bA034cd52', 18, 0.4),
      T('MKR', '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18, 1400)
    ]
  },
  {
    key: 'bsc', id: 56, name: 'BNB Chain', symbol: 'BNB', nativeUsd: 620,
    rpc: ['https://bsc-dataseed.binance.org', 'https://bsc-rpc.publicnode.com'],
    explorer: 'https://bscscan.com',
    tokens: [
      T('USDT', '0x55d398326f99059fF775485246999027B3197955', 18, 1),
      T('BUSD', '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 18, 1),
      T('USDC', '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 18, 1),
      T('WBNB', '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 620),
      T('BTCB', '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', 18, 96000),
      T('ETH', '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', 18, 3100),
      T('CAKE', '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', 18, 2.5),
      T('DOGE', '0xbA2aE424d960c26247Dd6c32edC70B295c744C43', 8, 0.3),
      T('XRP', '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE', 18, 2.2),
      T('ADA', '0x3EE2200Efb3400fAbB9AacF31297bC957a1bDcc', 18, 0.9),
      T('LINK', '0xF8A0BF9cF54Bb92F17374d9eB9A321C96494e2C9', 18, 18),
      T('SHIB', '0x2859e4544C4bB03966803b044A93563Bd2D0DD4D', 18, 0.00002)
    ]
  },
  {
    key: 'polygon', id: 137, name: 'Polygon', symbol: 'POL', nativeUsd: 0.45,
    rpc: ['https://polygon-rpc.com', 'https://polygon-bor-rpc.publicnode.com'],
    explorer: 'https://polygonscan.com',
    tokens: [
      T('USDT', '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 6, 1),
      T('USDC', '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', 6, 1),
      T('USDC.e', '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 6, 1),
      T('DAI', '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 18, 1),
      T('WETH', '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', 18, 3100),
      T('WBTC', '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', 8, 96000),
      T('WPOL', '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', 18, 0.45),
      T('LINK', '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', 18, 18),
      T('AAVE', '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', 18, 250)
    ]
  },
  {
    key: 'arbitrum', id: 42161, name: 'Arbitrum', symbol: 'ETH', nativeUsd: 3100,
    rpc: ['https://arb1.arbitrum.io/rpc', 'https://arbitrum-one-rpc.publicnode.com'],
    explorer: 'https://arbiscan.io',
    tokens: [
      T('USDT', '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 6, 1),
      T('USDC', '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 6, 1),
      T('USDC.e', '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', 6, 1),
      T('DAI', '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 18, 1),
      T('WETH', '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 18, 3100),
      T('WBTC', '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', 8, 96000),
      T('ARB', '0x912CE59144191C1204E64559FE8253a0e49E6548', 18, 0.6),
      T('LINK', '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', 18, 18),
      T('GMX', '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', 18, 20)
    ]
  },
  {
    key: 'optimism', id: 10, name: 'Optimism', symbol: 'ETH', nativeUsd: 3100,
    rpc: ['https://mainnet.optimism.io', 'https://optimism-rpc.publicnode.com'],
    explorer: 'https://optimistic.etherscan.io',
    tokens: [
      T('USDT', '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', 6, 1),
      T('USDC', '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', 6, 1),
      T('USDC.e', '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', 6, 1),
      T('DAI', '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 18, 1),
      T('WETH', '0x4200000000000000000000000000000000000006', 18, 3100),
      T('WBTC', '0x68f180fcCe6836688e9084f035309E29Bf0A2095', 8, 96000),
      T('OP', '0x4200000000000000000000000000000000000042', 18, 1.2),
      T('LINK', '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6', 18, 18)
    ]
  },
  {
    key: 'base', id: 8453, name: 'Base', symbol: 'ETH', nativeUsd: 3100,
    rpc: ['https://mainnet.base.org', 'https://base-rpc.publicnode.com'],
    explorer: 'https://basescan.org',
    tokens: [
      T('USDC', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 6, 1),
      T('USDbC', '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', 6, 1),
      T('DAI', '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', 18, 1),
      T('WETH', '0x4200000000000000000000000000000000000006', 18, 3100),
      T('cbBTC', '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', 8, 96000),
      T('LINK', '0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196', 18, 18)
    ]
  },
  {
    key: 'avalanche', id: 43114, name: 'Avalanche', symbol: 'AVAX', nativeUsd: 32,
    rpc: ['https://api.avax.network/ext/bc/C/rpc'],
    explorer: 'https://snowtrace.io',
    tokens: [
      T('USDT', '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', 6, 1),
      T('USDC', '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', 6, 1),
      T('WETH.e', '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', 18, 3100),
      T('WBTC.e', '0x50b7545627a5162F82A992c33b87aDc75187B218', 8, 96000),
      T('LINK.e', '0x5947BB275c521040051D82396192181b413227A3', 18, 18)
    ]
  },
  {
    key: 'linea', id: 59144, name: 'Linea', symbol: 'ETH', nativeUsd: 3100,
    rpc: ['https://rpc.linea.build'], explorer: 'https://lineascan.build',
    tokens: [
      T('USDC', '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', 6, 1),
      T('WETH', '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', 18, 3100)
    ]
  },
  {
    key: 'scroll', id: 534352, name: 'Scroll', symbol: 'ETH', nativeUsd: 3100,
    rpc: ['https://rpc.scroll.io'], explorer: 'https://scrollscan.com',
    tokens: [
      T('USDC', '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4', 6, 1),
      T('WETH', '0x5300000000000000000000000000000000000004', 18, 3100)
    ]
  },
  {
    key: 'zksync', id: 324, name: 'zkSync Era', symbol: 'ETH', nativeUsd: 3100,
    rpc: ['https://mainnet.era.zksync.io'], explorer: 'https://explorer.zksync.io',
    tokens: [
      T('USDC', '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4', 6, 1),
      T('WETH', '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91', 18, 3100)
    ]
  },
  {
    key: 'mantle', id: 5000, name: 'Mantle', symbol: 'MNT', nativeUsd: 0.9,
    rpc: ['https://rpc.mantle.xyz'], explorer: 'https://explorer.mantle.xyz',
    tokens: [
      T('USDT', '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE', 6, 1),
      T('USDC', '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9', 6, 1),
      T('WETH', '0xdEAddEaDdeadDEadDEADDEAddEADDEAdDead1111', 18, 3100)
    ]
  },
  {
    key: 'blast', id: 81457, name: 'Blast', symbol: 'ETH', nativeUsd: 3100,
    rpc: ['https://rpc.blast.io'], explorer: 'https://blastscan.io',
    tokens: [
      T('USDB', '0x4300000000000000000000000000000000000003', 18, 1),
      T('WETH', '0x4300000000000000000000000000000000000004', 18, 3100)
    ]
  },
  {
    key: 'gnosis', id: 100, name: 'Gnosis', symbol: 'XDAI', nativeUsd: 1,
    rpc: ['https://rpc.gnosischain.com'], explorer: 'https://gnosisscan.io',
    tokens: [
      T('USDC', '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', 6, 1),
      T('WXDAI', '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', 18, 1)
    ]
  },
  {
    key: 'celo', id: 42220, name: 'Celo', symbol: 'CELO', nativeUsd: 0.6,
    rpc: ['https://forno.celo.org'], explorer: 'https://celoscan.io',
    tokens: [
      T('cUSD', '0x765DE816845861e75A25fCA122bb6898B8B1282a', 18, 1),
      T('USDC', '0xcebA9300f2b948710d2653dD7B07f33A8B32118C', 6, 1)
    ]
  },
  {
    key: 'cronos', id: 25, name: 'Cronos', symbol: 'CRO', nativeUsd: 0.15,
    rpc: ['https://evm.cronos.org'], explorer: 'https://cronoscan.com',
    tokens: [
      T('USDT', '0x66e428c3f67a68878562e79A0234c1F83c208770', 6, 1),
      T('USDC', '0xc21223249CA28397B4B6541dfFaECC539BfF0c59', 6, 1),
      T('WETH', '0xe44Fd7fCbB2a87Bb1BA57B213590b778DDC6Ea5D', 18, 3100)
    ]
  },
  {
    key: 'polygon-zkevm', id: 1101, name: 'Polygon zkEVM', symbol: 'ETH', nativeUsd: 3100,
    rpc: ['https://zkevm-rpc.com'], explorer: 'https://zkevm.polygonscan.com',
    tokens: [
      T('USDC', '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035', 6, 1),
      T('WETH', '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9', 18, 3100)
    ]
  }
];

export const TRON = {
  key: 'tron',
  tokens: [
    { symbol: 'USDT', address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', decimals: 6, usd: 1 },
    { symbol: 'USDC', address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8', decimals: 6, usd: 1 }
  ]
};

export const EVM_RE = /^0x[a-fA-F0-9]{40}$/;
export const TRON_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

export function publicChains() {
  return CHAINS.map(c => ({
    key: c.key, id: c.id, name: c.name, symbol: c.symbol,
    rpc: c.rpc, explorer: c.explorer, nativeUsd: c.nativeUsd, tokens: c.tokens
  }));
    }
