const Harbor = require("@harbor-xyz/harbor");
const hre = require("hardhat");
const { ethers } = require("ethers");
const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-as-promised"));

function generateRandomTestnetName() {
  return `testnet-${Math.floor(Math.random() * 1000)}`;
}

describe("Re-entrancy test", () => {
  let harbor;
  let testnet;
  let chains;
  let accounts;
  let ethereum;
  let provider;
  let protectedBankContract;
  let bankInfo;
  let secondThiefContract;
  let signers;

  const testnetName = generateRandomTestnetName();

  beforeAll(async () => {
    // Initialize the `harbor` object here!
    harbor = new Harbor({
      userKey: "",
      projectKey: "",
    });

    // Authenticate here!

    // Add the config object below in the first argument of apply!
    testnet = await harbor.apply({}, testnetName);

    signers = await hre.ethers.getSigners();
    ethereum = testnet.ethereum;
    provider = ethers.getDefaultProvider(ethereum.endpoint);
    accounts = await ethereum.accounts();
    const thief = contracts["SecondThief"];
    const bank = contracts["ProtectedBank"];
    // Assign the secondThiefContract here!
    bankInfo = {
      address: bank.address,
      abi: bank.abi,
    };
    // Add a second timeout argument of `360000` here!
  });

  // Tests start
  it("Expects testnet to be RUNNING", async () => {
    // Expect our test to be running below!
  }, 50000);

  // new test
  it("Deposits 10 ETH into the bank vault from 3 different users", async () => {
    const tenEthers = ethers.utils.parseEther("10");
    let totalFunds = 0;
    for (let i = 0; i < 3; i++) {
      // Assign the ProtectedBank contract below!

      // Deposit the ETH below!

      const address = signers[i].address;
    }
    // Get the ProtectedBank balance below!

    // Expect the ProtectedBank's balance to equal to 30!
  }, 50000);

  // new test
  it("Attempting to attack the ProtectedBank will reject!", async () => {
    const oneEther = ethers.utils.parseEther("1");

    // Try to steal from the ProtectedBank. It should reject with `Balance is zero!`

    // Finally, expect the ProtectedBank's vault amount to be 30!
  }, 50000);
});
