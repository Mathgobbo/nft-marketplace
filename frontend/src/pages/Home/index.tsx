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
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const mintNft = async () => {
    const contract = new ethers.Contract("0xe7f1725e7734ce288f8367e1bb143e90bb3f0512", basicNft2.abi, signer);
    const mintTx = await contract.mintNft();
    await mintTx.wait();
  };

  const listNft = async () => {
    const contract = new ethers.Contract("0xe7f1725e7734ce288f8367e1bb143e90bb3f0512", basicNft2.abi, signer);
    const tx = await contract.approve(nftMarketplaceContract?.address, 1);
    await tx.wait(1);
    console.log(tx);

    const listPrice = ethers.utils.parseEther("0.1");
    const listTx = await nftMarketplaceContract?.listItem("0xe7f1725e7734ce288f8367e1bb143e90bb3f0512", 1, listPrice);
    await listTx.wait();

    console.log(listTx);
    getListedItems();
  };

  useEffect(() => {
    getListedItems();
  }, [nftMarketplaceContract]);

  return (
    <div className="px-8 py-6">
      <h1 className="text-2xl font-bold mb-4">Listed NFT's for Sale</h1>
      <button onClick={listNft}>List your NFT</button>
      <button onClick={mintNft}>Mint example NFT</button>
      {loading && <p>Loading...</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {!!nfts && !!nfts.length && nfts.map((nft: any) => <NFTCard key={nft?.tokenId} {...nft} />)}
      </div>
    </div>
  );
};

interface NFTCardProps {
  contractAddress: string;
  price: BigNumber;
  seller: string;
  tokenId: BigNumber;
}
const NFTCard = ({ contractAddress, price, seller, tokenId }: NFTCardProps) => {
  const { nftMarketplaceContract, account } = useWeb3();
  const cancelListing = async () => {
    const tx = await nftMarketplaceContract?.cancelListing(contractAddress, tokenId);
    await tx.wait();
    console.log(tx);
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

      {seller.toLowerCase() === account.toLowerCase() && (
        <button onClick={cancelListing} className="border rounded-md p-2">
          Cancel listing
        </button>
      )}
    </div>
  );
};
