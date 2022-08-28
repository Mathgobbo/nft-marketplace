import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { ALCHEMY_API_URL } from "../../configs/constants";
import { useWeb3 } from "../../context/Web3ContextProvider";

export const Profile = () => {
  const { account, requestWalletConnection } = useWeb3();
  return (
    <div className="px-8 py-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {!account ? (
        <div>
          <p>Looks Like your Wallet is not connected. Please connect to load your profile</p>
          <button
            onClick={requestWalletConnection}
            className="p-2 mt-2 border-2 text-slate-600 border-slate-600 hover:text-white hover:bg-slate-600 font-semibold transition rounded-md"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <ProfileDetails />
      )}
    </div>
  );
};

const ProfileDetails = () => {
  const { nftMarketplaceContract, account } = useWeb3();
  const [balance, setBalance] = useState<BigNumber>();

  const getProfileDetails = async () => {
    try {
      const proceeds = await nftMarketplaceContract?.getProceeds(account);
      setBalance(proceeds);
    } catch (error) {
      console.log(error);
    }
  };

  const getUserNfts = async () => {
    try {
      const nftsReponse = await fetch(`${ALCHEMY_API_URL}/getNFTs?owner=${account}`, { method: "GET" });
      console.log(nftsReponse);
      const nfts = await nftsReponse.json();
      console.log(nfts);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProfileDetails();
    getUserNfts();
  }, [account]);
  return (
    <div>
      <h2>Your Balance: {balance && <strong>{balance.toString()}</strong>}</h2>
      <hr className="my-3" />
      <h2>Your Listed NFT's:</h2>
    </div>
  );
};
