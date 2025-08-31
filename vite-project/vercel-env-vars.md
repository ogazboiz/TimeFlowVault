# Vercel Environment Variables for TimeFlowVault

## Required Environment Variables

Add these environment variables in your Vercel project settings:

### Contract Configuration
```
VITE_CONTRACT_ADDRESS=0x189C49B169DE610994b7CB4A185907cf84933614
```

### Lisk Testnet Configuration
```
VITE_LISK_CHAIN_ID=0x106A
VITE_LISK_CHAIN_NAME=Lisk Sepolia Testnet
VITE_LISK_RPC_URL=https://rpc.sepolia-api.lisk.com
VITE_LISK_BLOCK_EXPLORER=https://sepolia-blockscout.lisk.com
```

### App Configuration
```
VITE_APP_NAME=TimeFlowVault
VITE_APP_DESCRIPTION=Money Streaming + DeFi Vault on Lisk Blockchain
VITE_APP_VERSION=1.0.0
```

## How to Add in Vercel:

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add each variable with:
   - **Name**: The variable name (e.g., `VITE_CONTRACT_ADDRESS`)
   - **Value**: The variable value
   - **Environment**: Select "Production" (and optionally "Preview" and "Development")
5. Click "Add" to save each variable

## Build Command
```
npm run build
```

## Output Directory
```
dist
```

## Install Command
```
npm install
```

## Framework Preset
```
Vite
```

## Node.js Version
```
18.x or 20.x
```
