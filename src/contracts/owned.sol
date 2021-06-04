pragma solidity ^0.8.0;

contract owned{
    address owner;

    constructor () public{
        owner = msg.sender; //can be tx.origin or msg.sender, as both are similar to deployer in this case
    }

    modifier checkAddress{    
        require(msg.sender != address(0x0));
        _;
    }

    modifier onlyOwner{
        require(owner == msg.sender, "Only the contract owner can destroy the contract");
        _;
    }
}