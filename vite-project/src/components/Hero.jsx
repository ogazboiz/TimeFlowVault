import React, { useState, useEffect } from 'react';

const Hero = ({ onConnect, onManualConnect }) => {
  const [currentNetwork, setCurrentNetwork] = useState('');
  const [isLiskTestnet, setIsLiskTestnet] = useState(false);

  // Check current network
  useEffect(() => {
    const checkNetwork = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const isLisk = chainId.toLowerCase() === '0x106a'; // 4202 in hex, case-insensitive
          setIsLiskTestnet(isLisk);
          
          if (isLisk) {
            setCurrentNetwork('Lisk Testnet');
          } else {
            setCurrentNetwork(`Chain ID: ${parseInt(chainId, 16)}`);
          }
        } catch (error) {
          setCurrentNetwork('Unknown');
        }
      }
    };

    checkNetwork();

    // Listen for network changes
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('chainChanged', checkNetwork);
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.off('chainChanged', checkNetwork);
      }
    };
  }, []);

  return (
    <div className="text-center py-20">
      {/* Main Hero Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="text-6xl mb-6">🚀</div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            TimeFlowVault
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
          The future of money streaming meets DeFi staking. Create real-time payment streams 
          and earn rewards from a sustainable vault system.
        </p>
        
        <button
          onClick={onConnect}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
        >
          🚀 Launch App
        </button>
        
        {/* Manual Network Switch Button */}
        <div className="mt-4">
          <button
            onClick={() => {
              if (typeof window.ethereum !== 'undefined') {
                window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x106A', // 4202 in hex
                    chainName: 'Lisk Testnet',
                    nativeCurrency: {
                      name: 'ETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
                    blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
                  }],
                }).then(() => {
                  alert('Lisk Testnet added! Now click "Launch App" to connect.');
                }).catch((error) => {
                  if (error.code === 4001) {
                    alert('Network addition was rejected. Please manually add Lisk Testnet (Chain ID: 4202) to MetaMask.');
                  } else {
                    alert('Failed to add network. Please manually add Lisk Testnet (Chain ID: 4202) to MetaMask.');
                  }
                });
              } else {
                alert('Please install MetaMask first!');
              }
            }}
            className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            🔧 Add Lisk Testnet to MetaMask
          </button>
        </div>
        
        {/* Network Status */}
        {currentNetwork && (
          <div className="mt-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
              isLiskTestnet 
                ? 'bg-green-500/20 border-green-500/50 text-green-300' 
                : 'bg-red-500/20 border-red-500/50 text-red-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isLiskTestnet ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className="text-sm font-medium">
                Current Network: {currentNetwork}
              </span>
            </div>
            {!isLiskTestnet && (
              <p className="text-slate-400 text-sm mt-2">
                You need to be on Lisk Testnet (Chain ID: 4202) to use this dApp
              </p>
            )}
            {!isLiskTestnet && onManualConnect && (
              <div className="mt-4">
                <button
                  onClick={onManualConnect}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300"
                >
                  🔗 Connect Anyway (Manual Mode)
                </button>
                <p className="text-slate-400 text-xs mt-2">
                  Use this if you're sure you're on the right network
                </p>
              </div>
            )}
            
            {/* Faucet Information */}
            <div className="mt-4">
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 text-left">
                <h4 className="text-blue-300 font-semibold mb-2">💧 Need Test ETH?</h4>
                <p className="text-blue-200 text-sm mb-3">
                  Use the official Lisk faucet to get testnet ETH for free:
                </p>
                <div className="space-y-2">
                  <a
                    href="https://sepolia-faucet.lisk.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-300 text-sm"
                  >
                    🚰 Lisk Sepolia Faucet
                  </a>
                  <a
                    href="https://www.l2faucet.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-300 text-sm ml-2"
                  >
                    🌐 Alternative Faucet
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-sm rounded-3xl p-8 border border-blue-700/30 hover:border-blue-600/50 transition-all duration-300">
          <div className="text-4xl mb-4">🌊</div>
          <h3 className="text-xl font-bold text-white mb-3">Real-time Streaming</h3>
          <p className="text-slate-300">
            Money flows continuously, not in chunks. Perfect for subscriptions, salaries, and recurring payments.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-sm rounded-3xl p-8 border border-green-700/30 hover:border-green-600/50 transition-all duration-300">
          <div className="text-4xl mb-4">🏦</div>
          <h3 className="text-xl font-bold text-white mb-3">DeFi Vault</h3>
          <p className="text-slate-300">
            Stake your ETH and earn rewards from streaming fees. No lock-up periods, withdraw anytime.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-sm rounded-3xl p-8 border border-purple-700/30 hover:border-purple-600/50 transition-all duration-300">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-bold text-white mb-3">Sustainable Rewards</h3>
          <p className="text-slate-300">
            Rewards are funded by actual streaming fees, ensuring long-term sustainability.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/30 max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-white mb-6">Why Choose TimeFlowVault?</h2>
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">0.1% streaming fee (industry standard)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">Real-time reward calculations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">No minimum stake requirements</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">Instant withdrawals</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">Built on Lisk blockchain</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">Open source & audited</span>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">Perfect For</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/20 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/20 text-center">
            <div className="text-3xl mb-3">💼</div>
            <h4 className="text-lg font-semibold text-white mb-2">Businesses</h4>
            <p className="text-slate-400 text-sm">Payroll, vendor payments, subscriptions</p>
          </div>
          
          <div className="bg-slate-800/20 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/20 text-center">
            <div className="text-3xl mb-3">👥</div>
            <h4 className="text-lg font-semibold text-white mb-2">Teams</h4>
            <p className="text-slate-400 text-sm">Revenue sharing, project funding</p>
          </div>
          
          <div className="bg-slate-800/20 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/20 text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="text-lg font-semibold text-white mb-2">Creators</h4>
            <p className="text-slate-400 text-sm">Content monetization, fan support</p>
          </div>
          
          <div className="bg-slate-800/20 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/20 text-center">
            <div className="text-3xl mb-3">🏠</div>
            <h4 className="text-lg font-semibold text-white mb-2">Individuals</h4>
            <p className="text-slate-400 text-sm">Rent, utilities, loan payments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;


