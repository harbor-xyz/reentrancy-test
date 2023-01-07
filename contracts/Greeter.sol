//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Greeter {
    string private greeting;
    mapping(address => uint256) private userBalances;

    constructor(string memory _greeting) {
        console.log("Deploying a Greeter with greeting:", _greeting);
        greeting = _greeting;
    }

    function deposit() external payable {
        console.log(msg.value);
        userBalances[msg.sender] += msg.value;
        console.log("DID WE PASS THIS?");
    }

    function getBalance() public view returns (uint256) {
        uint256 balance = address(this).balance;
        return balance;
    }

    function withdraw() public {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
