// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Bank {
    mapping(address => uint256) public balances;

    function vault() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() external {
        uint256 balance = balances[msg.sender];
        (bool transfer, ) = msg.sender.call{value: balance}("");
        require(transfer == true, "Transfer is true");
        balances[msg.sender] = 0;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }
}
