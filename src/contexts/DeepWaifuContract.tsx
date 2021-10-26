import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

import deepWaifuAbi from '../abi/DeepWaifu.json';
import { DeepWaifu } from '../abi/typechain';
import { NFT_CONTRACT_ADDRESS } from '../env';
import { WalletContext } from './Wallet';
import { MINUTE_MILLIS } from '../constants';

interface IPaymentResult {
  tx: string;
  payer: string;
  id: number;
}

export interface IDeepWaifuContractContext {
  maxItems: number;
  itemsLeft: number;
  priceWei: ethers.BigNumber;
  onPayForMint: () => Promise<IPaymentResult>;
}

interface IProps {
  children: React.ReactNode;
}

// const deepWaifuInterface = new ethers.utils.Interface(deepWaifuAbi.abi);

export const DeepWaifuContractContext = createContext<IDeepWaifuContractContext>({
  maxItems: -1,
  itemsLeft: -1,
  priceWei: ethers.BigNumber.from(0),
  onPayForMint: () => Promise.resolve({} as any),
});

export const DeepWaifuContractProvider: React.FC<IProps> = ({ children }: IProps) => {
  const { provider, signer } = useContext(WalletContext);
  const [contract, setContract] = useState<DeepWaifu>();
  const [maxItems, setMaxItems] = useState(-1);
  const [itemsLeft, setItemsLeft] = useState(-1);
  const [priceWei, setPriceWei] = useState(ethers.BigNumber.from(0));

  const handlePayForMint = useCallback(async (): Promise<IPaymentResult> => {
    const res = await contract!.payForMint({
      value: priceWei,
    });
    await res.wait(3);

    const txReceipt = await provider.getTransactionReceipt(res.hash);

    const { args } = contract!.interface.parseLog(txReceipt.logs[0]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_from, _amount, id] = args;

    return { tx: res.hash, payer: res.from, id };
  }, [contract, priceWei, provider]);

  useEffect(() => {
    let deepWaifuContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, deepWaifuAbi.abi, provider) as DeepWaifu;
    if (signer) {
      deepWaifuContract = deepWaifuContract.connect(signer);
    }
    setContract(deepWaifuContract);
  }, [provider, signer]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (contract) {
      fetchMaxItems();
      intervalId = setInterval(fetchMaxItems, 5 * MINUTE_MILLIS);
    }

    async function fetchMaxItems() {
      const res = await contract!.maxItems();
      setMaxItems(res);
    }

    return () => clearInterval(intervalId);
  }, [contract]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (contract) {
      fetchItemsLeft();
      intervalId = setInterval(fetchItemsLeft, 1 * MINUTE_MILLIS);
    }

    async function fetchItemsLeft() {
      const res = await contract!.currentId();
      setItemsLeft(maxItems - res.toNumber());
    }

    return () => clearInterval(intervalId);
  }, [contract, maxItems]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (contract) {
      fetchPriceWei();
      intervalId = setInterval(fetchPriceWei, 5 * MINUTE_MILLIS);
    }

    async function fetchPriceWei() {
      const res = await contract!.mintPrice();
      setPriceWei(res);
    }

    return () => clearInterval(intervalId);
  }, [contract]);

  return (
    <DeepWaifuContractContext.Provider
      value={{
        maxItems,
        itemsLeft,
        priceWei,
        onPayForMint: handlePayForMint,
      }}
    >
      {children}
    </DeepWaifuContractContext.Provider>
  );
};
