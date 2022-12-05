// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

contract SwaprExpeditionsNFT is Ownable, ERC1155URIStorage, EIP712 {
    event RewardAdded (uint256 tokenId, string uri);
    event RewardUpdated (uint256 tokenId, string uri);
    event RewardClaimed (address receiver, uint256 tokenId);
    event BaseURIUpdated (string uri);
    event NameUpdated (string name);
    event ContractURIUpdated (string uri);

    struct ClaimingData {
        address receiver;
        uint256 tokenId;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    address public tokenEmitter;
    string public name;
    string public contractURI;
    
    mapping(bytes => bool) private collectedRewards;

    constructor(
        address _tokenEmitter,
        string memory _name,
        string memory _contractURI,
        string memory _baseURI,
        string memory _domainName,
        string memory _version
    ) ERC1155(_baseURI) EIP712(_domainName, _version) {
        _setBaseURI(_baseURI);
        require(_tokenEmitter != address(0), "Token emitter cannot be address zero");
        tokenEmitter = _tokenEmitter;
        contractURI = _contractURI;
        name = _name;

    }

    function updateName(string memory _name) external onlyOwner {
        name = _name;
        emit NameUpdated(_name);
    }

    function updateContractURI(string memory _contractURI) external onlyOwner {
        contractURI = _contractURI;
        emit NameUpdated(_contractURI);
    }

    function updateBaseURI(string memory newUri) external onlyOwner {
        _setBaseURI(newUri);
        emit BaseURIUpdated(newUri);
    }

    function updateURI(uint256 tokenId, string memory newUri) external onlyOwner {
        require(_tokenIds.current() >= tokenId, 'New reward should be added by addRewards');
        _setURI(tokenId, newUri);
        emit RewardUpdated(tokenId, newUri);
    }

    function updateTokenEmitter(address _tokenEmitter) external onlyOwner {
        require(_tokenEmitter != address(0), "Token emitter cannot be address zero");
        tokenEmitter = _tokenEmitter;
    }

    function getRewardsStatus() external view returns(bool[] memory){
        uint256 rewardsCount = _tokenIds.current();
        bool[] memory rewardsStatus = new bool[](rewardsCount);

        for (uint256 i = 0; i < rewardsCount; ++i) {
            if (balanceOf(msg.sender, i+1) > 0) {
                rewardsStatus[i] = true;    
            }
        }

        return rewardsStatus;
    }

    function addRewards(string[] memory uris) external onlyOwner {
        for(uint256 i = 0; i < uris.length; ++i) {
            _tokenIds.increment();
            _setURI(_tokenIds.current(), uris[i]);
            emit RewardAdded(_tokenIds.current(), uris[i]);
        }
    }

    function claimReward(uint256 tokenId, bytes memory signature) external {
        require(_tokenIds.current() >= tokenId, 'Reward not found');
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
