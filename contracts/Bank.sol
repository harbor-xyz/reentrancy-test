// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Bank {
    constructor() {
        console.log("Deploying the bank contract.");
    }

    mapping(address => uint256) public balances;

    function vault() public view returns (uint256) {
        return address(this).balance;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 balance = balances[msg.sender];
        (bool transfer, ) = msg.sender.call{value: balance}("");
        require(transfer == true, "Transfer is true");
        balances[msg.sender] = 0;
    }
}
