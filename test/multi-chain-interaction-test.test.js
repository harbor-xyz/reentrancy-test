const Harbor = require("@beam-me-up/harbor");
const hre = require("hardhat");
const { expect } = require("chai");
const { TIMEOUT } = require("dns");
const { ethers } = require("ethers");

function generateRandomTestnetName() {
  return `testnet-${Math.floor(Math.random() * 1000)}`;
}

describe(
  "Single chain, multiple deploy scripts",
  () => {
    let harbor;
    let testnet;
    let chains;
    let accounts;
    let ethereum;
    let provider;
    let bankContract;
    let bankInfo;
    let thiefContract;
    let signers;

    const testnetName = generateRandomTestnetName();
    const TIMEOUT = 30000000;

    beforeAll(async () => {
      // initialize harbor and testnet variables here so that they are usable in every test
      harbor = new Harbor({
        userKey: "cFeJWnDwQFVTSF2AabJmW5",
        projectKey: "fPMeKGPUfyBTCoqtXmv3G4",
        baseUrl: "https://develop-api.tech.goharbor.com",
      });
      await harbor.authenticate();
      signers = await hre.ethers.getSigners();
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
        generateRandomTestnetName()
      );
      chains = await testnet.chains();
      ethereum = chains[0];
      accounts = await ethereum.accounts();
      provider = ethers.getDefaultProvider(ethereum.endpoint);
      for (i = 0; i < accounts.length; i++) {
        if (accounts[i].type == "contract") {
          if (accounts[i].name == "Thief") {
            thiefContract = new ethers.Contract(
              accounts[i].address,
              accounts[i].abi,
              provider.getSigner(0)
            );
          } else if ((accounts[i].name = "Bank")) {
            bankInfo = {
              address: accounts[i].address,
              abi: accounts[i].abi,
            };
          }
        }
      }
    }, TIMEOUT);
    it(
      "Expects testnet to be RUNNING",
      async () => {
        expect(testnet.status).to.eql("RUNNING");
      },
      TIMEOUT
    );
    it(
      "Deposits 10 ETH into the bank vault from 3 different users",
      async () => {
        const tenEthers = ethers.utils.parseEther("10");
        let totalFunds = 0;
        for (let i = 0; i < 3; i++) {
          bankContract = new ethers.Contract(
            bankInfo.address,
            bankInfo.abi,
            provider.getSigner(i)
          );
          await bankContract.deposit({ value: tenEthers });
          const address = signers[i].address;
          const userBalance = (await bankContract.balances(address)).toString();
          const userBalanceFormatted = Number(userBalance) / 1e18;
          totalFunds += userBalanceFormatted;
        }
        const balance = (await bankContract.vault()).toString();
        const balanceFornatted = Number(balance) / 1e18;
        console.log(balanceFornatted);
        console.log(totalFunds);
        expect(totalFunds).to.eql(balanceFornatted);
      },
      TIMEOUT
    );
    it("Attacks the bank until the vault is zero", async () => {
      const bankVaultBalanceBefore = Number(
        (await bankContract.vault()).toString()
      );
      const oneEther = ethers.utils.parseEther("1");
      // the gas amount is overkill but we do this to ensure that the tx has enough gas to go through many recursions
      const gas = ethers.utils.parseEther("10");
      await thiefContract.steal({
        value: oneEther,
      });
      const bankVaultBalance = Number((await bankContract.vault()).toString());
      console.log("bank balance before: ", bankVaultBalanceBefore);
      console.log("bank balance after: ", bankVaultBalance);
      expect(bankVaultBalance).to.eql(0);
    });
    afterAll(async () => {
      await harbor.stop(testnetName);
    });
  },
  TIMEOUT
);
