import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { useWeb3 } from "../../context/Web3ContextProvider";
import basicNft2 from "../../assets/BasicNft2.json";
export const Home = () => {
  const { nftMarketplaceContract, signer } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState([]);

  const getListedItems = async () => {
    try {
      setLoading(true);
      const response = await nftMarketplaceContract?.getAllItemsListed();
      setNfts(response);
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getListedItems();
  }, [nftMarketplaceContract]);

  return (
    <div className="px-8 py-6">
      <h1 className="text-2xl font-bold mb-4">Listed NFT's for Sale</h1>
      {loading && <p>Loading...</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {!!nfts &&
          !!nfts.length &&
          nfts.map((nft: any) => <NFTCard key={nft?.tokenId} {...nft} refetchListedItems={getListedItems} />)}
      </div>
    </div>
  );
};

interface NFTCardProps {
  contractAddress: string;
  price: BigNumber;
  seller: string;
  tokenId: BigNumber;
  refetchListedItems: () => Promise<void>;
}
const NFTCard = ({ contractAddress, price, seller, tokenId, refetchListedItems }: NFTCardProps) => {
  const { nftMarketplaceContract, account } = useWeb3();

  const cancelListing = async () => {
    const tx = await nftMarketplaceContract?.cancelListing(contractAddress, tokenId);
    await tx.wait();
    console.log(tx);
    refetchListedItems();
  };

  const buyNft = async () => {
    const tx = await nftMarketplaceContract?.buyItem(contractAddress, tokenId, { value: price });
    await tx.wait();
    console.log(tx);
    refetchListedItems();
  };

  return (
    <div className="p-4 shadow-md border border-slate-300 bg-white rounded-md">
      <p className="break-all">
        <strong>Address: </strong>
        {contractAddress}
      </p>
      <p className="break-all">
        <strong>Seller:</strong> {seller}
      </p>
      <p>
        <strong>Price:</strong> {ethers.utils.formatEther(price)} Ether
      </p>

      {seller?.toLowerCase() === account?.toLowerCase() ? (
        <button onClick={cancelListing} className="border rounded-md p-2">
          Cancel listing
        </button>
      ) : (
        <button onClick={buyNft} className="border rounded-md p-2">
          Buy NFT
        </button>
      )}
    </div>
  );
};
