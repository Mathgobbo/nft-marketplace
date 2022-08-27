import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { Contract, ethers, Signer } from "ethers";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { MUMBAI_NETWORK_CHAIN_ID, NFT_MARKETPLACE_ADDRESS } from "../configs/constants";
import NftMarketplaceABI from "../assets/NftMarketplace.json";
import { NoMetaMaskError } from "../errors/NoMetaMaskError";
import { DifferentNetworkError } from "../errors/DifferentNetworkError";
interface IProps {
  children: ReactNode;
}

interface Web3ContextProps {
  provider: JsonRpcProvider | Web3Provider | undefined;
  signer: Signer | undefined;
  nftMarketplaceContract: Contract | undefined;
  requestWalletConnection: () => Promise<void>;
  account: any;
  error: Error | null;
}

const Web3Context = createContext<Web3ContextProps>({} as Web3ContextProps);

export const Web3ContextProvider = ({ children }: IProps) => {
  const [provider, setProvider] = useState<JsonRpcProvider | Web3Provider>();
  const [signer, setSigner] = useState<Signer>();
  const [nftMarketplaceContract, setNftMarketplaceContract] = useState<Contract>();
  const [account, setAccount] = useState();
  const [error, setError] = useState<Error | null>(null);

  const verifyProviderAndAccount = async () => {
    const { ethereum } = window as any;
    if (!ethereum) {
      setProvider(new ethers.providers.JsonRpcProvider());
      return setError(new NoMetaMaskError());
    }
    setProvider(new ethers.providers.Web3Provider(ethereum));
    listenAccountChanges();
    const allAccounts = await ethereum.request({ method: "eth_accounts" });
    if (allAccounts.length !== 0) {
      const account = allAccounts[0];
      setAccount(account);
    }
  };

  const verifyNetwork = async () => {
    const network = await provider?.getNetwork();
    if (network?.chainId != MUMBAI_NETWORK_CHAIN_ID) {
      setError(new DifferentNetworkError());
      provider?.on("network", (newNetwork, oldNetwork) => {
        if (oldNetwork) window.location.reload();
      });
    }
  };

  const requestWalletConnection = async () => {
    const { ethereum } = window as any;
    if (!ethereum && error != null) return setError(new NoMetaMaskError());
    await ethereum.request({ method: "eth_requestAccounts" });
  };

  const listenAccountChanges = async () => {
    const { ethereum } = window as any;
    ethereum.on("accountsChanged", (accounts: any) => {
      if (accounts.length !== 0) setAccount(accounts[0]);
      else setAccount(undefined);
    });
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
      verifyNetwork();
    }
  }, [provider]);

  return (
    <Web3Context.Provider value={{ provider, signer, nftMarketplaceContract, requestWalletConnection, account, error }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
