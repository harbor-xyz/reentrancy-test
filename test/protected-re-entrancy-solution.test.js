const Harbor = require("@beam-me-up/harbor");
const hre = require("hardhat");
const { ethers } = require("ethers");
const chai = require("chai");
const expect = chai.expect;
chai.use(require("chai-as-promised"));

function generateRandomTestnetName() {
  return `testnet-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Note: running this solution will NOT work unless you have filled the Harbor
 * Credentials, modify ProtectedBank as per the document's instructions and compile
 * the contracts `npx hardhat compile`.
 */
describe("Re-entrancy test", () => {
  let harbor;
  let testnet;
  let ethereum;
  let provider;
  let protectedBankContract;
  let bankInfo;
  let secondThiefContract;
  let signers;

  const testnetName = generateRandomTestnetName();

  // Fill in your credentials here!
  beforeAll(async () => {
    harbor = new Harbor({
      userKey: "rJyCfz3LRTaAsfgdPuWRJb",
      projectKey: "7rpkaVgFdpUEtzkwtv1svu",
    });

    await harbor.authenticate();
    console.log(
      "Deploying your contracts ... This may take a few minutes. Please stand by."
    );
    testnet = await harbor.apply(
      {
        chains: [
          {
            chain: "ethereum",
            config: {
              artifactsPath: "./artifacts",
              deploy: {
                scripts: "./deploy",
              },
            },
            tag: "v1",
          },
        ],
      },
      testnetName
    );
    signers = await hre.ethers.getSigners();
    ethereum = testnet.ethereum;
    const contracts = await ethereum.contracts();
    const thief = contracts["SecondThief"];
    const bank = contracts["ProtectedBank"];

    secondThiefContract = new ethers.Contract(
      thief.address,
      thief.abi,
      provider.getSigner(0)
    );

    bankInfo = {
      address: bank.address,
      abi: bank.abi,
    };
  }, 360000);
  it("Expects testnet to be RUNNING", async () => {
    expect(testnet.status).to.eql("RUNNING");
  }, 50000);
  it("Deposits 10 ETH into the bank vault from 3 different users", async () => {
    const tenEthers = ethers.utils.parseEther("10");
    for (let i = 0; i < 3; i++) {
      protectedBankContract = new ethers.Contract(
        bankInfo.address,
        bankInfo.abi,
        provider.getSigner(i)
      );
      await protectedBankContract.deposit({ value: tenEthers });
    }
    const balance = (await protectedBankContract.vault()).toString();
    const balanceFormatted = Number(balance) / 1e18;
    expect(balanceFormatted).to.eql(30);

    // Using the SDK to check ProtectedBank balance
    const ethereum = testnet.ethereum;
    const contracts = await ethereum.contracts();
    const protectedBank = contracts["Bank"];
    const balances = await protectedBank.balances();
    const ethBalance = balances["ETH"];
    const balanceFormattedSDK = Number(ethBalance) / 1e18;
    expect(balanceFormattedSDK).to.eql(30);
  }, 50000);
  it("Attempting to attack the ProtectedBank will reject!", async () => {
    const oneEther = ethers.utils.parseEther("1");
    await expect(
      secondThiefContract.steal({
        value: oneEther,
      })
    ).to.be.rejected;
    const balance = (await protectedBankContract.vault()).toString();
    const balanceFormatted = Number(balance) / 1e18;
    expect(balanceFormatted).to.eql(30);

    // Using the SDK to check ProtectedBank balance
    const { ethereum } = testnet;
    const contracts = await ethereum.contracts();
    const protectedBank = contracts["Bank"];
    const balances = await protectedBank.balances();
    const ethBalance = balances["ETH"];
    const balanceFormattedSDK = Number(ethBalance) / 1e18;
    expect(balanceFormattedSDK).to.eql(30);
  }, 50000);
});
