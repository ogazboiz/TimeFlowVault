// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TimeFlowVaultModule", (m) => {
  // Deploy with initial parameters: vault name and reward rate (in basis points)
  const initialRewardRate = 1500; // 15% APY (1500 basis points)
  const vaultName = "TimeFlowVault Alpha";
  
  const timeFlowVault = m.contract("TimeFlowVault", [vaultName, initialRewardRate]);

  return { timeFlowVault };
});
