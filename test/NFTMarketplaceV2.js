const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
let nftContract;
let mynftContract;
let marketplace;
let marketplaceV2;
let seller;
let user;
let buyer;
let platformWallet;
let platformFee = 250;
describe("MarketplaceV2", function () {
  beforeEach(async () => {
    const [owner, Buyer, User, PlatformWallet] = await ethers.getSigners();
    seller = owner;
    user = User;
    buyer = Buyer;
    platformWallet = PlatformWallet;
    //deploying NFT.sol
    const NFTContract = await ethers.getContractFactory("NFT");
    nftContract = await NFTContract.deploy();
    await nftContract.deployed();

    //deploying MyNFT.sol
    const Token = await ethers.getContractFactory("MyNFT");
    mynftContract = await Token.deploy();
    await mynftContract.deployed();

    //deploying Marketplace.sol
    const Greeter = await ethers.getContractFactory("Marketplace");
    marketplace = await upgrades.deployProxy(
      Greeter,
      [
        nftContract.address,
        mynftContract.address,
        platformWallet.address,
        platformFee,
      ],
      {
        initializer: "initialize",
      }
    );
    await marketplace.deployed();

    //deploying MarketplaceV2.sol
    const NFTMarketplaceV2 = await ethers.getContractFactory("MarketplaceV2");
    marketplaceV2 = await upgrades.upgradeProxy(
      marketplace.address,
      NFTMarketplaceV2
    );
    await marketplaceV2.deployed();

    await nftContract.connect(seller).safeMint(seller.address, 1);
    await nftContract.connect(seller).approve(marketplaceV2.address, 1);
    await marketplace
      .connect(seller)
      .createMarketItem(1, 100000000000000n, true);
  });

  it("Should deploy", async function () {
    //deploying NFT.sol
    const NFTContract = await ethers.getContractFactory("NFT");
    nftContract = await NFTContract.deploy();
    await nftContract.deployed();

    //deploying MyNFT.sol
    const Token = await ethers.getContractFactory("MyNFT");
    mynftContract = await Token.deploy();
    await mynftContract.deployed();

    //deploying Marketplace.sol
    const Greeter = await ethers.getContractFactory("Marketplace");
    marketplace = await upgrades.deployProxy(
      Greeter,
      [
        nftContract.address,
        mynftContract.address,
        platformWallet.address,
        platformFee,
      ],
      {
        initializer: "initialize",
      }
    );
    await marketplace.deployed();

    //deploying MarketplaceV2.sol
    const NFTMarketplaceV2 = await ethers.getContractFactory("MarketplaceV2");
    marketplaceV2 = await upgrades.upgradeProxy(
      marketplace.address,
      NFTMarketplaceV2
    );
    await marketplaceV2.deployed();
  });

  it("Should return version of marketplace contract", async function () {
    expect(
      await marketplaceV2.connect(seller).NFTMarketplaceVersion()
    ).to.equal(2);
  });

  it("Should revert if itemId is invalid", async function () {
    await expect(
      marketplaceV2.connect(seller).updateListedItemPrice(2, 10000000000)
    ).to.revertedWith("Invalid itemId");
  });

  it("Should revert if caller not a seller of the item", async function () {
    await expect(
      marketplaceV2.connect(user).updateListedItemPrice(1, 10000000000)
    ).to.revertedWith("Caller not a seller of the item");
  });

  it("Should revert if item is sold", async function () {
    await marketplace.connect(buyer).buyNFT(1, {
      value: ethers.utils.parseEther("0.001"),
    });
    await expect(
      marketplaceV2.connect(seller).updateListedItemPrice(1, 10000000000)
    ).to.revertedWith("Item is already sold");
  });

  it("Should revert if newPrice is less than 0", async function () {
    await expect(
      marketplaceV2.connect(seller).updateListedItemPrice(1, 0)
    ).to.revertedWith("Price must be greater than 0");
  });

  it("Should update price of listed NFT", async function () {
    await marketplaceV2.connect(seller).updateListedItemPrice(1, 10000);
  });
});
