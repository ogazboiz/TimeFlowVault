const hre = require("hardhat");

async function main() {
  console.log("Deploying TimeFlow contract...");
  
  const timeFlow = await hre.ethers.deployContract("TimeFlow");

  await timeFlow.waitForDeployment();

  console.log(
    `TimeFlow contract deployed to: ${timeFlow.target}`
  );
  console.log("TimeFlow: Real-time money streaming protocol");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});