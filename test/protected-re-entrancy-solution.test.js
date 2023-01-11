const Harbor = require("@beam-me-up/harbor");
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
    harbor = new Harbor({
      userKey: "cFeJWnDwQFVTSF2AabJmW5",
      projectKey: "fPMeKGPUfyBTCoqtXmv3G4",
    });

    await harbor.authenticate();
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
    chains = await testnet.chains();
    ethereum = chains[0];
    provider = ethers.getDefaultProvider(ethereum.endpoint);
    accounts = await ethereum.accounts();
    for (i = 0; i < accounts.length; i++) {
      if (accounts[i].type == "contract") {
        if (accounts[i].name == "SecondThief") {
          secondThiefContract = new ethers.Contract(
            accounts[i].address,
            accounts[i].abi,
            provider.getSigner(0)
          );
        } else if ((accounts[i].name = "ProtectedBank")) {
          bankInfo = {
            address: accounts[i].address,
            abi: accounts[i].abi,
          };
        }
      }
    }
  }, 360000);
  it("Expects testnet to be RUNNING", async () => {
    expect(testnet.status).to.eql("RUNNING");
  }, 50000);
  it("Deposits 10 ETH into the bank vault from 3 different users", async () => {
    const tenEthers = ethers.utils.parseEther("10");
    let totalFunds = 0;
    for (let i = 0; i < 3; i++) {
      protectedBankContract = new ethers.Contract(
        bankInfo.address,
        bankInfo.abi,
        provider.getSigner(i)
      );
      await protectedBankContract.deposit({ value: tenEthers });
    }
    const balance = (await protectedBankContract.vault()).toString();
    const balanceFornatted = Number(balance) / 1e18;
    expect(balanceFornatted).to.eql(30);
  }, 50000);
  it("Attempting to attack the ProtectedBank will reject!", async () => {
    const oneEther = ethers.utils.parseEther("1");
    await expect(
      secondThiefContract.steal({
        value: oneEther,
      })
    ).to.be.rejected;
    const balance = (await protectedBankContract.vault()).toString();
    const balanceFornatted = Number(balance) / 1e18;
    expect(balanceFornatted).to.eql(30);
  });
});
