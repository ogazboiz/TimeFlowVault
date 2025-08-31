import React, { useState, useEffect } from 'react';

const Header = ({ account, isConnected, onConnect, onDebugNetwork, onResolveConflicts, onDebugRPC }) => {
  const [currentNetwork, setCurrentNetwork] = useState('');
  const [isLiskTestnet, setIsLiskTestnet] = useState(false);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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
          console.error('Error checking network:', error);
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
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="text-3xl">🚀</div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                TimeFlowVault
              </h1>
              <p className="text-xs text-slate-400">Money Streaming + DeFi Vault</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#streaming" className="text-slate-300 hover:text-white transition-colors duration-300">
              🌊 Streaming
            </a>
            <a href="#staking" className="text-slate-300 hover:text-white transition-colors duration-300">
              🏦 Staking
            </a>
            <a href="#about" className="text-slate-300 hover:text-white transition-colors duration-300">
              ℹ️ About
            </a>
          </nav>

          {/* Connect Button / Account Info */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-3">
                {/* Network Indicator */}
                <div className={`rounded-full px-3 py-1 border ${
                  isLiskTestnet 
                    ? 'bg-green-500/20 border-green-500/50' 
                    : 'bg-red-500/20 border-red-500/50'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isLiskTestnet ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                </div>
                
                {/* Network Name */}
                <div className="hidden sm:block">
                  <p className={`text-sm ${isLiskTestnet ? 'text-green-300' : 'text-red-300'}`}>
                    {currentNetwork}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">{formatAddress(account)}</p>
                </div>
                
                {/* Switch Network Button */}
                <button
                  onClick={onConnect}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl transition-colors duration-300 text-sm"
                >
                  {isLiskTestnet ? 'Switch' : 'Fix Network'}
                </button>
                
                {/* Debug Network Button */}
                {onDebugNetwork && (
                  <button
                    onClick={onDebugNetwork}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-xl transition-colors duration-300 text-sm"
                    title="Debug Network Status"
                  >
                    🔍
                  </button>
                )}
                
                {/* Resolve Conflicts Button */}
                {onResolveConflicts && (
                  <button
                    onClick={onResolveConflicts}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl transition-colors duration-300 text-sm"
                    title="Resolve Wallet Conflicts"
                  >
                    ⚠️
                  </button>
                )}
                
                {/* Debug RPC Button */}
                {onDebugRPC && (
                  <button
                    onClick={onDebugRPC}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl transition-colors duration-300 text-sm"
                    title="Test RPC Endpoints"
                  >
                    🌐
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
              >
                <span>🔗</span>
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


