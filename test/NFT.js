const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
let Owner;
let user;
let nftContract;
describe("NFT", function () {
  beforeEach(async () => {
    const [owner, User] = await ethers.getSigners();
    Owner = owner;
    user = User;

    //deploying NFT.sol
    const NFTContract = await ethers.getContractFactory("NFT");
    nftContract = await NFTContract.deploy();
    await nftContract.deployed();
  });

  it("Should able to mint ERC721 NFTs", async function () {
    await nftContract.connect(Owner).safeMint(Owner.address, 0);
    expect(await nftContract.balanceOf(Owner.address)).to.equal(1);
  });

  it("Should revert if non-owner mint ERC721 NFTs", async function () {
    await expect(
      nftContract.connect(user).safeMint(user.address, 0)
    ).to.revertedWith("Ownable: caller is not the owner");
  });
});
