const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying TimeFlowVault to Lisk Network...");
  
  // Deploy with initial parameters: vault name and reward rate (in basis points)
  const initialRewardRate = 15; // 0.15% per second for testing
  const vaultName = "TimeFlowVault on Lisk";
  
  console.log(`📝 Vault Name: ${vaultName}`);
  console.log(`💰 Initial Reward Rate: ${initialRewardRate / 100}% per second`);
  console.log(`🌐 Network: ${hre.network.name}`);
  
  const timeFlowVault = await hre.ethers.deployContract("TimeFlowVault", [vaultName, initialRewardRate]);

  console.log("⏳ Waiting for deployment confirmation...");
  await timeFlowVault.waitForDeployment();

  const contractAddress = await timeFlowVault.getAddress();
  
  console.log("✅ TimeFlowVault successfully deployed!");
  console.log("=".repeat(60));
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`📝 Vault Name: ${vaultName}`);
  console.log(`💰 Initial Reward Rate: ${initialRewardRate / 100}% per second`);
  console.log(`🌐 Network: ${hre.network.name}`);
  console.log(`🔗 Explorer: https://sepolia-blockscout.lisk.com/address/${contractAddress}`);
  console.log("=".repeat(60));
  
  // Verify the contract on Lisk explorer (if supported)
  if (hre.network.name === "lisk" || hre.network.name === "lisk-testnet") {
    console.log("🔍 Verifying contract on Lisk explorer...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [vaultName, initialRewardRate],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("⚠️  Contract verification failed:", error.message);
    }
  }
  
  console.log("\n🎉 Deployment complete! Your TimeFlowVault is now live on Lisk!");
  console.log("💡 Next steps:");
  console.log("   1. Update your frontend with the contract address");
  console.log("   2. Test the streaming and staking functionality");
  console.log("   3. Share your dApp with the community!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
