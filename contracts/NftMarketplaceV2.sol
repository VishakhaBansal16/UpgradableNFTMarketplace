//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import './NFTMarketplace.sol';
contract MarketplaceV2 is Marketplace {

    //Update price to newPrice  
    function updateListedItemPrice(uint256 itemId, uint256 newPrice) public {
        require( idToMarketItem[itemId].itemId == itemId, "Invalid itemId");
        require( idToMarketItem[itemId].seller == msg.sender, "Caller not a seller of the item");
        require( idToMarketItem[itemId].nftOwner == address(0), "Item is already sold");
        require(newPrice > 0, "Price must be greater than 0"); 
        idToMarketItem[itemId].price = newPrice; 
    }

   //Returns the contract version
   function nftMarketplaceVersion() external pure returns (uint256) {
       return 2;
   }
}