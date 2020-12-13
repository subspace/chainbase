// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.8.0;
pragma experimental ABIEncoderV2;

/**
 * @title Subspace Bridge
 * @dev Store the lastest Subspace block header
 */
contract Bridge {
    
    struct BlockHeader {
        uint256 previousBlock;
        uint64 blockHeight;
        uint64 nonce;
        uint256 publicKey;
        uint256 stateRoot;
    }
    
    BlockHeader lastBlockHeader;
    
    function update(BlockHeader memory newBlockHeader) public {
        lastBlockHeader = newBlockHeader;
    }
}