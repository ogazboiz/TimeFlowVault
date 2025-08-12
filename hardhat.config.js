require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    morphHolesky: {
      url: process.env.MORPH_RPC_URL || "https://rpc-testnet.morphl2.io",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 2810, // Morph Holesky Chain ID
    },
    "morph-testnet": {
      url: process.env.MORPH_RPC_URL || "https://rpc-testnet.morphl2.io",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 2810, // Morph Holesky Chain ID
    },
  },
};