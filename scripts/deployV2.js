const { ethers, upgrades } = require("hardhat");

const PROXY = "0xd6906C327bAe1c73b38C2F307D42De625B98BbF7";

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
