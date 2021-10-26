import React from 'react';

import { DeepWaifuContractProvider, WaifuProvider, WalletProvider } from './contexts';
import { CHAIN_ID, NETWORK_URL } from './env';

interface IProps {
  children: React.ReactNode;
}

console.log({ CHAIN_ID, NETWORK_URL });

export default function Providers({ children }: IProps) {
  return (
    <WalletProvider>
      <DeepWaifuContractProvider>
        <WaifuProvider>{children}</WaifuProvider>
      </DeepWaifuContractProvider>
    </WalletProvider>
  );
}
