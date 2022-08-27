import { ethers } from "hardhat";

async function main() {
  console.log("Started deploying into Mumbai...");
  const marketplaceFactory = await ethers.getContractFactory("NftMarketplace");
  const nftMarketplace = await marketplaceFactory.deploy();
  await nftMarketplace.deployed();
  console.log(`Deployed at ${nftMarketplace.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
