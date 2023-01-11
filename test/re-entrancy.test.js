const Harbor = require("@harbor-xyz/harbor");
const hre = require("hardhat");
const { expect } = require("chai");
const { ethers } = require("ethers");

function generateRandomTestnetName() {
  return `testnet-${Math.floor(Math.random() * 100000)}`;
}
const TIMEOUT = 30000000;
describe(
  "Re-entrancy test",
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

    beforeAll(async () => {
      harbor = new Harbor({
        userKey: "9S7NYNRjgy6Xaw5eSdaGqg",
        projectKey: "519EJKbSH1ZX43rBCBX7Ef",
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
        testnetName
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
          } else if (accounts[i].name == "Bank") {
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
        expect(totalFunds).to.eql(balanceFornatted);
      },
      TIMEOUT
    );
    it(
      "Attacks the bank until the vault is zero",
      async () => {
        const oneEther = ethers.utils.parseEther("1");
        await thiefContract.steal({
          value: oneEther,
        });
        const bankVaultBalance = Number(
          (await bankContract.vault()).toString()
        );
        expect(bankVaultBalance).to.eql(0);
      },
      TIMEOUT
    );
  },
  TIMEOUT
);
