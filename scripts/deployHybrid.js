const hre = require("hardhat");

async function main() {
  console.log("Deploying TimeFlowVault hybrid contract...");
  
  // Deploy with initial parameters: vault name and reward rate (in basis points)
  const initialRewardRate = 15; // 0.15% per second for testing
  const vaultName = "TimeFlowVault Alpha";
  
  const timeFlowVault = await hre.ethers.deployContract("TimeFlowVault", [vaultName, initialRewardRate]);

  await timeFlowVault.waitForDeployment();

  console.log(
    `TimeFlowVault hybrid contract deployed to: ${timeFlowVault.target}`
  );
  console.log(`Vault Name: ${vaultName}`);
  console.log(`Initial Reward Rate: ${initialRewardRate / 100}% APY`);
  console.log("TimeFlowVault: Combining streaming + DeFi vault functionality");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
