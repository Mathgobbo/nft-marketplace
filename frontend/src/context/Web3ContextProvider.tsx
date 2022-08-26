import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { Contract, ethers, Signer } from "ethers";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { NFT_MARKETPLACE_ADDRESS } from "../configs/constants";
import NftMarketplaceABI from "../assets/NftMarketplace.json";
interface IProps {
  children: ReactNode;
}

interface Web3ContextProps {
  provider: JsonRpcProvider | Web3Provider | undefined;
  signer: Signer | undefined;
  nftMarketplaceContract: Contract | undefined;
}

const Web3Context = createContext<Web3ContextProps>({} as Web3ContextProps);

export const Web3ContextProvider = ({ children }: IProps) => {
  const [provider, setProvider] = useState<JsonRpcProvider | Web3Provider>();
  const [signer, setSigner] = useState<Signer>();
  const [nftMarketplaceContract, setNftMarketplaceContract] = useState<Contract>();

  useEffect(() => {
    if ((window as any).ethereum) setProvider(new ethers.providers.Web3Provider((window as any).ethereum));
    else setProvider(new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545"));
  }, []);

  useEffect(() => {
    if (provider) {
      const signer = provider.getSigner();
      setSigner(signer);
      const contract = new ethers.Contract(NFT_MARKETPLACE_ADDRESS, NftMarketplaceABI.abi, provider);
      setNftMarketplaceContract(contract);
    }
  }, [provider]);

  return <Web3Context.Provider value={{ provider, signer, nftMarketplaceContract }}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => useContext(Web3Context);
