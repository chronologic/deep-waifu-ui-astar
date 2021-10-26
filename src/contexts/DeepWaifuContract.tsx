import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

import deepWaifuAbi from '../abi/DeepWaifu.json';
import { DeepWaifu } from '../abi/typechain';
import { NFT_CONTRACT_ADDRESS } from '../env';
import { WalletContext } from './Wallet';

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
  maxItems: 0,
  itemsLeft: 0,
  priceWei: ethers.BigNumber.from(0),
  onPayForMint: () => Promise.resolve({} as any),
});

export const DeepWaifuContractProvider: React.FC<IProps> = ({ children }: IProps) => {
  const { provider, signer } = useContext(WalletContext);
  const [contract, setContract] = useState<DeepWaifu>();
  const [maxItems, setMaxItems] = useState(0);
  const [itemsLeft, setItemsLeft] = useState(0);
  const [priceWei, setPriceWei] = useState(ethers.BigNumber.from(0));

  const handlePayForMint = useCallback(async (): Promise<IPaymentResult> => {
    const res = await contract!.payForMint({
      value: priceWei,
    });

    await provider.waitForTransaction(res.hash, 3);

    console.log(res);

    return { tx: res.hash, payer: res.from, id: 3 };
  }, [contract, priceWei, provider]);

  useEffect(() => {
    let deepWaifuContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, deepWaifuAbi.abi, provider) as DeepWaifu;
    if (signer) {
      deepWaifuContract = deepWaifuContract.connect(signer);
    }
    setContract(deepWaifuContract);
  }, [provider, signer]);

  useEffect(() => {
    if (contract) {
      fetchMaxItems();
    }

    async function fetchMaxItems() {
      const res = await contract!.maxItems();
      setMaxItems(res);
    }
  }, [contract]);

  useEffect(() => {
    if (contract) {
      fetchItemsLeft();
    }

    async function fetchItemsLeft() {
      const res = await contract!.currentId();
      setItemsLeft(maxItems - res.toNumber());
    }
  }, [contract, maxItems]);

  useEffect(() => {
    if (contract) {
      fetchPriceWei();
    }

    async function fetchPriceWei() {
      const res = await contract!.mintPrice();
      setPriceWei(res);
    }
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
