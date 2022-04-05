 
import { Token } from "@uniswap/sdk-core"; 
export const APP_ID: number = 1602;
export const APP_REST_KEY: string = "f0rhgO7LRqLgkPPvcxT6FCL53hSGYjnlBWuWkSFfrZHVYoLN8UmKCuiQQPkDbltn";
export const REACT_APP_PARSE_APPLICATION_ID: string = "7fQoav9Cet578x3JRzGyc3846jzs2C2Sj3GieCGR"
export const REACT_APP_PARSE_JAVASCRIPT_KEY: string = "kVOoz1N9FYSenWzK1wpY2CtJZuD0BJmxaavp32Ue"
export const REACT_APP_PARSE_LIVE_QUERY_URL: string = "https://parseapi.back4app.com" 
  
export const REACT_APP_SUPPORTED_CHAINID = 43114;

 

export enum NetworkId {
  MAINNET = 1,
  // TESTNET_RINKEBY = 4, 

  POLYGON = 137,
  //POLYGON_TESTNET = 80001,

  FANTOM = 250,
 // FANTOM_TESTNET = 4002,

  //AVALANCHE_FUJI_TESTNET = 43113,
  AVALANCHE_MAINNET = 43114,

  Localhost = 1337,
}


interface IAddresses {
  [key: number]: { [key: string]: string };
}

/**
 * Network details required to add a network to a user's wallet, as defined in EIP-3085 (https://eips.ethereum.org/EIPS/eip-3085)
 */

interface INativeCurrency {
  name: string;
  symbol: string;
  decimals?: number;
}

interface INetwork {
  chainName: string;
  chainId: number;
  nativeCurrency: INativeCurrency;
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export declare enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  MATIC = 137,
  MUMBAI = 80001,
  BSCTESTNET = 97,
  BSCMAINNET = 56,
  AVAXTESTNET = 43113,
  AVAXMAINNET = 43114,
  FANTOM = 250,
  CRONOSTESTNET = 338,
  CRONOS = 25,
  ARBITRUM = 42161,
  ARBITRUM_TESTNET = 421611,
  BTTC = 199,
  VELAS = 106
}
/*
export const ADD_NETWORK_PARAMS: {
  [chainId in ChainId]?: {
    chainId: string
    chainName: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }
} = {
  [ChainId.MAINNET]: {
    chainId: '0x1',
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3'],
    blockExplorerUrls: ['https://etherscan.com'],
  },
  [ChainId.MATIC]: {
    chainId: '0x89',
    chainName: 'Polygon',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon.dmm.exchange/v1/mainnet/geth?appId=prod-dmm'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  [ChainId.BSCMAINNET]: {
    chainId: '0x38',
    chainName: 'BSC',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc.dmm.exchange/v1/mainnet/geth?appId=prod-dmm-interface'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
  [ChainId.AVAXMAINNET]: {
    chainId: '0xA86A',
    chainName: 'Avalanche',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://avalanche.dmm.exchange/v1/mainnet/geth?appId=prod-dmm'],
    blockExplorerUrls: ['https://snowtrace.io'],
  },
  [ChainId.FANTOM]: {
    chainId: '0xFA',
    chainName: 'FANTOM',
    nativeCurrency: {
      name: 'FTM',
      symbol: 'FTM',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.ftm.tools'],
    blockExplorerUrls: ['https://ftmscan.com'],
  },
  [ChainId.CRONOS]: {
    chainId: '0x19',
    chainName: 'Cronos',
    nativeCurrency: {
      name: 'CRO',
      symbol: 'CRO',
      decimals: 18,
    },
    rpcUrls: ['https://evm-cronos.crypto.org'],
    blockExplorerUrls: ['https://cronos.crypto.org/explorer'],
  },

  [ChainId.ARBITRUM]: {
    chainId: '0xa4b1',
    chainName: 'Arbitrum',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  [ChainId.BTTC]: {
    chainId: '0xc7',
    chainName: 'BitTorrent',
    nativeCurrency: {
      name: 'BTT',
      symbol: 'BTT',
      decimals: 18,
    },
    rpcUrls: ['https://bttc.dev.kyberengineering.io'],
    blockExplorerUrls: ['https://bttcscan.com'],
  },
  [ChainId.VELAS]: {
    chainId: '0x6a',
    chainName: 'Velas',
    nativeCurrency: {
      name: 'VLX',
      symbol: 'VLX',
      decimals: 18,
    },
    rpcUrls: ['https://evmexplorer.velas.com/rpc'],
    blockExplorerUrls: ['https://evmexplorer.velas.com/'],
  },
}
*/

export const NETWORKS: { [key: number]: INetwork } = {
  1: {
    chainName: "Ethereum",
    chainId: 1,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [""],
    blockExplorerUrls: ["https://etherscan.com/#/"],
  }, 
  43114: {
    chainName: "Avalanche",
    chainId: 43114,
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
    },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc/"],
    blockExplorerUrls: ["https://snowtrace.io/#/"],
  },
  137: {
    chainName: "Polygon",
    chainId: 137,
    nativeCurrency: {
      name: "Polygon",
      symbol: "MATIC",
    },
    rpcUrls: ["https://polygon-mainnet.infura.io/v3/1030b8cbec174e90a95d512d970c2a0e"],
    blockExplorerUrls: ["https://polygonscan.com/#/"],
  },
  56: {
    chainId: 56,
    chainName: 'BSC',
    nativeCurrency: {
      name: 'BSC Mainnet',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
  
  250: {
    chainId: 250,
    chainName: 'Fantom',
    nativeCurrency: {
      name: 'Fantom Mainnet',
      symbol: 'FTM',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.ftm.tools/'],
    blockExplorerUrls: ['https://ftmscan.com'],
  },

};
 
 

export const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
export const WMATIC = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
export const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
export const WAVAX = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
export const WFTM = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
export const WCRO = '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23'  


export const TOKEN = new Token(
  REACT_APP_SUPPORTED_CHAINID,
  '0x1a877b68bda77d78eea607443ccde667b31b0cdf',
  18,
  'PIGGY',
  'PIGGY'
);
export const WETH9 = new Token(
  REACT_APP_SUPPORTED_CHAINID,
  '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
  18,
  'WAVAX',
  'WAVAX'
);

export const PEG = new Token(
  REACT_APP_SUPPORTED_CHAINID,
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  18,
  'AVAX',
  'AVAX'
); 


export const SWAP_SRC=PEG.address;
export const SWAP_DEST=TOKEN.address; 
export const MINSLIPPAGE=25;
export const SWAPFEES=25;
export const FEEWALLET='0x9d8E02bF06C33403FaaFB357588AA30A1131E6A8';
