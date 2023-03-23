//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import './NFTMarketplace.sol';
contract MarketplaceV2 is Marketplace {

    //Update price to newPrice  
    function updateListedItemPrice(uint256 _itemId, uint256 newPrice) public {
        require( idToMarketItem[_itemId].itemId == _itemId, "Invalid itemId");
        require( idToMarketItem[_itemId].seller == msg.sender, "Caller not a seller of the item");
        require( idToMarketItem[_itemId].nftOwner == address(0), "Item is already sold");
        require(newPrice > 0, "Price must be greater than 0"); 
        idToMarketItem[_itemId].price = newPrice; 
    }

   //Returns the contract version
   function NFTMarketplaceVersion() external pure returns (uint256) {
       return 2;
   }
}