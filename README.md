## Table of Contents

- [Task Description](#task-description)
- [Tasks Included](#tasks-included)
- [Technologies Included](#technologies-included)
- [Install and run](#install-and-run)
- [Hardhat Setup](#hardhat-setup)
- [Testing](#testing)
- [Solidity-coverage](#solidity-coverage)
- [Slither](#slither)
- [A Typical Top Level Directory](#a-typical-top-level-directory)

## Task Description

Create an upgradeable NFT marketplace.

## Tasks Included

1. Develop a NFT marketplace contract
   - Users can list their NFTs for sale (Should accept both ERC721 and ERC1155 tokens)
   - Others can buy listed NFTs (By paying in terms of ETHERS/MATIC)
   - User can update the listed NFT's properties (Ex: price)
   - User can de-list their NFTs from marketplace
2. The marketplace contract must be proxy upgradeable (UUPS proxy standard)
3. Write test-cases for the marketplace contract
4. Perform solidity test-cases coverage (for checking all functions are being covered)
5. Do static analysis of the smart-contract using Slither

## Technologies Included

- Solidity for smart contracts
- JavaScript for testing and writing scripts
- Hardhat for deploying contract on testnet goerli

## Install and Run

To run this project, you must have the following installed:

- nodejs
- npm

Run npm install to install required dependencies.

```
$ npm install
```

## Hardhat Setup

Run npm install hardhat to install hardhat.

```
npm install hardhat
```

Run npm install '@nomiclabs/hardhat-etherscan' to install hardhat plugin for verifying contracts on etherscan.

```
npm install '@nomiclabs/hardhat-etherscan'
```

Run npm i @nomiclabs/hardhat-ethers to install plugin which brings Hardhat the Ethereum library ethers.js, which allows to interact with the Ethereum blockchain

```
Run npm i @nomiclabs/hardhat-ethers
```

Run npx hardhat to run the hardhat in application.

```
npx hardhat
```

This project demonstrates an hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.

Try running some of the following tasks:

Run npx hardhat compile to compile all contracts.

```
npx hardhat compile
```

Run npx hardhat run scripts/deploy.js --network goerli to deploy contracts on network goerli.

```
npx hardhat run scripts/deploy.js --network goerli
```

Run npx hardhat verify --network goerli <deployedContractAddress> to verify the deployed contracts on network goerli.

```
npx hardhat run verify --network goerli <deployedContractAddress>
```

Run npx hardhat test for unit testing smart contract

```
npx hardhat test
```

NFT contract deployed to: 0x13e610834B02CF1b9e4F097c6D396eD2CC60D089
MyNFT contract deployed to:0xB91Bb7E498CFf8a2D275C2c0196818a00708E3c9
//Marketplace contract deployed to: 0x6A43505250b3788150ff152d92134bc790dba678
//Proxy contract address is: 0x6eEfB26589dB41f3504449b3F7c0d1bC522dDb1b

## Testing

Run npx hardhat test for unit testing smart contract

```
npx hardhat test
```

Expecting Test result:-

```
MyNFT
    ✔ Should mint ERC721 NFTs during deployment (78ms)

  NFT
    ✔ Should able to mint ERC721 NFTs (67ms)
    ✔ Should revert if non-owner mint ERC721 NFTs (72ms)

  Marketplace
    ✔ Should deploy all 3 contracts (368ms)
    ✔ Listing price should be greater than 0 (71ms)
    ✔ Should list ERC721 NFT to marketplace
    ✔ Should list ERC1155 NFT to marketplace
    ✔ Should delist unsold ERC721 NFT from marketplace (53ms)
    ✔ Should delist unsold ERC1155 NFT from marketplace (46ms)
    ✔ Should revert if you are not NFT seller but call cancelMarketItem
    ✔ Should buy listed ERC721 NFT from marketplace (46ms)
    ✔ Should revert if user buy sold item (78ms)
    ✔ Should revert if user buy his own item
    ✔ Should revert if buyer balance is insufficient
    ✔ Should buy listed ERC1155 NFT from marketplace (40ms)
    ✔ Should transfer ether from buyer to the seller (40ms)
    ✔ Should transfer platformFee from buyer to the platformWallet (42ms)
    ✔ Should transfer NFT from marketplace contract to the buyer (50ms)
    ✔ Should transfer NFT from seller to the marketplace contract
    ✔ Should return all unsold marketplace items (54ms)
    ✔ Should return all items that function caller has purchased  (78ms)
    ✔ Should return all items that a particular user has purchased  (319ms)
    ✔ Should return all items that func caller has listed/created
    ✔ Should emit MarketItemCreated event (90ms)
    ✔ Should revert if non-owner list ERC721 NFT to marketplace (53ms)
    ✔ Should revert if non-owner list ERC1155 NFT to marketplace (44ms)

 MarketplaceV2
    ✔ Should deploy (1639ms)
    ✔ Should return version of marketplace contract (38ms)
    ✔ Should revert if itemId is invalid (51ms)
    ✔ Should revert if caller not a seller of the item (48ms)
    ✔ Should revert if item is sold (156ms)
    ✔ Should revert if newPrice is less than 0 (49ms)
    ✔ Should update price of listed NFT (45ms)


  33 passing (1m)

```

## Solidity-coverage

Run npm i --save-dev solidity-coverage to install solidity-coverage

```
npm i --save-dev solidity-coverage
```

Require the plugin in hardhat.config.js

```
require('solidity-coverage')
```

Run npx hardhat coverage to perform solidity test-cases coverage.

```
npx hardhat coverage
```

You will see a report as shown below-

![solidity-coverage report image](./images/solidity-coverage-report.png?raw=true)

## Slither

You will see a report as shown below-

![slither report image](./images/slither-report.png?raw=true)

## A Typical Top Level Directory

```


```
