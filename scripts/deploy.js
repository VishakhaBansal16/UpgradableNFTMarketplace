require("dotenv").config();
const { ethers, upgrades } = require("hardhat");
const platformFee = 250;
async function main() {
  /*
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
 */
  //deploying Marketplace.sol
  const Greeter = await ethers.getContractFactory("Marketplace");
  /*const greeter = await upgrades.deployProxy(
    Greeter,
    [
      "0x13e610834B02CF1b9e4F097c6D396eD2CC60D089",
      "0xB91Bb7E498CFf8a2D275C2c0196818a00708E3c9",
      process.env.PLATFORM_WALLET_ADDRESS,
      platformFee,
    ],
    {
      initializer: "initialize",
    }
  );*/
  const greeter = await upgrades.deployProxy(
    Greeter,
    [
      "0x13e610834B02CF1b9e4F097c6D396eD2CC60D089",
      "0xB91Bb7E498CFf8a2D275C2c0196818a00708E3c9",
      process.env.PLATFORM_WALLET_ADDRESS,
      platformFee,
    ],
    {
      initializer: "initialize",
      kind: "uups",
      unsafeAllow: ["constructor"],
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
