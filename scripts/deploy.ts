import { ethers } from "hardhat";

async function main() {
  const [deployer, owner] = await ethers.getSigners();
  const marketplaceFactory = await ethers.getContractFactory("NftMarketplace");
  const nftMarketplace = await marketplaceFactory.deploy();
  await nftMarketplace.deployed();

  // Test Contracts
  const basicNftFactory = await ethers.getContractFactory("BasicNft");
  const basicNft = await basicNftFactory.deploy();
  await basicNft.deployed();

  const basicNftFactory2 = await ethers.getContractFactory("BasicNft2");
  const basicNft2 = await basicNftFactory2.deploy();
  await basicNft.deployed();

  const mintTx = await basicNft.connect(owner).mintNft();
  const mintTxReceipt = await mintTx.wait(1);

  // const tx = await basicNft.connect(owner).approve(nftMarketplace.address, 0);
  // await tx.wait(1);

  // const listPrice = ethers.utils.parseEther("0.1");
  // const tx2 = await nftMarketplace.connect(owner).listItem(basicNft.address, 0, listPrice);
  // await tx2.wait();

  // const listings = await nftMarketplace.getAllItemsListed();
  // console.log(listings);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
