const hre = require("hardhat");

async function main() {
  console.log("Deploying MorphStream contract...");
  const morphStream = await hre.ethers.deployContract("MorphStream");

  await morphStream.waitForDeployment();

  console.log(
    `MorphStream contract deployed to: ${morphStream.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});