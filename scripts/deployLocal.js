const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying TimeFlowVault to Local Network...");
  
  // Deploy with initial parameters: vault name and reward rate (in basis points)
  const initialRewardRate = 15; // 0.15% per second for testing
  const vaultName = "TimeFlowVault Local";
  
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
  console.log("=".repeat(60));
  
  console.log("\n🎉 Deployment complete! Your TimeFlowVault is now live!");
  console.log("💡 Next steps:");
  console.log("   1. Copy the contract address above");
  console.log("   2. Update vite-project/src/contractInfo.js with the address");
  console.log("   3. Start the frontend with: cd vite-project && npm run dev");
  console.log("   4. Test the streaming and staking functionality");
  
  // Save the contract address to a file for easy access
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: contractAddress,
    vaultName: vaultName,
    initialRewardRate: initialRewardRate,
    network: hre.network.name,
    deploymentTime: new Date().toISOString()
  };
  
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📁 Deployment info saved to deployment-info.json");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
