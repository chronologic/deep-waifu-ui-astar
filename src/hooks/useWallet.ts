import { useContext } from 'react';

import { WalletContext } from '../contexts';

export function useWallet() {
  const ctx = useContext(WalletContext);

  return ctx;
}
