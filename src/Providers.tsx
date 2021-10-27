import React from 'react';

import { DeepWaifuContractProvider, WaifuProvider, WalletProvider } from './contexts';

interface IProps {
  children: React.ReactNode;
}

export default function Providers({ children }: IProps) {
  return (
    <WalletProvider>
      <DeepWaifuContractProvider>
        <WaifuProvider>{children}</WaifuProvider>
      </DeepWaifuContractProvider>
    </WalletProvider>
  );
}
