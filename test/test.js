require("dotenv").config();
const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const platformFee = 250;
async function deploy() {
  const [seller, buyer] = await ethers.getSigners();
  //deploying NFT.sol
  const MyContract = await ethers.getContractFactory("NFT");
  const myContract = await MyContract.deploy();
  await myContract.deployed();

  //deploying MyNFT.sol
  const Token = await ethers.getContractFactory("MyNFT");
  const token = await Token.deploy();
  await token.deployed();

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
  return {
    seller,
    buyer,
    myContract,
    token,
    greeter,
  };
}

describe("Marketplace", function () {
  it("Should deploy all 3 contracts", async function () {
    //deploying NFT.sol
    const MyContract = await ethers.getContractFactory("NFT");
    const myContract = await MyContract.deploy();
    await myContract.deployed();

    //deploying MyNFT.sol
    const Token = await ethers.getContractFactory("MyNFT");
    const token = await Token.deploy();
    await token.deployed();

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
  });

  it("Should list ERC721 NFT to marketplace", async function () {
    const { seller, myContract, greeter } = await deploy();
    await myContract.connect(seller).safeMint(seller.address, 0);
    await myContract.connect(seller).approve(greeter.address, 0);
    await greeter.connect(seller).createMarketItem(0, 100000000000000, true);
  });

  it("Should list ERC1155 NFT to marketplace", async function () {
    const { seller, token, greeter } = await deploy();
    await token.connect(seller).setApprovalForAll(greeter.address, true);
    await greeter.connect(seller).createMarketItem(0, 100000000000000, false);
  });

  it("Should buy listed ERC721 NFT from marketplace", async function () {
    const { seller, buyer, myContract, greeter } = await deploy();
    await myContract.connect(seller).safeMint(seller.address, 1);
    await myContract.connect(seller).approve(greeter.address, 1);
    await greeter.connect(seller).createMarketItem(1, 100000000000000, true);
    await greeter.connect(buyer).buyNFT(1, {
      value: ethers.utils.parseEther("0.001"),
    });
  });

  it("Should buy listed ERC1155 NFT from marketplace", async function () {
    const { seller, buyer, token, greeter } = await deploy();
    await token.connect(seller).setApprovalForAll(greeter.address, true);
    await greeter.connect(seller).createMarketItem(1, 100000000000000, false);
    await greeter.connect(buyer).buyNFT(1, {
      value: ethers.utils.parseEther("0.001"),
    });
  });

  it("Should cancel/delist unsold listed ERC721 NFT from marketplace", async function () {
    const { seller, myContract, greeter } = await deploy();
    await myContract.connect(seller).safeMint(seller.address, 2);
    await myContract.connect(seller).approve(greeter.address, 2);
    await greeter.connect(seller).createMarketItem(2, 100000000000000, true);
    const currentItemId = await greeter.connect(seller).currentItemId();
    await greeter.connect(seller).cancelMarketItem(currentItemId);
  });
});
