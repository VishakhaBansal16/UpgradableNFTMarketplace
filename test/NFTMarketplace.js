const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
let nftContract;
let mynftContract;
let marketplace;
let seller;
let buyer;
let user;
let platformWallet;
let platformFee = 250;
describe("Marketplace", function () {
  beforeEach(async () => {
    const [owner, Buyer, User, PlatformWallet] = await ethers.getSigners();
    seller = owner;
    buyer = Buyer;
    user = User;
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
    await nftContract.connect(seller).safeMint(seller.address, 0);
    await nftContract.connect(seller).approve(marketplace.address, 0);
    await marketplace
      .connect(seller)
      .createMarketItem(0, 100000000000000n, true);
    await mynftContract
      .connect(seller)
      .setApprovalForAll(marketplace.address, true);
    await marketplace
      .connect(seller)
      .createMarketItem(0, 100000000000000n, false);
  });

  it("Should deploy all 3 contracts", async function () {
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
  });

  it("Listing price should be greater than 0", async function () {
    await mynftContract
      .connect(seller)
      .setApprovalForAll(marketplace.address, true);
    await expect(
      marketplace.connect(seller).createMarketItem(1, 0, false)
    ).to.revertedWith("Price must be greater than 0");
  });

  it("Should list ERC721 NFT to marketplace", async function () {
    expect(await nftContract.balanceOf(marketplace.address)).to.equal(1);
  });

  it("Should list ERC1155 NFT to marketplace", async function () {
    expect(await mynftContract.balanceOf(marketplace.address, 0)).to.equal(1);
  });

  it("Should delist unsold ERC721 NFT from marketplace", async function () {
    await marketplace.connect(seller).cancelMarketItem(1);
    expect(await nftContract.balanceOf(marketplace.address)).to.equal(0);
  });

  it("Should delist unsold ERC1155 NFT from marketplace", async function () {
    await marketplace.connect(seller).cancelMarketItem(2);
    expect(await mynftContract.balanceOf(marketplace.address, 0)).to.equal(0);
  });

  it("Should revert if you are not NFT seller but call cancelMarketItem", async function () {
    await expect(marketplace.connect(user).cancelMarketItem(1)).to.revertedWith(
      "Caller not an owner of the market item"
    );
  });

  it("Should buy listed ERC721 NFT from marketplace", async function () {
    await marketplace.connect(buyer).buyNFT(1, {
      value: ethers.utils.parseEther("0.001"),
    });
  });

  it("Should revert if user buy sold item", async function () {
    await marketplace.connect(buyer).buyNFT(1, {
      value: ethers.utils.parseEther("0.001"),
    });
    await expect(
      marketplace.connect(buyer).buyNFT(1, {
        value: ethers.utils.parseEther("0.001"),
      })
    ).to.revertedWith("Item is already sold");
  });

  it("Should revert if user buy his own item", async function () {
    await expect(
      marketplace.connect(seller).buyNFT(1, {
        value: ethers.utils.parseEther("0.001"),
      })
    ).to.revertedWith("Cannot buy your own item");
  });

  it("Should revert if buyer balance is insufficient", async function () {
    await expect(
      marketplace.connect(buyer).buyNFT(1, {
        value: ethers.utils.parseEther("0.0000001"),
      })
    ).to.revertedWith("Ether Balance is low");
  });

  it("Should buy listed ERC1155 NFT from marketplace", async function () {
    await marketplace.connect(buyer).buyNFT(2, {
      value: ethers.utils.parseEther("0.001"),
    });
  });

  it("Should transfer ether from buyer to the seller", async function () {
    const prevBalance = await ethers.provider.getBalance(seller.address);
    await marketplace.connect(buyer).buyNFT(1, {
      value: ethers.utils.parseEther("0.001"),
    });
    const currentBalance = await ethers.provider.getBalance(seller.address);
    expect(currentBalance).to.be.greaterThan(prevBalance);
  });

  it("Should transfer platformFee from buyer to the platformWallet", async function () {
    const prevBalance = await ethers.provider.getBalance(
      platformWallet.address
    );
    await marketplace.connect(buyer).buyNFT(2, {
      value: ethers.utils.parseEther("0.001"),
    });
    const currentBalance = await ethers.provider.getBalance(
      platformWallet.address
    );
    expect(currentBalance).to.be.greaterThan(prevBalance);
  });

  it("Should transfer NFT from marketplace contract to the buyer", async function () {
    await marketplace
      .connect(buyer)
      .buyNFT(1, { value: ethers.utils.parseEther("0.001") });

    expect(await nftContract.balanceOf(buyer.address)).to.equal(1);
  });

  it("Should transfer NFT from seller to the marketplace contract", async function () {
    expect(await nftContract.balanceOf(marketplace.address)).to.equal(1);
  });

  it("Should return all unsold marketplace items", async function () {
    const items = await marketplace.connect(seller).fetchMarketItems();
    expect(Array.isArray([items]) && items.length > 0).to.equal(true);
  });

  it("Should return all items that function caller has purchased ", async function () {
    await marketplace.connect(buyer).buyNFT(1, {
      value: ethers.utils.parseEther("0.001"),
    });
    const items = await marketplace.connect(buyer).fetchMyNFTs();
    expect(Array.isArray([items]) && items.length > 0).to.equal(true);
  });

  it("Should return all items that a particular user has purchased ", async function () {
    await nftContract.connect(seller).safeMint(seller.address, 1);
    await nftContract.connect(seller).approve(marketplace.address, 1);
    await marketplace
      .connect(seller)
      .createMarketItem(1, 100000000000000n, true);
    await marketplace.connect(user).buyNFT(3, {
      value: ethers.utils.parseEther("0.001"),
    });
    const items = await marketplace.fetchUserNFTs(user.address);
    expect(Array.isArray([items]) && items.length > 0).to.equal(true);
  });

  it("Should return all items that func caller has listed/created", async function () {
    const items = await marketplace.connect(seller).fetchItemsCreated();
    expect(Array.isArray([items]) && items.length > 0).to.equal(true);
  });

  it("Should emit MarketItemCreated event", async function () {
    await nftContract.connect(seller).safeMint(seller.address, 2);
    await nftContract.connect(seller).approve(marketplace.address, 2);
    await expect(
      marketplace.connect(seller).createMarketItem(2, 100000000000000n, true)
    ).to.emit(marketplace, "MarketItemCreated");
  });

  it("Should revert if non-owner list ERC721 NFT to marketplace", async function () {
    await nftContract.connect(seller).safeMint(seller.address, 3);
    await nftContract.connect(seller).approve(marketplace.address, 3);
    await expect(
      marketplace.connect(user).createMarketItem(3, 100000000000000n, true)
    ).to.revertedWith("You must own the ERC721 token to list here");
  });

  it("Should revert if non-owner list ERC1155 NFT to marketplace", async function () {
    await mynftContract
      .connect(seller)
      .setApprovalForAll(marketplace.address, true);
    await expect(
      marketplace.connect(user).createMarketItem(1, 100000000000000n, false)
    ).to.revertedWith("You must own the ERC1155 token to list here");
  });
});
