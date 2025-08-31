import React from 'react';

const VaultStats = ({ stats, onRefresh }) => {
  return (
    <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">📊 Vault Statistics</h2>
        <p className="text-slate-400">Real-time data from the TimeFlowVault</p>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6">
        {/* Total Staked */}
        <div className="bg-slate-800/30 rounded-2xl p-6 text-center border border-slate-700/30">
          <div className="text-3xl mb-2">💎</div>
          <div className="text-2xl font-bold text-white mb-1">{stats.totalStaked}</div>
          <div className="text-slate-400 text-sm">Total Staked ETH</div>
        </div>

        {/* Rewards Available */}
        <div className="bg-slate-800/30 rounded-2xl p-6 text-center border border-slate-700/30">
          <div className="text-3xl mb-2">🎁</div>
          <div className="text-2xl font-bold text-white mb-1">{stats.totalRewardsAvailable}</div>
          <div className="text-slate-400 text-sm">Rewards Available</div>
        </div>

        {/* Reward Rate */}
        <div className="bg-slate-800/30 rounded-2xl p-6 text-center border border-slate-700/30">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-white mb-1">{stats.rewardRate}%</div>
          <div className="text-slate-400 text-sm">Reward Rate per Second</div>
        </div>

        {/* Fees Collected */}
        <div className="bg-slate-800/30 rounded-2xl p-6 text-center border border-slate-700/30">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-white mb-1">{stats.totalFeesCollected}</div>
          <div className="text-slate-400 text-sm">Total Fees Collected</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 text-center">
        <button
          onClick={onRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors inline-flex items-center gap-2"
        >
          🔄 Refresh Stats
        </button>
      </div>

      {/* Info Cards */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-slate-800/20 rounded-2xl p-6 text-center border border-slate-700/20">
          <div className="text-2xl mb-2">🌊</div>
          <h3 className="text-lg font-semibold text-white mb-2">Streaming Fee</h3>
          <p className="text-slate-400 text-sm">Only 0.1% fee on all streams</p>
        </div>
        
        <div className="bg-slate-800/20 rounded-2xl p-6 text-center border border-slate-700/20">
          <div className="text-2xl mb-2">🔒</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Lock-up</h3>
          <p className="text-slate-400 text-sm">Stake and unstake anytime</p>
        </div>
        
        <div className="bg-slate-800/20 rounded-2xl p-6 text-center border border-slate-700/20">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="text-lg font-semibold text-white mb-2">Real-time</h3>
          <p className="text-slate-400 text-sm">Rewards calculated per second</p>
        </div>
      </div>
    </div>
  );
};

export default VaultStats;
