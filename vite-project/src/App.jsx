import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Header from './components/Header';
import Hero from './components/Hero';
import CreateStreamForm from './components/CreateStreamForm';
import StreamList from './components/StreamList';
import StakingInterface from './components/StakingInterface';
import VaultStats from './components/VaultStats';
import './index.css';

import { contractAddress, contractABI } from './contractInfo.js';

// Contract configuration
const CONTRACT_ADDRESS = contractAddress;
const CONTRACT_ABI = contractABI;

// Lisk Testnet configuration
const LISK_TESTNET = {
  chainId: '0x106A',
  chainName: 'Lisk Sepolia Testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://rpc.sepolia-api.lisk.com', // Primary - working endpoint
    'https://lisk-sepolia.drpc.org',   // Backup - working endpoint
  ],
  blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
};

function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('streaming'); // 'streaming' or 'staking'
  const [vaultStats, setVaultStats] = useState({
    totalStaked: '0',
    totalRewardsAvailable: '0',
    rewardRate: '0',
    totalFeesCollected: '0'
  });

  // Switch to Lisk Testnet
  const switchToLiskTestnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: LISK_TESTNET.chainId }],
      });
      
      // Wait a bit for the network change to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the switch worked
      const newChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (newChainId !== LISK_TESTNET.chainId) {
        throw new Error('Network switch failed - please try again');
      }
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [LISK_TESTNET],
          });
          
          // Wait a bit for the network addition to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verify the addition worked
          const newChainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (newChainId !== LISK_TESTNET.chainId) {
            throw new Error('Network addition failed - please try again');
          }
        } catch (addError) {
          console.error('Error adding Lisk testnet:', addError);
          throw new Error('Failed to add Lisk testnet to MetaMask');
        }
      } else if (switchError.code === 4001) {
        // User rejected the network switch
        throw new Error('Network switch was rejected. Please manually switch to Lisk Testnet (Chain ID: 4202)');
      } else {
        throw switchError;
      }
    }
  };

  // Check if user is on correct network
  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current chain ID:', chainId, 'Expected:', LISK_TESTNET.chainId);
      console.log('Chain ID comparison:', chainId === LISK_TESTNET.chainId);
      
      // Handle different chain ID formats
      const currentChainId = chainId.toLowerCase();
      const expectedChainId = LISK_TESTNET.chainId.toLowerCase();
      const isCorrectNetwork = currentChainId === expectedChainId;
      
      console.log('Formatted comparison:', currentChainId, '===', expectedChainId, '=', isCorrectNetwork);
      
      if (!isCorrectNetwork) {
        console.log('Switching to Lisk testnet...');
        await switchToLiskTestnet();
        console.log('Successfully switched to Lisk testnet');
      } else {
        console.log('Already on Lisk testnet');
      }
    } catch (error) {
      console.error('Error checking/switching network:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  };

  // Manual network switch function
  const manualSwitchToLisk = async () => {
    try {
      await switchToLiskTestnet();
      alert('Successfully switched to Lisk Testnet! You can now connect your wallet.');
    } catch (error) {
      alert(`Failed to switch network: ${error.message}`);
    }
  };

  // Manual network switch without automatic switching
  const manualConnectToLisk = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Ensure the contract has the signer and provider attached
        contract.signer = signer;
        contract.provider = provider;
        
        console.log('Contract created:', contract);
        console.log('Contract signer:', signer);
        console.log('Contract provider:', provider);
        console.log('Contract address:', CONTRACT_ADDRESS);
        console.log('Contract has signer:', !!contract.signer);
        console.log('Contract has provider:', !!contract.provider);
        console.log('Contract signer attached:', contract.signer === signer);
        console.log('Contract provider attached:', contract.provider === provider);
        
        setAccount(accounts[0]);
        setProvider(provider);
        setContract(contract);
        setIsConnected(true);
        
        // Test balance loading immediately
        try {
          const testAddress = await signer.getAddress();
          const testBalance = await provider.getBalance(testAddress);
          console.log('✅ Balance test successful:');
          console.log('  Address:', testAddress);
          console.log('  Balance (wei):', testBalance.toString());
          console.log('  Balance (ETH):', ethers.formatEther(testBalance));
        } catch (error) {
          console.error('❌ Balance test failed:', error);
        }
        
        // Load initial data
        loadVaultStats(contract);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert(error.message || 'Failed to connect wallet');
    }
  };

  // Debug function to check current network
  const debugNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkId = await window.ethereum.request({ method: 'net_version' });
      console.log('Debug Network Info:');
      console.log('Chain ID (hex):', chainId);
      console.log('Chain ID (decimal):', parseInt(chainId, 16));
      console.log('Network ID:', networkId);
      console.log('Expected Chain ID:', LISK_TESTNET.chainId);
      console.log('Expected Chain ID (decimal):', parseInt(LISK_TESTNET.chainId, 16));
      console.log('Match:', chainId === LISK_TESTNET.chainId);
      
      alert(`Current Network:\nChain ID: ${chainId} (${parseInt(chainId, 16)})\nExpected: ${LISK_TESTNET.chainId} (4202)\nMatch: ${chainId === LISK_TESTNET.chainId ? 'Yes' : 'No'}`);
    } catch (error) {
      console.error('Error debugging network:', error);
      alert('Error checking network status');
    }
  };

  // Debug RPC endpoints
  const debugRPC = async () => {
    try {
      await testRPCEndpoints();
      alert('RPC endpoint test completed. Check console for results.');
    } catch (error) {
      console.error('Error testing RPC endpoints:', error);
      alert('Error testing RPC endpoints');
    }
  };

  // Check for wallet extension conflicts
  const checkWalletConflicts = () => {
    const conflicts = [];
    
    // Check for multiple ethereum providers
    if (window.ethereum?.providers && window.ethereum.providers.length > 1) {
      conflicts.push(`Multiple wallet providers detected: ${window.ethereum.providers.length}`);
    }
    
    // Check for common conflicting extensions
    if (window.ethereum && !window.ethereum.isMetaMask) {
      conflicts.push('Non-MetaMask provider detected');
    }
    
    // Check for specific conflicting extensions
    if (window.ethereum && window.ethereum.isBraveWallet) {
      conflicts.push('Brave Wallet detected (may conflict with MetaMask)');
    }
    
    if (window.ethereum && window.ethereum.isCoinbaseWallet) {
      conflicts.push('Coinbase Wallet detected (may conflict with MetaMask)');
    }
    
    if (window.ethereum && window.ethereum.isTokenPocket) {
      conflicts.push('TokenPocket detected (may conflict with MetaMask)');
    }
    
    return conflicts;
  };

  // Help users resolve wallet conflicts
  const resolveWalletConflicts = () => {
    const conflicts = checkWalletConflicts();
    
    if (conflicts.length === 0) {
      alert('No wallet conflicts detected!');
      return;
    }
    
    const conflictList = conflicts.join('\n• ');
    const message = `Wallet Extension Conflicts Detected:\n\n• ${conflictList}\n\nTo resolve:\n1. Disable other Ethereum wallet extensions\n2. Keep only MetaMask enabled\n3. Refresh this page\n4. Try connecting again`;
    
    alert(message);
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Check for multiple providers
        const providers = [];
        if (window.ethereum) providers.push('MetaMask');
        if (window.ethereum?.providers) {
          window.ethereum.providers.forEach((provider, index) => {
            if (provider.isMetaMask) providers.push(`MetaMask ${index + 1}`);
            else providers.push(`Provider ${index + 1}`);
          });
        }
        
        if (providers.length > 1) {
          console.log('Multiple wallet providers detected:', providers);
        }
        
        // First switch to Lisk testnet
        await checkNetwork();
        
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Ensure the contract has the signer and provider attached
        contract.signer = signer;
        contract.provider = provider;
        
        setAccount(accounts[0]);
        setProvider(provider);
        setContract(contract);
        setIsConnected(true);
        
        // Test balance loading immediately
        try {
          const testAddress = await signer.getAddress();
          const testBalance = await provider.getBalance(testAddress);
          console.log('✅ Balance test successful:');
          console.log('  Address:', testAddress);
          console.log('  Balance (wei):', testBalance.toString());
          console.log('  Balance (ETH):', ethers.formatEther(testBalance));
        } catch (error) {
          console.error('❌ Balance test failed:', error);
        }
        
        // Load initial data
        loadVaultStats(contract);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      // Handle RPC errors specifically
      const errorMessage = handleRPCError(error);
      
      // Provide specific guidance for common errors
      if (errorMessage.includes('Multiple wallet providers')) {
        alert('Multiple wallet extensions detected. Please disable other Ethereum wallet extensions and keep only MetaMask.');
      } else if (errorMessage.includes('ethereum')) {
        alert('Wallet extension conflict detected. Please refresh the page and try again, or disable other wallet extensions.');
      } else if (errorMessage.includes('RPC')) {
        alert(errorMessage);
      } else {
        alert(errorMessage || 'Failed to connect wallet');
      }
    }
  };

  // Load vault statistics
  const loadVaultStats = async (contractInstance) => {
    try {
      const [totalStaked, totalRewardsAvailable, rewardRate, feeInfo] = await Promise.all([
        contractInstance.totalStaked(),
        contractInstance.totalRewardsAvailable(),
        contractInstance.rewardRate(),
        contractInstance.getFeeInfo()
      ]);

      setVaultStats({
        totalStaked: ethers.formatEther(totalStaked),
        totalRewardsAvailable: ethers.formatEther(totalRewardsAvailable),
        rewardRate: rewardRate.toString(),
        totalFeesCollected: ethers.formatEther(feeInfo[1])
      });
    } catch (error) {
      console.error('Error loading vault stats:', error);
      
      // Handle RPC errors specifically
      if (error.message.includes('RPC') || error.message.includes('Internal JSON-RPC')) {
        console.log('RPC error detected in vault stats loading');
        // Test RPC endpoints
        testRPCEndpoints();
      }
      
      // Set default values on error
      setVaultStats({
        totalStaked: '0',
        totalRewardsAvailable: '0',
        rewardRate: '0',
        totalFeesCollected: '0'
      });
    }
  };

  // Refresh vault stats
  const refreshVaultStats = () => {
    if (contract) {
      loadVaultStats(contract);
    }
  };

  // Load user balance - can be called from components
  const loadUserBalance = async () => {
    if (provider && account) {
      try {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        const balanceEth = ethers.formatEther(balance);
        console.log('App.jsx - Balance loaded:', balanceEth, 'ETH for address:', address);
        return balanceEth;
      } catch (error) {
        console.error('App.jsx - Error loading balance:', error);
        return '0';
      }
    }
    return '0';
  };

  // Recreate contract if signer is missing
  const recreateContract = async () => {
    if (provider && account) {
      try {
        console.log('Recreating contract...');
        const signer = await provider.getSigner();
        const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Ensure the contract has the signer and provider attached
        newContract.signer = signer;
        newContract.provider = provider;
        
        console.log('New contract created:', newContract);
        console.log('New contract has signer:', !!newContract.signer);
        console.log('New contract has provider:', !!newContract.provider);
        console.log('New contract signer attached:', newContract.signer === signer);
        console.log('New contract provider attached:', newContract.provider === provider);
        
        setContract(newContract);
        return newContract;
      } catch (error) {
        console.error('Error recreating contract:', error);
        return null;
      }
    }
    return null;
  };

  // Handle account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setAccount('');
          setIsConnected(false);
          setProvider(null);
          setContract(null);
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Chain changed to:', chainId);
        setAccount('');
        setIsConnected(false);
        setProvider(null);
        setContract(null);
      });
    }
  }, []);

  // Debug contract state changes
  useEffect(() => {
    console.log('Contract state changed:', {
      contract: contract ? 'exists' : 'null',
      signer: contract?.signer ? 'exists' : 'null',
      provider: contract?.provider ? 'exists' : 'null',
      account: account || 'none'
    });
  }, [contract, account]);

  // Test RPC endpoints
  const testRPCEndpoints = async () => {
    const endpoints = [
      'https://rpc.sepolia-api.lisk.com',
      'https://rpc.sepolia.lisk.com',
      'https://lisk-sepolia.publicnode.com',
      'https://lisk-sepolia.drpc.org'
    ];
    
    console.log('Testing RPC endpoints...');
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_chainId',
            params: [],
            id: 1
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint} - Chain ID: ${data.result}`);
        } else {
          console.log(`❌ ${endpoint} - HTTP ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Error: ${error.message}`);
      }
    }
  };

  // Enhanced error handling for RPC issues
  const handleRPCError = (error) => {
    if (error.message.includes('RPC') || error.message.includes('Internal JSON-RPC')) {
      console.error('RPC Error detected:', error);
      
      // Test RPC endpoints
      testRPCEndpoints();
      
      return 'RPC connection error. The Lisk testnet might be experiencing issues. Please try again in a few minutes.';
    }
    
    return error.message;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {console.log('App rendering with:', { isConnected, account, contract: !!contract, activeTab })}
      <Header 
        account={account} 
        isConnected={isConnected} 
        onConnect={connectWallet}
        onDebugNetwork={debugNetwork}
        onResolveConflicts={resolveWalletConflicts}
        onDebugRPC={debugRPC}
      />
      
      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <Hero 
            onConnect={connectWallet} 
            onManualConnect={manualConnectToLisk}
          />
        ) : !contract ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-white mb-4">Connecting to Contract...</h2>
            <p className="text-slate-400">Please wait while we establish the connection.</p>
            <div className="mt-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <p className="text-slate-300 text-sm">Debug: Account connected but contract not ready</p>
              <p className="text-slate-400 text-xs">Account: {account}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Debug Info */}
            <div className="bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-700/50">
              <h3 className="text-white font-medium mb-2">🔍 Debug Info</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                <div>Account: {account || 'None'}</div>
                <div>Contract: {contract ? '✅ Connected' : '❌ Not Connected'}</div>
                <div>Active Tab: {activeTab}</div>
                <div>Vault Stats: {vaultStats ? '✅ Loaded' : '❌ Not Loaded'}</div>
              </div>
            </div>
            
            {/* Vault Statistics */}
            <VaultStats 
              stats={vaultStats} 
              onRefresh={refreshVaultStats}
            />
            
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-2 border border-slate-700/50">
                <button
                  onClick={() => setActiveTab('streaming')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'streaming'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  💰 Money Streaming
                </button>
                <button
                  onClick={() => setActiveTab('staking')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'staking'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  🏦 Staking & Rewards
                </button>
              </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'streaming' ? (
              <div className="space-y-8">
                <CreateStreamForm 
                  contract={contract} 
                  onStreamCreated={() => loadVaultStats(contract)}
                  onLoadBalance={loadUserBalance}
                  onRecreateContract={recreateContract}
                />
                <StreamList 
                  contract={contract} 
                  account={account}
                />
              </div>
            ) : (
              <StakingInterface 
                contract={contract} 
                account={account}
                onStakeChange={() => loadVaultStats(contract)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-400 border-t border-slate-800/50">
        <p>🚀 TimeFlowVault - The Future of Money Streaming & DeFi</p>
        <p className="text-sm mt-2">Built on Lisk Blockchain</p>
      </footer>
    </div>
  );
}

export default App;