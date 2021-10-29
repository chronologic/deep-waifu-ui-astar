import { ethers } from 'ethers';

import { CHAIN_ID } from './env';

export const SECOND_MILLIS = 1000;
export const MINUTE_MILLIS = 60 * SECOND_MILLIS;

interface IChain {
  chainId: number;
  chainParams: {
    chainId: string;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  };
}

export const NETWORKS = {
  SHIDEN: {
    chainId: 336,
    chainParams: {
      chainId: decToUnpaddedHex(336),
      chainName: 'Shiden',
      nativeCurrency: {
        name: 'Shiden',
        symbol: 'SDN',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.shiden.astar.network:8545'],
      blockExplorerUrls: ['https://shiden.subscan.io/'],
    },
  },
  SHIBUYA: {
    chainId: 81,
    chainParams: {
      chainId: decToUnpaddedHex(81),
      chainName: 'Shibuya',
      nativeCurrency: {
        name: 'Shibuya',
        symbol: 'SBY',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.shibuya.astar.network:8545'],
      blockExplorerUrls: ['https://shibuya.subscan.io/'],
    },
  },
  LOCALNET: {
    chainId: 4369,
    chainParams: {
      chainId: decToUnpaddedHex(4369),
      chainName: 'Shiden Local',
      nativeCurrency: {
        name: 'Shiden Local',
        symbol: 'SDNL',
        decimals: 18,
      },
      rpcUrls: ['https://localhost:9933'],
      blockExplorerUrls: ['https://localhost:9934'],
    },
  },
};

// metamask expects unpadded hex string but ethers sometimes makes padded strings
function decToUnpaddedHex(dec: number): string {
  const paddedHex = ethers.BigNumber.from(dec).toHexString();

  return paddedHex.replace(/x0+/, 'x');
}

const networkKey = Object.keys(NETWORKS).find((key) => (NETWORKS as any)[key].chainId === CHAIN_ID) as string;

export const NETWORK = (NETWORKS as any)[networkKey] as IChain;
