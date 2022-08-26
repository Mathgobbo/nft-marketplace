import { useState } from "react";
import { useWeb3 } from "../../context/Web3ContextProvider";

export const Home = () => {
  const { nftMarketplaceContract } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState([]);

  const getListedItems = async () => {
    try {
      setLoading(true);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Home</h1>
      {loading && <p>Loading...</p>}
      {!!nftMarketplaceContract && <div>{nftMarketplaceContract.address}</div>}
    </div>
  );
};
