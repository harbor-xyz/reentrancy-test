// imports
const { ethers } = require("hardhat");

// async main
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("Bank");
  console.log("Deploying contract...");
  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.deployed();
  console.log(`Bank contract deployed to: ${simpleStorage.address}`);
}

module.exports.default = main;
