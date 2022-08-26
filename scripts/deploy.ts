import { ethers } from "hardhat";

async function main() {
  const marketplaceFactory = await ethers.getContractFactory("NftMarketplace");
  const nftMarketplace = await marketplaceFactory.deploy();
  await nftMarketplace.deployed();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
