//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";

contract NFT is  ERC721Royalty, Ownable{
    constructor() ERC721("ERC721NFT", "NFT"){}

     function safeMint(address account, uint256 tokenId) public onlyOwner{
        _safeMint(account, tokenId);
    }
}