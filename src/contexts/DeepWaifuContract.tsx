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

  useEffect(() => {
    // accessList: null
    // blockHash: null
    // blockNumber: null
    // chainId: 4369
    // confirmations: 0
    // creates: null
    // data: "0x68c81ee8"
    // from: "0xA7293D776c5f5Aa450e9592E29E22683ffC39B67"
    // gasLimit: BigNumber {_hex: '0xf78f', _isBigNumber: true}
    // gasPrice: BigNumber {_hex: '0x3b9aca00', _isBigNumber: true}
    // hash: "0x1c783ec162fdf463473dc7444ea9a55353977d58d4019f7c55132ff78ef6c153"
    // nonce: 6
    // r: "0x7f51c1b683bbd2fc763ba51e37735f186f965e62c9943d015cf7c806c744aaa2"
    // s: "0x54b96f67e6dc13501db504eaafcf9d028117e70e7fcade67d5ed081ea0a392a1"
    // to: "0x114a77E482d6B1b8730894E0BF8586a1aB2EE7D6"
    // transactionIndex: null
    // type: 0
    // v: 8774
    // value: BigNumber {_hex: '0x01a055690d9db80000', _isBigNumber: true}
    // wait: confirmations => {…}

    async function lol() {
      const tx = await provider.getTransaction('0x1c783ec162fdf463473dc7444ea9a55353977d58d4019f7c55132ff78ef6c153');
      console.log(tx);
      const txRec = await provider.getTransactionReceipt(
        '0x1c783ec162fdf463473dc7444ea9a55353977d58d4019f7c55132ff78ef6c153'
      );
      console.log(txRec);
    }

    lol();
  }, []);

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
