const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
let Owner;
let myNftContract;
describe("MyNFT", function () {
  beforeEach(async () => {
    const [owner] = await ethers.getSigners();
    Owner = owner;

    //deploying MyNFT.sol
    const MyNFTContract = await ethers.getContractFactory("MyNFT");
    myNftContract = await MyNFTContract.deploy();
    await myNftContract.deployed();
  });

  it("Should mint ERC721 NFTs during deployment", async function () {
    expect(await myNftContract.balanceOf(Owner.address, 0)).to.equal(1);
    expect(await myNftContract.balanceOf(Owner.address, 1)).to.equal(1);
    expect(await myNftContract.balanceOf(Owner.address, 2)).to.equal(1);
  });
});
