import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const StakingInterface = ({ contract, account, onStakeChange }) => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [userStake, setUserStake] = useState(null);
  const [claimableRewards, setClaimableRewards] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Load user's stake information
  const loadUserStake = async () => {
    try {
      const stake = await contract.getUserStake(account);
      setUserStake({
        amount: ethers.formatEther(stake.amount),
        startTime: new Date(Number(stake.startTime) * 1000).toLocaleDateString(),
        lastClaimTime: new Date(Number(stake.lastClaimTime) * 1000).toLocaleDateString(),
        isActive: stake.isActive
      });

      if (stake.isActive) {
        const rewards = await contract.getClaimableRewards(account);
        setClaimableRewards(ethers.formatEther(rewards));
      }
    } catch (error) {
      console.error('Error loading user stake:', error);
    }
  };

  // Load data on mount and when account changes
  useEffect(() => {
    if (contract && account) {
      loadUserStake();
    }
  }, [contract, account]);

  // Stake ETH
  const handleStake = async (e) => {
    e.preventDefault();
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setStatus('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setStatus('Staking...');
    
    try {
      const amountWei = ethers.parseEther(stakeAmount);
      const tx = await contract.stake({ value: amountWei });
      await tx.wait();
      
      setStatus('Successfully staked!');
      setStakeAmount('');
      await loadUserStake();
      onStakeChange();
    } catch (error) {
      setStatus(`Staking failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Unstake ETH
  const handleUnstake = async (e) => {
    e.preventDefault();
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setStatus('Please enter a valid amount');
      return;
    }

    if (!userStake || !userStake.isActive) {
      setStatus('No active stake to unstake from');
      return;
    }

    if (parseFloat(unstakeAmount) > parseFloat(userStake.amount)) {
      setStatus('Cannot unstake more than staked amount');
      return;
    }

    setIsLoading(true);
    setStatus('Unstaking...');
    
    try {
      const amountWei = ethers.parseEther(unstakeAmount);
      const tx = await contract.unstake(amountWei);
      await tx.wait();
      
      setStatus('Successfully unstaked!');
      setUnstakeAmount('');
      await loadUserStake();
      onStakeChange();
    } catch (error) {
      setStatus(`Unstaking failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Claim rewards
  const handleClaimRewards = async () => {
    if (!userStake || !userStake.isActive) {
      setStatus('No active stake to claim rewards from');
      return;
    }

    if (parseFloat(claimableRewards) <= 0) {
      setStatus('No rewards to claim');
      return;
    }

    setIsLoading(true);
    setStatus('Claiming rewards...');
    
    try {
      const tx = await contract.claimRewards();
      await tx.wait();
      
      setStatus('Successfully claimed rewards!');
      await loadUserStake();
      onStakeChange();
    } catch (error) {
      setStatus(`Claiming rewards failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Stake Status */}
      <div className="bg-gradient-to-r from-emerald-900/50 to-green-900/50 backdrop-blur-sm rounded-3xl p-8 border border-emerald-700/50">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          🏦 Your Staking Status
        </h2>
        
        {userStake && userStake.isActive ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-emerald-300 mb-4">Stake Details</h3>
              <div className="space-y-3 text-slate-300">
                <div className="flex justify-between">
                  <span>Staked Amount:</span>
                  <span className="font-mono text-white">{userStake.amount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="text-white">{userStake.startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Claim:</span>
                  <span className="text-white">{userStake.lastClaimTime}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-yellow-300 mb-4">Rewards</h3>
              <div className="space-y-3 text-slate-300">
                <div className="flex justify-between">
                  <span>Claimable:</span>
                  <span className="font-mono text-yellow-300 text-xl">{claimableRewards} ETH</span>
                </div>
                <button
                  onClick={handleClaimRewards}
                  disabled={isLoading || parseFloat(claimableRewards) <= 0}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Claiming...' : '🎁 Claim Rewards'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💎</div>
            <h3 className="text-xl text-slate-300 mb-2">No Active Stake</h3>
            <p className="text-slate-400">Start staking to earn rewards from streaming fees!</p>
          </div>
        )}
      </div>

      {/* Staking Actions */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Stake Form */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-8 border border-blue-700/50">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            💰 Stake ETH
          </h2>
          
          <form onSubmit={handleStake} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Amount to Stake (ETH)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) <= 0}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Staking...' : '🚀 Stake ETH'}
            </button>
          </form>
        </div>

        {/* Unstake Form */}
        <div className="bg-gradient-to-r from-red-900/50 to-pink-900/50 backdrop-blur-sm rounded-3xl p-8 border border-red-700/50">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            📤 Unstake ETH
          </h2>
          
          <form onSubmit={handleUnstake} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Amount to Unstake (ETH)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={userStake?.amount || '0'}
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all duration-300"
                required
              />
              {userStake && (
                <p className="text-sm text-slate-400 mt-1">
                  Max: {userStake.amount} ETH
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !unstakeAmount || parseFloat(unstakeAmount) <= 0 || !userStake?.isActive}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Unstaking...' : '📤 Unstake ETH'}
            </button>
          </form>
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
          <p className="text-center text-slate-300">{status}</p>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30 text-center">
          <div className="text-3xl mb-2">💡</div>
          <h3 className="text-lg font-semibold text-white mb-2">How It Works</h3>
          <p className="text-slate-400 text-sm">
            Stake ETH to earn rewards from streaming fees. The more you stake, the more you earn!
          </p>
        </div>
        
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30 text-center">
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="text-lg font-semibold text-white mb-2">Instant Rewards</h3>
          <p className="text-slate-400 text-sm">
            Rewards are calculated in real-time and can be claimed anytime you have an active stake.
          </p>
        </div>
        
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30 text-center">
          <div className="text-3xl mb-2">🔒</div>
          <h3 className="text-lg font-semibold text-white mb-2">Safe & Secure</h3>
          <p className="text-slate-400 text-sm">
            Your staked ETH is always safe and can be unstaked at any time. No lock-up periods!
          </p>
        </div>
      </div>
    </div>
  );
};

export default StakingInterface;
