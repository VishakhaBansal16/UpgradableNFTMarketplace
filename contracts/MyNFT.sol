// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MyNFT is ERC1155 {
    uint256 public constant Gold = 0;
    uint256 public constant Silver = 1;
    uint256 public constant Diamond = 2;

    constructor() ERC1155("MyNFT") {
        _mint(msg.sender, Gold, 1, "");
        _mint(msg.sender, Silver, 1, "");
        _mint(msg.sender, Diamond, 1, "");
    }
}