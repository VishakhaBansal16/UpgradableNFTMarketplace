const { ethers, upgrades } = require("hardhat");

const PROXY = "0x6eEfB26589dB41f3504449b3F7c0d1bC522dDb1b";

async function main() {
  const NFTMarketplaceV2 = await ethers.getContractFactory("MarketplaceV2");
  await upgrades.upgradeProxy(PROXY, NFTMarketplaceV2);
  console.log("Marketplace upgraded successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
