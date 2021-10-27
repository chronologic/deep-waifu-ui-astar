import React, { createContext, useCallback, useState } from 'react';
import { ethers } from 'ethers';

import { NETWORK } from '../constants';

const defaultProvider = new ethers.providers.JsonRpcProvider(NETWORK.chainParams.rpcUrls[0]);

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

  const resetWallet = useCallback(() => {
    setSigner(undefined);
    setAddress(undefined);
    setProvider(defaultProvider);
    setConnected(false);
  }, []);

  const connect = useCallback(async () => {
    const { ethereum } = window as any;
    try {
      ethereum.removeAllListeners();
    } catch (e) {
      console.error(e);
    }
    await ethereum.request({ method: 'eth_requestAccounts' });
    const chainId = ethereum.request({ method: 'eth_chainId' });

    // eslint-disable-next-line eqeqeq
    if (chainId != NETWORK.chainId) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK.chainParams.chainId }],
        });
      } catch (e) {
        // This error code indicates that the chain has not been added to MetaMask.
        if ((e as any).code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK.chainParams],
          });
        } else {
          throw e;
        }
      }
    }
    const metamaskProvider = new ethers.providers.Web3Provider(ethereum, 'any');
    const signer = metamaskProvider.getSigner();

    const address = await signer.getAddress();

    setSigner(signer);
    setAddress(address);
    setProvider(metamaskProvider);
    setConnected(true);

    ethereum.on('chainChanged', (chainId: string) => {
      // console.log('chainChanged', chainId);
      if (chainId !== NETWORK.chainParams.chainId) {
        resetWallet();
      }
    });
    ethereum.on('disconnect', resetWallet);
    ethereum.on('accountsChanged', (accounts: string[]) => {
      // console.log('accountsChanged', accounts);
      resetWallet();
    });
  }, [resetWallet]);

  console.log({ provider, signer, address });

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
