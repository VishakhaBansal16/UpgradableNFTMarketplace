//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
//import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract Marketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;
    mapping(bytes4 => bool) private _supportedInterfaces;
    // Interface for ERC721 NFTs
    IERC721 public  nftContract;
    //Interface for ERC1155 NFTs 
    IERC1155 public  myNftContract;
    address payable  owner;
    //set platform fee as 2.5% of nft price
    uint256 public  platformFee = 250;
    address payable public platformWallet;
    
    struct MarketItem {
        address nftAddress;
        bool isERC721;
        uint256 itemId;
        uint256 tokenId;
        address seller;
        address owner;
        uint256 price; //price of 1 nft in ether
        uint256 platformFee; //2.5% of price
        uint256 feeAmount; //calculated platform fee
        uint256 totalPrice; //price + feeAmount
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        address nftAddress,
        bool isERC721,
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        uint256 platformFee,
        uint256 feeAmount,
        uint256 totalPrice,
        bool sold
    );
    constructor(address _nftContract, address _myNftContract,address _platformWallet) {
        owner = payable(msg.sender);
        nftContract = IERC721(_nftContract);
        myNftContract = IERC1155(_myNftContract);
        platformWallet = payable(_platformWallet);
    }
    
    function createMarketItem(uint256 tokenId, uint256 priceInEth, bool isErc721) public nonReentrant {
        if( isErc721 == true){
            require(nftContract.ownerOf(tokenId) == msg.sender, "You must own the ERC721 token to list here");
        require(priceInEth > 0, "Price must be greater than 0");    

        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        uint256 priceInWei = priceInEth * 10 ** 18;
        //calculate platform fee i.e, 2.5% of price
        uint256 calPlatformFee = (priceInWei * platformFee) / 10000;  //platformFee = 250 = 2.5%
        uint256 totalPrice = priceInWei + calPlatformFee;

        idToMarketItem[itemId] = MarketItem(
            address(nftContract),
            true,
            itemId,
            tokenId,
            msg.sender,
            address(0),
            priceInEth,
            platformFee,
            calPlatformFee,
            totalPrice,
            false
        );

        nftContract.safeTransferFrom(
            msg.sender,
            address(this),
            tokenId
        );

        emit MarketItemCreated(
            address(nftContract),
            true,
            itemId,
            tokenId,
            msg.sender,
            address(0),
            priceInEth,
            platformFee,
            calPlatformFee,
            totalPrice,
            false
        );
        }

        else{
        require(myNftContract.balanceOf(msg.sender, tokenId) == 1, "You must own the ERC1155 token to list here");
        require(priceInEth > 0, "Price must be greater than 0");    

        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        uint256 priceInWei = priceInEth * 10 ** 18;
        //calculate platform fee i.e, 2.5% of price
        uint256 calPlatformFee = (priceInWei * platformFee) / 10000;  //platformFee = 250 = 2.5%
        uint256 totalPrice = priceInWei + calPlatformFee;

        idToMarketItem[itemId] = MarketItem(
            address(myNftContract),
            false,
            itemId,
            tokenId,
            msg.sender,
            address(0),
            priceInEth,
            platformFee,
            calPlatformFee,
            totalPrice,
            false
        );

        myNftContract.safeTransferFrom(
            msg.sender,
            address(this),
            tokenId, 1, ""
        );

        emit MarketItemCreated(
            address(myNftContract),
            false,
            itemId,
            tokenId,
            msg.sender,
            address(0),
            priceInEth,
            platformFee,
            calPlatformFee,
            totalPrice,
            false
        );
        }
    }

    //user can buy NFT by paying ether
    function buyNFT(uint256 itemId) public nonReentrant payable{
        bool isERC721 = idToMarketItem[itemId].isERC721;
        uint256 totalPrice = idToMarketItem[itemId].totalPrice;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        address seller = idToMarketItem[itemId].seller;        
        uint256 feeAmount = idToMarketItem[itemId].feeAmount; 

        require(
            idToMarketItem[itemId].owner == address(0),
            "Item is already sold"
        );

        require(
            idToMarketItem[itemId].seller != msg.sender,
            "Cannot buy your own item"
        );

        uint256 actualPrice = totalPrice - feeAmount;

        //transfer of eth from buyer to seller
        payable(seller).transfer(actualPrice);
        //transfer of eth from buyer to platformWallet
       payable(platformWallet).transfer(feeAmount);     
       
       if(isERC721 == true){
        nftContract.safeTransferFrom(address(this), msg.sender, tokenId);
       }
       else{
        myNftContract.safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
       }
        idToMarketItem[itemId].owner = msg.sender;
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
    }

    /* Cancel the sale of a marketplace item */
    /* Transfers ownership of the item */
    function cancelMarketItem(uint256 itemId) public nonReentrant {
        bool isERC721 = idToMarketItem[itemId].isERC721;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(
            idToMarketItem[itemId].seller == msg.sender,
            "Caller not an owner of the market item"
        );
        if(isERC721 == true){
            nftContract = IERC721(idToMarketItem[itemId].nftAddress);        
            nftContract.safeTransferFrom(address(this), msg.sender, tokenId);
        }
        else{
            myNftContract = IERC1155(idToMarketItem[itemId].nftAddress);        
            myNftContract.safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
        }
       idToMarketItem[itemId].owner = msg.sender;
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
    } 

    function onERC721Received(address, address, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function onERC1155Received(address, address, uint256, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }
}