import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const deployments = hre.deployments;
  const { deploy } = deployments;
  const { deployer } = await hre.getNamedAccounts();
  console.log("DEPLOYER");
  console.log(deployer);
  const bank = await deploy("Bank", {
    from: deployer,
    gasLimit: 500000,
  });
  const bankAddress = bank.address;

  await deploy("Thief", {
    from: deployer,
    gasLimit: 500000,
    args: [bankAddress],
  });
};
export default func;
