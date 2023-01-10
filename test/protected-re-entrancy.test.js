const Harbor = require("@harbor-xyz/harbor");
const hre = require("hardhat");
const { expect } = require("chai");
const { ethers } = require("ethers");

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
  let anotherThiefContract;
  let signers;

  const testnetName = generateRandomTestnetName();

  beforeAll(async () => {
    // Initialize the `harbor` object here
    harbor = new Harbor({
      userKey: "",
      projectKey: "p",
    });

    // Authenticate in the code below!

    // Add the config object below in the first argument of apply!
    testnet = await harbor.apply({}, testnetName);

    provider = ethers.getDefaultProvider(ethereum.endpoint);
    signers = await hre.ethers.getSigners();
    chains = await testnet.chains();
    ethereum = chains[0];
    accounts = await ethereum.accounts();
    for (i = 0; i < accounts.length; i++) {
      if (accounts[i].type == "contract") {
        if (accounts[i].name == "AnotherThief") {
          // Assign the contract here!
        } else if ((accounts[i].name = "Bank")) {
          bankInfo = {
            address: accounts[i].address,
            abi: accounts[i].abi,
          };
        }
      }
    }
  }, 360000);
  it("Expects testnet to be RUNNING", async () => {
    // Expect our test to be running below!
  }, 50000);
  it("Deposits 10 ETH into the bank vault from 3 different users", async () => {
    const tenEthers = ethers.utils.parseEther("10");
    let totalFunds = 0;
    for (let i = 0; i < 3; i++) {
      // Assign the bank contract here!

      // Deposit the ETH here

      const address = signers[i].address;
      const userBalance = (await bankContract.balances(address)).toString();
      const userBalanceFormatted = Number(userBalance) / 1e18;
      totalFunds += userBalanceFormatted;
    }
    const balance = (await bankContract.vault()).toString();
    const balanceFornatted = Number(balance) / 1e18;
    testnet = await harbor.testnet(testnetName);
    // Expect the totalFunds to equal the bank's balance
    expect(totalFunds).to.eql(balanceFornatted);
  }, 50000);
  it("Attempting to attack the ProtectedBank will reject!", async () => {
    const oneEther = ethers.utils.parseEther("1");
    // Try to steal from the Bank. It should reject with `Balance is zero!`
  });
});
