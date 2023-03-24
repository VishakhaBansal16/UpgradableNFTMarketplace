const { ethers, upgrades } = require("hardhat");

const PROXY = "0x7525ee280d545Aa7C70804c0E63af200Cbc2a8BD";

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
