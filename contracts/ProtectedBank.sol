// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProtectedBank {
    mapping(address => uint256) public balances;

    function vault() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() external {
        // Add a require statement below!
        uint256 balance = balances[msg.sender];
        require(balance > 0, "");
        // Cut the code below
        balances[msg.sender] = 0;

        // Paste the code cut from line 21 below

        (bool transfer, ) = msg.sender.call{value: balance}("");
        require(transfer == true, "Transfer is true");
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }
}
