require("dotenv").config();
const { ethers, upgrades } = require("hardhat");
const platformFee = 250;
async function main() {
  //deploying NFT.sol
  const MyContract = await ethers.getContractFactory("NFT");
  const myContract = await MyContract.deploy();
  await myContract.deployed();
  console.log("NFT contract deployed to the address: ", myContract.address);

  //deploying MyNFT.sol
  const Token = await ethers.getContractFactory("MyNFT");
  const token = await Token.deploy();
  await token.deployed();
  console.log("MyNFT contract deployed to the address: ", token.address);

  //deploying Marketplace.sol
  const Greeter = await ethers.getContractFactory("Marketplace");
  const greeter = await upgrades.deployProxy(
    Greeter,
    [
      myContract.address,
      token.address,
      process.env.PLATFORM_WALLET_ADDRESS,
      platformFee,
    ],
    {
      initializer: "initialize",
    }
  );
  await greeter.deployed();
  console.log(
    "Marketplace contract deployed to the address: ",
    greeter.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
