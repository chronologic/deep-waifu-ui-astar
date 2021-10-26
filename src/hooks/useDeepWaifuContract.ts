import { useContext } from 'react';

import { DeepWaifuContractContext } from '../contexts';

export function useDeepWaifuContract() {
  const ctx = useContext(DeepWaifuContractContext);

  return ctx;
}
