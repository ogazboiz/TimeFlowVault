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
    'https://rpc.sepolia-api.lisk.com',
    'https://lisk-sepolia.drpc.org',
  ],
  blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
};

// About Component
const About = () => {
  return (
    <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">🚀 About TimeFlowVault</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-blue-400 mb-3">💡 What is TimeFlowVault?</h3>
            <p className="text-slate-300 leading-relaxed">
              TimeFlowVault is a revolutionary DeFi platform that combines money streaming with staking rewards. 
              It allows users to create time-based payment streams while earning passive income through staking.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-3">🌊 Money Streaming</h3>
            <p className="text-slate-300 leading-relaxed">
              Create automated payment streams that send money over time. Perfect for subscriptions, 
              salaries, or any recurring payment needs. Set duration and amount, and let the blockchain handle the rest.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-purple-400 mb-3">🏦 Staking & Rewards</h3>
            <p className="text-slate-300 leading-relaxed">
              Stake your tokens to earn rewards. The longer you stake, the more you earn. 
              Our innovative reward system ensures fair distribution and sustainable yields.
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-3">🔒 Security Features</h3>
            <ul className="text-slate-300 space-y-2">
              <li>• Smart contract audited and tested</li>
              <li>• Reentrancy protection</li>
              <li>• Emergency pause functionality</li>
              <li>• Ownership controls</li>
              <li>• Built on Lisk blockchain</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-pink-400 mb-3">⚡ Key Benefits</h3>
            <ul className="text-slate-300 space-y-2">
              <li>• Automated payments</li>
              <li>• Passive income generation</li>
              <li>• Transparent fee structure</li>
              <li>• Real-time statistics</li>
              <li>• User-friendly interface</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">🌐 Built on Lisk</h3>
            <p className="text-slate-300 leading-relaxed">
              Leveraging Lisk's high-performance blockchain for fast, secure, and cost-effective transactions. 
              Experience the future of DeFi with cutting-edge technology.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl">
          <span>🔗</span>
          <span>Contract: {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}</span>
        </div>
        <p className="text-slate-400 text-sm mt-2">
          View on <a href="https://sepolia-blockscout.lisk.com/address/0x189C49B169DE610994b7CB4A185907cf84933614" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 hover:text-blue-300 underline">
            Lisk Explorer
          </a>
        </p>
      </div>
    </div>
  );
};

function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('streaming');
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
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (newChainId !== LISK_TESTNET.chainId) {
        throw new Error('Network switch failed - please try again');
      }
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [LISK_TESTNET],
          });
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newChainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (newChainId !== LISK_TESTNET.chainId) {
            throw new Error('Network addition failed - please try again');
          }
        } catch (addError) {
          throw new Error('Failed to add Lisk testnet to MetaMask');
        }
      } else if (switchError.code === 4001) {
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
      
      const currentChainId = chainId.toLowerCase();
      const expectedChainId = LISK_TESTNET.chainId.toLowerCase();
      const isCorrectNetwork = currentChainId === expectedChainId;
      
      if (!isCorrectNetwork) {
        await switchToLiskTestnet();
      }
    } catch (error) {
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
        
        contract.signer = signer;
        contract.provider = provider;
        
        setAccount(accounts[0]);
        setProvider(provider);
        setContract(contract);
        setIsConnected(true);
        
        loadVaultStats(contract);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      alert(error.message || 'Failed to connect wallet');
    }
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await checkNetwork();
        
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        contract.signer = signer;
        contract.provider = provider;
        
        setAccount(accounts[0]);
        setProvider(provider);
        setContract(contract);
        setIsConnected(true);
        
        loadVaultStats(contract);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      alert(error.message || 'Failed to connect wallet');
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

  // Load user balance
  const loadUserBalance = async () => {
    if (provider && account) {
      try {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        const balanceEth = ethers.formatEther(balance);
        return balanceEth;
      } catch (error) {
        return '0';
      }
    }
    return '0';
  };

  // Recreate contract if signer is missing
  const recreateContract = async () => {
    if (provider && account) {
      try {
        const signer = await provider.getSigner();
        const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        newContract.signer = signer;
        newContract.provider = provider;
        
        setContract(newContract);
        return newContract;
      } catch (error) {
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
        setAccount('');
        setIsConnected(false);
        setProvider(null);
        setContract(null);
      });
    }
  }, []);

  // Handle navigation with smooth scrolling
  const handleNavigation = (tab) => {
    setActiveTab(tab);
    
    // Smooth scroll to top of main content
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header 
        account={account} 
        isConnected={isConnected} 
        onConnect={connectWallet}
        onNavigate={handleNavigation}
        activeTab={activeTab}
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
          </div>
        ) : (
          <>
            {/* Vault Statistics */}
            <VaultStats 
              stats={vaultStats} 
              onRefresh={refreshVaultStats}
            />
            
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-2 border border-slate-700/50">
                <button
                  onClick={() => handleNavigation('streaming')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'streaming'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  💰 Money Streaming
                </button>
                <button
                  onClick={() => handleNavigation('staking')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'staking'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  🏦 Staking & Rewards
                </button>
                <button
                  onClick={() => handleNavigation('about')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'about'
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  ℹ️ About
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
            ) : activeTab === 'staking' ? (
              <StakingInterface 
                contract={contract} 
                account={account}
                onStakeChange={() => loadVaultStats(contract)}
              />
            ) : (
              <About />
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