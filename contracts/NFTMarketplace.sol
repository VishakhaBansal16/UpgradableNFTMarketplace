//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Marketplace is Initializable, OwnableUpgradeable, UUPSUpgradeable, ReentrancyGuardUpgradeable{
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;
    // Interface for ERC721 NFTs
    IERC721 public  nftContract;
    //Interface for ERC1155 NFTs 
    IERC1155 public  myNftContract;
    //set platform fee as 2.5% of nft price
    uint256 public  platformFee;
    address payable public platformWallet;
    
    struct MarketItem {
        address nftAddress;
        bool isERC721;
        uint256 itemId;
        uint256 tokenId;
        address seller;
        address nftOwner;
        uint256 price; //price of 1 nft in ether
        uint256 platformFee; //2.5% of price
        uint256 feeAmount; //calculated platform fee
        uint256 totalPrice; //price + feeAmount
        bool sold;
    }

    mapping(uint256 => MarketItem) public idToMarketItem;

    event MarketItemCreated(
        address nftAddress,
        bool isERC721,
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address nftOwner,
        uint256 price,
        uint256 platformFee,
        uint256 feeAmount,
        uint256 totalPrice,
        bool sold
    );
    
    constructor() initializer {}
    
    function initialize(address nftContractAddress, address myNftContractAddress,address platformWalletAddress, uint256 platformFees) public initializer {
        require(platformWalletAddress != address(0), "Invalid address");
        nftContract = IERC721(nftContractAddress);
        myNftContract = IERC1155(myNftContractAddress);
        platformWallet = payable(platformWalletAddress);
        platformFee = platformFees;
       __Ownable_init();
       __ReentrancyGuard_init();
    }

   function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
   //Listing NFT
    function createMarketItem(uint256 tokenId, uint256 priceInWei, bool isErc721) public nonReentrant {
        if( isErc721){
            require(nftContract.ownerOf(tokenId) == msg.sender, "You must own the ERC721 token to list here");
        require(priceInWei > 0, "Price must be greater than 0");    

        _itemIds.increment();
        uint256 itemId = _itemIds.current();
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
            priceInWei,
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
            priceInWei,
            platformFee,
            calPlatformFee,
            totalPrice,
            false
        );
        }

        else{
        require(myNftContract.balanceOf(msg.sender, tokenId) == 1, "You must own the ERC1155 token to list here");
        require(priceInWei > 0, "Price must be greater than 0");    

        _itemIds.increment();
        uint256 itemId = _itemIds.current();
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
            priceInWei,
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
            priceInWei,
            platformFee,
            calPlatformFee,
            totalPrice,
            false
        );
        }
    }

    //user can buy listed NFT by paying ether
    function buyNFT(uint256 itemId) public nonReentrant payable{
        bool isERC721 = idToMarketItem[itemId].isERC721;
        uint256 totalPrice = idToMarketItem[itemId].totalPrice;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        address seller = idToMarketItem[itemId].seller;        
        uint256 feeAmount = idToMarketItem[itemId].feeAmount; 

        require(
            idToMarketItem[itemId].nftOwner == address(0),
            "Item is already sold"
        );

        require(
            idToMarketItem[itemId].seller != msg.sender,
            "Cannot buy your own item"
        );
  
  idToMarketItem[itemId].nftOwner = msg.sender;
        idToMarketItem[itemId].sold = true;
        require(msg.value >= totalPrice, "Ether Balance is low");

         if(msg.value > totalPrice){
            uint256 remainingBalance =  msg.value - totalPrice;
            uint256 amount = remainingBalance;
            remainingBalance = 0;
            payable(msg.sender).transfer(amount);
        }

        uint256 actualPrice = totalPrice - feeAmount;
        uint256 actual_price = actualPrice;
        actualPrice = 0;
        //transfer of eth from buyer to seller
        payable(seller).transfer(actual_price);
        //transfer of eth from buyer to platformWallet
        uint256 fee = feeAmount;
        feeAmount = 0;
       payable(platformWallet).transfer(fee);     
       
       if(isERC721){
        nftContract.safeTransferFrom(address(this), msg.sender, tokenId);
       }
       else{
        myNftContract.safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
       }
        
        _itemsSold.increment();
    }

    //Cancel the sale of a listed marketplace item
    //Transfers ownership of the listed item 
    function cancelMarketItem(uint256 itemId) public nonReentrant {
        bool isERC721 = idToMarketItem[itemId].isERC721;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(
            idToMarketItem[itemId].seller == msg.sender,
            "Caller not an owner of the market item"
        );

        idToMarketItem[itemId].nftOwner = msg.sender;
        idToMarketItem[itemId].sold = true;
        if(isERC721){
            nftContract = IERC721(idToMarketItem[itemId].nftAddress);        
            nftContract.safeTransferFrom(address(this), msg.sender, tokenId);
        }
        else{
            myNftContract = IERC1155(idToMarketItem[itemId].nftAddress);        
            myNftContract.safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
        }
       
        _itemsSold.increment();
    } 

     //Returns all unsold market items 
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].nftOwner == address(0)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
   
    //Returns all items that function caller has purchased 
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].nftOwner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].nftOwner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

     //Returns items that a paticular user have purchased
    function fetchUserNFTs(address userAddress) public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].nftOwner == userAddress) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].nftOwner == userAddress) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    //Returns all items that func caller has created or listed
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
   
    function onERC721Received(address, address, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function onERC1155Received(address, address, uint256, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }
}