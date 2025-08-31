require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    ethereum: {
      url: process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 1, // Ethereum Mainnet Chain ID
    },
    "ethereum-sepolia": {
      url: process.env.ETHEREUM_SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111, // Ethereum Sepolia Testnet Chain ID
    },
    lisk: {
      url: process.env.LISK_RPC_URL || "https://rpc.api.lisk.com",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 1135, // Lisk Mainnet Chain ID
      gasPrice: 1000000000, // 1 gwei
    },
    "lisk-testnet": {
      url: process.env.LISK_TESTNET_RPC_URL || "https://rpc.sepolia-api.lisk.com",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 4202, // Lisk Sepolia Testnet Chain ID
      gasPrice: 1000000000, // 1 gwei
    },
  },
  etherscan: {
    apiKey: {
      "lisk-testnet": "dummy", // Lisk doesn't require an API key
      "lisk": "dummy"
    },
    customChains: [
      {
        network: "lisk-testnet",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com"
        }
      },
      {
        network: "lisk",
        chainId: 1135,
        urls: {
          apiURL: "https://blockscout.lisk.com/api",
          browserURL: "https://blockscout.lisk.com"
        }
      }
    ]
  }
};