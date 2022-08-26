import { ethers } from "hardhat";

async function main() {
  const [deployer, owner] = await ethers.getSigners();
  const marketplaceFactory = await ethers.getContractFactory("NftMarketplace");
  const nftMarketplace = await marketplaceFactory.deploy();
  await nftMarketplace.deployed();

  const basicNftFactory = await ethers.getContractFactory("BasicNft");
  const basicNft = await basicNftFactory.deploy();
  await basicNft.deployed();

  const mintTx = await basicNft.connect(owner).mintNft();
  const mintTxReceipt = await mintTx.wait(1);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
