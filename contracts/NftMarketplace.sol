// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

//Custom Errors
error PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error ItemNotForSale(address nftAddress, uint256 tokenId);
error NotListed(address nftAddress, uint256 tokenId);
error AlreadyListed(address nftAddress, uint256 tokenId);
error NoProceeds();
error NotOwner();
error NotApprovedForMarketplace();
error PriceMustBeAboveZero();

contract NftMarketplace is ReentrancyGuard {
    //Structs
    struct ListedItem {
        uint256 listedId;
        uint256 tokenId;
        address contractAddress;
        uint256 price;
        address seller;
        bool forSale;
    }

    //Events
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );
    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    // State Variables
    // - ListedItems Array
    ListedItem[] private listedItems;
    // - Sellers address => AmountInSales
    mapping(address => uint256) private s_proceeds;

    using Counters for Counters.Counter;
    Counters.Counter private _totalNftsListed;
    Counters.Counter private _listId;
    mapping(uint256 => ListedItem) private listedNfts;

    // Function Modifiers
    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        ListedItem memory listing;
        for (uint i = 0; i < listedItems.length; i++) {
            if (
                listedItems[i].contractAddress == nftAddress &&
                listedItems[i].tokenId == tokenId
            ) {
                listing = listedItems[i];
            }
        }
        if (listing.price > 0) {
            revert AlreadyListed(nftAddress, tokenId);
        }
        _;
    }
    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NotOwner();
        }
        _;
    }
    modifier isListed(
        uint256 listedId,
        address nftAddress,
        uint256 tokenId
    ) {
        ListedItem memory listing = listedNfts[listedId];
        if (listing.price <= 0) {
            revert NotListed(nftAddress, tokenId);
        }
        _;
    }

    //Functions
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId, msg.sender)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert PriceMustBeAboveZero();
        }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NotApprovedForMarketplace();
        }

        // listedItems.push(
        //     ListedItem(tokenId, nftAddress, price, msg.sender, true)
        // );
        _totalNftsListed.increment();
        _listId.increment();
        uint256 _currentListId = _listId.current();
        listedNfts[_currentListId] = ListedItem(
            _currentListId,
            tokenId,
            nftAddress,
            price,
            msg.sender,
            true
        );

        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function cancelListing(
        uint256 listedId,
        address nftAddress,
        uint256 tokenId
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(listedId, nftAddress, tokenId)
    {
        delete (listedNfts[listedId]);
        _totalNftsListed.decrement();
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    function buyItem(
        uint256 listedId,
        address nftAddress,
        uint256 tokenId
    ) external payable isListed(listedId, nftAddress, tokenId) nonReentrant {
        ListedItem memory listedItem = listedNfts[listedId];
        if (msg.value < listedItem.price) {
            revert PriceNotMet(nftAddress, tokenId, listedItem.price);
        }

        s_proceeds[listedItem.seller] += msg.value;
        IERC721(nftAddress).safeTransferFrom(
            listedItem.seller,
            msg.sender,
            tokenId
        );

        delete (listedNfts[listedId]);
        _totalNftsListed.decrement();
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    function updateListing(
        uint256 listedId,
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isListed(listedId, nftAddress, tokenId)
        nonReentrant
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (newPrice == 0) {
            revert PriceMustBeAboveZero();
        }

        listedNfts[listedId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NoProceeds();
        }
        s_proceeds[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        require(success, "Transfer failed");
    }

    function getListing(uint256 listedId)
        external
        view
        returns (ListedItem memory)
    {
        return listedNfts[listedId];
    }

    function getAllItemsListed() public view returns (ListedItem[] memory) {
        uint256 resultCount;
        for (uint i = 0; i < _totalNftsListed.current(); i++) {
            if (listedNfts[i + 1].forSale) {
                resultCount++;
            }
        }
        ListedItem[] memory items = new ListedItem[](resultCount);
        uint256 j;

        for (uint i = 0; i < _totalNftsListed.current(); i++) {
            if (listedNfts[i + 1].forSale) {
                items[j] = listedNfts[i + 1];
                j++;
            }
        }
        return items;
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
