// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

contract SwaprExpeditionsNFT is Ownable, ERC1155URIStorage, EIP712 {
    event RewardAdded (uint256 tokenId, string uri);
    event RewardClaimed (address receiver, uint256 tokenId);
    
    struct ClaimingData {
        address receiver;
        uint256 tokenId;
    }
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address public tokenEmitter;
    
    mapping(bytes => bool) private collectedRewards;

    constructor(
        address _tokenEmmiter,
        string memory _baseURI,
        string memory _domainName,
        string memory _version
    ) ERC1155(_baseURI) EIP712(_domainName, _version) {
        _setBaseURI(_baseURI);
        tokenEmitter = _tokenEmmiter;
    }

    function addRewards(string[] memory uris) public onlyOwner {
        for(uint256 i = 0; i < uris.length; ++i) {
            _tokenIds.increment();
            _mint(address(this), 0, _tokenIds.current(), '');
            _setURI(_tokenIds.current(), uris[i]);
            emit RewardAdded(_tokenIds.current(), uris[i]);
        }
    }

    function claimReward(uint256 tokenId, bytes memory signature) public {
        require(collectedRewards[signature] == false, 'Reward already claimed');

        ClaimingData memory claimingData = ClaimingData(
            msg.sender,
            tokenId
        );

        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "ClaimingData(address receiver,uint256 tokenId)"
                    ),
                    claimingData.receiver,
                    claimingData.tokenId
                )
            )
        );

        address signer = ECDSA.recover(digest, signature);
    
        require(signer == tokenEmitter, 'Invalid token emitter');

        collectedRewards[signature] = true;
        
        _mint(msg.sender, tokenId, 1, '');

        emit RewardClaimed(msg.sender, tokenId);
    }
}
