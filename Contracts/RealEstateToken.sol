// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RealEstateToken is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    struct Property {
        uint256 id;
        string location;
        uint256 price;
        bool isListed;
    }
    
    mapping(uint256 => Property) public properties;

    event PropertyListed(uint256 indexed id, string location, uint256 price);
    event PropertyBought(uint256 indexed id, address indexed buyer, uint256 price);
    event PropertyRelisted(uint256 indexed id, uint256 price);
    
    constructor() ERC721("RealEstateToken", "RET") Ownable(msg.sender) {}

    function listProperty(string memory _location, uint256 _price) public onlyOwner {
        uint256 newPropertyId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        properties[newPropertyId] = Property(newPropertyId, _location, _price, true);
        _mint(msg.sender, newPropertyId);

        emit PropertyListed(newPropertyId, _location, _price);
    }
    
    function buyProperty(uint256 propertyId) public payable {
        Property storage property = properties[propertyId];
        
        require(property.isListed, "Property is not for sale");
        require(msg.value >= property.price, "Insufficient funds");

        address seller = ownerOf(propertyId);

        // Transfer ownership
        _transfer(seller, msg.sender, propertyId);
        property.isListed = false;

        // Payment transfer (safe call)
        (bool success, ) = payable(seller).call{value: msg.value}("");
        require(success, "Payment transfer failed");

        emit PropertyBought(propertyId, msg.sender, msg.value);
    }

    function setForSale(uint256 propertyId, uint256 newPrice) public {
        require(ownerOf(propertyId) == msg.sender, "Only the owner can list the property");
        require(newPrice > 0, "Price must be greater than zero");

        properties[propertyId].isListed = true;
        properties[propertyId].price = newPrice;

        emit PropertyRelisted(propertyId, newPrice);
    }
    
    // Add this function to your RealEstateToken contract
    
    /**
     * @dev Burns (destroys) the token with the given ID
     * @param tokenId The ID of the token to burn
     */
    function burn(uint256 tokenId) public {
        // Check that the caller is the owner or approved
        require(ownerOf(tokenId) == _msgSender() || 
                getApproved(tokenId) == _msgSender() || 
                isApprovedForAll(ownerOf(tokenId), _msgSender()),
                "Caller is not owner nor approved");
        
        // Burn the token
        _burn(tokenId);
        
        // Clean up the property data
        delete properties[tokenId];
    }
}