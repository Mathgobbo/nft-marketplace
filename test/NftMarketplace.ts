import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ContractReceipt, Event } from "ethers";
import { ethers } from "hardhat";
import { describe } from "mocha";
import { BasicNft, BasicNft2, NftMarketplace } from "../typechain-types";

describe("DAPP NFT Marketplace Tests", () => {
  let nftMarketplace: NftMarketplace,
    basicNft: BasicNft,
    basicNft2: BasicNft2,
    deployer: SignerWithAddress,
    owner: SignerWithAddress,
    buyer1: SignerWithAddress,
    nft1TokenId: any;

  const mintNft = async () => {
    const mintTx = await basicNft.connect(owner).mintNft();
    const mintTxReceipt = await mintTx.wait(1);
    const events: any = (mintTxReceipt as ContractReceipt).events as Event[];
    nft1TokenId = events[0].args.tokenId;
  };

  before(async () => {
    [deployer, owner, buyer1] = await ethers.getSigners();
    const marketplaceFactory = await ethers.getContractFactory("NftMarketplace");
    nftMarketplace = await marketplaceFactory.deploy();
    await nftMarketplace.deployed();
    const basicNftFactory = await ethers.getContractFactory("BasicNft");
    basicNft = await basicNftFactory.deploy();
    await basicNft.deployed();
    const basicNftFactory2 = await ethers.getContractFactory("BasicNft2");
    basicNft2 = await basicNftFactory2.deploy();
    await basicNft2.deployed();
  });

  it("Contracts should be Live", async () => {
    expect(nftMarketplace.address).not.be.null &&
      expect(basicNft.address).not.be.null &&
      expect(basicNft2.address).not.be.null;
  });

  describe("BasicNFT1", () => {
    it(`Should mint 1 Basic NFT to OWNER`, async () => {
      await mintNft();
      const ownerOfToken = await basicNft.ownerOf(nft1TokenId);
      expect(ownerOfToken).to.be.equals(owner.address);
    });
  });

  describe("NFT Marketplace", () => {
    it("Owner Should Approve NFT to List", async () => {
      const tx = await basicNft.connect(owner).approve(nftMarketplace.address, nft1TokenId);
      await tx.wait(1);
      expect(await basicNft.getApproved(nft1TokenId)).to.be.equals(nftMarketplace.address);
    });

    it("Owner should List NFT", async () => {
      const listPrice = ethers.utils.parseEther("0.1");
      const tx = await nftMarketplace.connect(owner).listItem(basicNft.address, nft1TokenId, listPrice);
      await tx.wait();

      const listingTx = await nftMarketplace.getListing(1);
      expect(listingTx.seller).to.be.equals(owner.address) && expect(listingTx.price).to.be.equals(listPrice);
    });

    it("Buyer should buy NFT ", async () => {
      const tx = await nftMarketplace
        .connect(buyer1)
        .buyItem(1, basicNft.address, nft1TokenId, { value: ethers.utils.parseEther("0.1") });
      await tx.wait();
      const newOwner = await basicNft.ownerOf(nft1TokenId);
      const contractBalance = await ethers.provider.getBalance(nftMarketplace.address);
      expect(newOwner).to.be.equals(buyer1.address) && expect(contractBalance).to.be.greaterThan(0);
    });

    it("Owner should withdraw its Value", async () => {
      const ownerProceeds = await nftMarketplace.getProceeds(owner.address);
      const ownerBalance = await ethers.provider.getBalance(owner.address);
      const tx = await nftMarketplace.connect(owner).withdrawProceeds();
      await tx.wait();
      const newOwnerBalance = await ethers.provider.getBalance(owner.address);
      newOwnerBalance.sub(ethers.utils.parseEther("0.01"));
      ownerBalance.add(ownerProceeds);
      expect(newOwnerBalance).to.be.greaterThan(ownerBalance);
    });
  });
});
