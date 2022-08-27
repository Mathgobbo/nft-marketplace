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
  requestWalletConnection: () => Promise<void>;
  account: any;
}

const Web3Context = createContext<Web3ContextProps>({} as Web3ContextProps);

export const Web3ContextProvider = ({ children }: IProps) => {
  const [provider, setProvider] = useState<JsonRpcProvider | Web3Provider>();
  const [signer, setSigner] = useState<Signer>();
  const [nftMarketplaceContract, setNftMarketplaceContract] = useState<Contract>();
  const [account, setAccount] = useState();
  const [error, setError] = useState({ name: "", message: "" });

  const verifyProviderAndAccount = async () => {
    const { ethereum } = window as any;
    if (!ethereum) return setError({ name: "no-wallet", message: "Get a wallet" });
    setProvider(new ethers.providers.Web3Provider(ethereum));
    const allAccounts = await ethereum.request({ method: "eth_accounts" });
    if (allAccounts.length !== 0) {
      const account = allAccounts[0];
      setAccount(account);
    }
  };

  const requestWalletConnection = async () => {
    const { ethereum } = window as any;
    if (!ethereum) return setError({ name: "no-wallet", message: "Get a wallet" });
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
  };

  useEffect(() => {
    verifyProviderAndAccount();
  }, []);

  useEffect(() => {
    if (provider) {
      const signer = provider.getSigner();
      setSigner(signer);
      const contract = new ethers.Contract(NFT_MARKETPLACE_ADDRESS, NftMarketplaceABI.abi, signer);
      setNftMarketplaceContract(contract);
    }
  }, [provider]);

  return (
    <Web3Context.Provider value={{ provider, signer, nftMarketplaceContract, requestWalletConnection, account }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
