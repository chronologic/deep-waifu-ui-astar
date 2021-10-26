import React, { createContext, useCallback, useState } from 'react';
import { ethers } from 'ethers';

import { CHAIN_ID, NETWORK_URL } from '../env';

const defaultProvider = new ethers.providers.JsonRpcProvider(NETWORK_URL);

export interface IWalletContext {
  provider: ethers.providers.BaseProvider;
  signer?: ethers.Signer;
  address?: string;
  connected: boolean;
  connect: () => void;
}

interface IProps {
  children: React.ReactNode;
}

const defaultContext: IWalletContext = {
  provider: defaultProvider,
  signer: undefined,
  address: undefined,
  connected: false,
  connect: () => {},
};

export const WalletContext = createContext<IWalletContext>(defaultContext);

export const WalletProvider: React.FC<IProps> = ({ children }: IProps) => {
  const [signer, setSigner] = useState<ethers.Signer>();
  const [provider, setProvider] = useState<ethers.providers.BaseProvider>(defaultProvider);
  const [address, setAddress] = useState<string>();
  const [connected, setConnected] = useState(false);

  const connect = useCallback(async () => {
    const { ethereum } = window as any;
    await ethereum.request({ method: 'eth_requestAccounts' });
    const chainId = ethereum.request({ method: 'eth_chainId' });

    // eslint-disable-next-line eqeqeq
    if (chainId != CHAIN_ID) {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.BigNumber.from(CHAIN_ID).toHexString() }], // chainId must be in hexadecimal numbers
      });
    }
    const metamaskProvider = new ethers.providers.Web3Provider((window as any).ethereum, CHAIN_ID);
    const signer = metamaskProvider.getSigner();
    const address = await signer.getAddress();

    setSigner(signer);
    setAddress(address);
    setProvider(metamaskProvider);
    setConnected(true);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        signer,
        provider,
        address,
        connected,
        connect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
