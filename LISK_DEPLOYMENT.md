# 🚀 Lisk Deployment Guide for TimeFlowVault

This guide will walk you through deploying TimeFlowVault to the Lisk blockchain network.

## 🌐 Lisk Network Information

### Testnet
- **Network Name**: Lisk Testnet
- **Chain ID**: 1890
- **RPC URL**: `https://testnet-rpc.lisk.com`
- **Currency**: LSK (testnet tokens)
- **Block Explorer**: `https://testnet-explorer.lisk.com`

### Mainnet
- **Network Name**: Lisk Mainnet
- **Chain ID**: 1891
- **RPC URL**: `https://rpc.lisk.com`
- **Currency**: LSK
- **Block Explorer**: `https://explorer.lisk.com`

## 🔧 Prerequisites

1. **Lisk Wallet**: Install Lisk Desktop or use Lisk Mobile
2. **Testnet LSK**: Get testnet tokens from Lisk faucet
3. **Private Key**: Export your private key from Lisk wallet
4. **Environment Setup**: Configure your development environment

## 📋 Step-by-Step Deployment

### 1. Environment Configuration

Create a `.env` file in your project root:

```env
# Lisk Networks
LISK_RPC_URL=https://rpc.lisk.com
LISK_TESTNET_RPC_URL=https://testnet-rpc.lisk.com

# Your Private Key (keep this secret!)
PRIVATE_KEY=your_lisk_private_key_here

# Optional: Ethereum networks for comparison
ETHEREUM_RPC_URL=https://eth.llamarpc.com
ETHEREUM_SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

### 2. Get Testnet Tokens

For testnet deployment, you'll need testnet LSK tokens:

1. Visit the Lisk testnet faucet
2. Enter your Lisk address
3. Request testnet tokens
4. Wait for confirmation

### 3. Deploy to Testnet (Recommended First)

```bash
# Deploy to Lisk testnet
npx hardhat run scripts/deployLisk.js --network lisk-testnet
```

**Expected Output:**
```
🚀 Deploying TimeFlowVault to Lisk Network...
📝 Vault Name: TimeFlowVault on Lisk
💰 Initial Reward Rate: 0.15% per second
🌐 Network: lisk-testnet
⏳ Waiting for deployment confirmation...
✅ TimeFlowVault successfully deployed!
============================================================
📍 Contract Address: 0x...
📝 Vault Name: TimeFlowVault on Lisk
💰 Initial Reward Rate: 0.15% per second
🌐 Network: lisk-testnet
============================================================
```

### 4. Deploy to Mainnet

**⚠️ IMPORTANT**: Only deploy to mainnet after thorough testing on testnet!

```bash
# Deploy to Lisk mainnet
npx hardhat run scripts/deployLisk.js --network lisk
```

### 5. Update Frontend Configuration

After successful deployment, update the contract address:

```javascript
// vite-project/src/contractInfo.js
export const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### 6. Verify Contract (Optional)

If Lisk supports contract verification:

```bash
npx hardhat verify --network lisk <contract-address> "TimeFlowVault on Lisk" 15
```

## 🔍 Verification Steps

### 1. Check Contract Deployment
- Visit Lisk explorer
- Search for your contract address
- Verify contract code and transactions

### 2. Test Basic Functions
```bash
# Test contract interaction
npx hardhat console --network lisk-testnet

# Get contract instance
const TimeFlowVault = await ethers.getContractFactory("TimeFlowVault");
const vault = TimeFlowVault.attach("YOUR_CONTRACT_ADDRESS");

# Check basic info
await vault.vaultName();
await vault.rewardRate();
await vault.totalStaked();
```

### 3. Test Frontend Integration
```bash
cd vite-project
npm run dev
```

- Connect your Lisk wallet
- Test streaming functionality
- Test staking functionality
- Verify fee collection

## 🚨 Common Issues & Solutions

### Issue: RPC Connection Failed
**Error**: `getaddrinfo ENOTFOUND testnet-rpc.lisk.com`

**Solution**: 
- Verify RPC URLs are correct
- Check network connectivity
- Use alternative RPC endpoints if available

### Issue: Insufficient Balance
**Error**: `insufficient funds for gas`

**Solution**:
- Ensure you have enough LSK for gas fees
- Get testnet tokens from faucet
- Check gas price configuration

### Issue: Contract Verification Failed
**Error**: `Contract verification failed`

**Solution**:
- Verify constructor parameters match deployment
- Check if Lisk supports contract verification
- Manually verify on explorer if needed

## 📊 Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Contract address recorded
- [ ] Frontend updated with new address
- [ ] Basic functionality tested
- [ ] Gas fees optimized
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team notified of deployment

## 🔒 Security Considerations

### Before Mainnet Deployment
1. **Code Audit**: Complete security audit
2. **Testnet Testing**: Thorough testing on testnet
3. **Gas Optimization**: Optimize contract gas usage
4. **Emergency Procedures**: Plan for emergency situations

### After Deployment
1. **Monitor Transactions**: Watch for unusual activity
2. **Regular Updates**: Keep contract and frontend updated
3. **Community Feedback**: Gather user feedback
4. **Security Monitoring**: Monitor for vulnerabilities

## 🌟 Lisk-Specific Features

### Advantages of Lisk
- **Scalability**: High transaction throughput
- **Interoperability**: Cross-chain capabilities
- **Developer Friendly**: JavaScript SDK available
- **Community**: Active developer community

### Integration Opportunities
- **Lisk SDK**: Build additional tools
- **Cross-chain**: Connect with other blockchains
- **DeFi Ecosystem**: Integrate with Lisk DeFi protocols
- **Mobile Apps**: Leverage Lisk Mobile capabilities

## 📞 Support Resources

### Lisk Documentation
- [Lisk Developer Hub](https://lisk.com/documentation/)
- [Lisk SDK Documentation](https://lisk.com/documentation/lisk-sdk/)
- [Lisk Explorer](https://explorer.lisk.com/)

### Community
- [Lisk Discord](https://discord.gg/lisk)
- [Lisk Forum](https://forum.lisk.com/)
- [Lisk GitHub](https://github.com/LiskHQ)

### Technical Support
- [Lisk Support Portal](https://support.lisk.com/)
- [Developer Documentation](https://lisk.com/documentation/)

## 🎯 Next Steps

After successful deployment:

1. **Marketing**: Announce your dApp to the Lisk community
2. **Integration**: Connect with other Lisk projects
3. **Analytics**: Monitor usage and performance
4. **Updates**: Plan future feature releases
5. **Partnerships**: Explore collaboration opportunities

---

**🚀 Happy Deploying on Lisk!**

*TimeFlowVault - Revolutionizing Money Streaming on Lisk Blockchain*
