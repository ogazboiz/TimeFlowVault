import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import StreamCard from './StreamCard';

const StreamList = ({ contract, account }) => {
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  // Check claimable amount for a specific stream
  const checkClaimableAmount = async (streamId) => {
    if (!contract) return;
    
    try {
      setStatus('Checking claimable amount...');
      
      const [stream, contractClaimable] = await Promise.all([
        contract.getStream(streamId),
        contract.getClaimableBalance(streamId)
      ]);
      
      const claimableEth = ethers.formatEther(contractClaimable);
      const totalAmountEth = ethers.formatEther(stream.totalAmount);
      const withdrawnEth = ethers.formatEther(stream.amountWithdrawn);
      
      setStatus(`Stream ${streamId}: Total: ${totalAmountEth} ETH, Withdrawn: ${withdrawnEth} ETH, Claimable: ${claimableEth} ETH`);
      
      setTimeout(() => setStatus(''), 5000);
    } catch (error) {
      setStatus(`❌ Error checking claimable amount: ${error.message}`);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  // Load all streams
  const loadStreams = async () => {
    if (!contract) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const totalStreams = await contract.getTotalStreams();
      const streamPromises = [];
      
      for (let i = 0; i < totalStreams; i++) {
        streamPromises.push(contract.getStream(i));
        // Also get the actual claimable amount from the contract
        streamPromises.push(contract.getClaimableBalance(i));
      }
      
      const allResults = await Promise.all(streamPromises);
      const formattedStreams = [];
      
      for (let i = 0; i < totalStreams; i++) {
        const stream = allResults[i * 2]; // Stream data
        const contractClaimable = allResults[i * 2 + 1]; // Contract claimable amount
        
        try {
          // Get current blockchain time instead of client time
          const now = Math.floor(Date.now() / 1000); // Fallback to client time
          const startTime = Number(stream.startTime);
          const stopTime = Number(stream.stopTime);
          
          // Cap the current time to the stream's stop time (same logic as contract)
          const cappedNow = Math.min(now, stopTime);
          const elapsed = Math.max(0, cappedNow - startTime);
          
          const flowRateEth = parseFloat(ethers.formatEther(stream.flowRate));
          const streamedSoFar = elapsed * flowRateEth;
          const amountWithdrawnEth = parseFloat(ethers.formatEther(stream.amountWithdrawn));
          const frontendClaimable = Math.max(0, streamedSoFar - amountWithdrawnEth);
          
          // Use the contract's claimable amount as the source of truth
          const claimable = parseFloat(ethers.formatEther(contractClaimable));
          
          formattedStreams.push({
            id: i,
            sender: stream.sender,
            recipient: stream.recipient,
            amount: stream.totalAmount, // Keep as BigInt for StreamCard
            flowRate: stream.flowRate, // Keep as BigInt for StreamCard
            startTime: startTime,
            duration: stopTime - startTime,
            amountWithdrawn: stream.amountWithdrawn,
            claimableAmount: ethers.parseEther(claimable.toFixed(18)), // Use contract's claimable amount
            isActive: stream.isActive
          });
        } catch (streamError) {
          // Skip malformed streams
        }
      }
      
      setStreams(formattedStreams);
    } catch (error) {
      setError(error.message);
      setStatus('Error loading streams');
    } finally {
      setIsLoading(false);
    }
  };

  // Load streams on mount and when contract changes
  useEffect(() => {
    loadStreams();
  }, [contract]);

  // Withdraw from stream
  const handleWithdraw = async (streamId) => {
    if (!contract) return;
    
    try {
      setStatus('Withdrawing...');
      
      // First try to estimate gas
      let gasEstimate;
      try {
        gasEstimate = await contract.withdrawFromStream.estimateGas(streamId);
      } catch (gasError) {
        if (gasError.message.includes('RPC') || gasError.message.includes('Internal JSON-RPC')) {
          setStatus('❌ RPC Error: Network connection issue. Please try again in a few minutes.');
          return;
        } else if (gasError.message.includes('execution reverted')) {
          setStatus('❌ Transaction would revert. Stream may not have claimable funds.');
          return;
        } else {
          setStatus('❌ Gas estimation failed. Please try again.');
          return;
        }
      }
      
      // Add 20% buffer for gas
      const gasLimit = gasEstimate * 120n / 100n;
      
      const tx = await contract.withdrawFromStream(streamId, { gasLimit });
      await tx.wait();
      
      setStatus('✅ Withdrawal successful!');
      await loadStreams(); // Refresh streams
      
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      if (error.message.includes('user rejected')) {
        setStatus('❌ Transaction cancelled by user');
      } else if (error.message.includes('RPC') || error.message.includes('Internal JSON-RPC')) {
        setStatus('❌ RPC Error: Network connection issue. Please try again.');
      } else if (error.message.includes('execution reverted')) {
        setStatus('❌ Transaction reverted. Check if stream has claimable funds.');
      } else {
        setStatus(`❌ Withdrawal failed: ${error.message}`);
      }
    }
  };

  // Cancel stream
  const handleCancel = async (streamId) => {
    if (!contract) return;
    
    try {
      setStatus('Cancelling stream...');
      
      // First try to estimate gas
      let gasEstimate;
      try {
        gasEstimate = await contract.cancelStream.estimateGas(streamId);
      } catch (gasError) {
        if (gasError.message.includes('RPC') || gasError.message.includes('Internal JSON-RPC')) {
          setStatus('❌ RPC Error: Network connection issue. Please try again in a few minutes.');
          return;
        } else if (gasError.message.includes('execution reverted')) {
          setStatus('❌ Transaction would revert. Stream may not be cancellable.');
          return;
        } else {
          setStatus('❌ Gas estimation failed. Please try again.');
          return;
        }
      }
      
      // Add 20% buffer for gas
      const gasLimit = gasEstimate * 120n / 100n;
      
      const tx = await contract.cancelStream(streamId, { gasLimit });
      await tx.wait();
      
      setStatus('✅ Stream cancelled successfully!');
      await loadStreams(); // Refresh streams
      
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      if (error.message.includes('user rejected')) {
        setStatus('❌ Transaction cancelled by user');
      } else if (error.message.includes('RPC') || error.message.includes('Internal JSON-RPC')) {
        setStatus('❌ RPC Error: Network connection issue. Please try again.');
      } else if (error.message.includes('execution reverted')) {
        setStatus('❌ Transaction reverted. Check if stream can be cancelled.');
      } else {
        setStatus(`❌ Cancellation failed: ${error.message}`);
      }
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    // Ensure timestamp is a number
    const time = typeof timestamp === 'bigint' ? Number(timestamp) : Number(timestamp);
    return new Date(time * 1000).toLocaleString();
  };

  // Format duration
  const formatDuration = (seconds) => {
    // Ensure seconds is a number
    const secs = typeof seconds === 'bigint' ? Number(seconds) : Number(seconds);
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const remainingSecs = secs % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSecs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSecs}s`;
    } else {
      return `${remainingSecs}s`;
    }
  };

  // Check if user can interact with stream
  const canInteractWithStream = (stream) => {
    return account && (
      account.toLowerCase() === stream.recipient.toLowerCase() ||
      account.toLowerCase() === stream.sender.toLowerCase()
    );
  };

  // Filter streams for current user
  const userStreams = streams.filter(stream => 
    account && (
      account.toLowerCase() === stream.sender.toLowerCase() ||
      account.toLowerCase() === stream.recipient.toLowerCase()
    )
  );

  const otherStreams = streams.filter(stream => 
    !account || (
      account.toLowerCase() !== stream.sender.toLowerCase() &&
      account.toLowerCase() !== stream.recipient.toLowerCase()
    )
  );

  return (
    <div className="bg-gradient-to-r from-slate-800/30 to-slate-900/30 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/30">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">🌊 Active Streams</h2>
        <p className="text-slate-400">Manage your money streams</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-600/20 border border-red-600/50 rounded-2xl p-4 mb-6 text-center">
          <p className="text-red-300 font-medium">❌ Error Loading Streams</p>
          <p className="text-red-400 text-sm mt-1">{error}</p>
          <button
            onClick={loadStreams}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mt-2 text-sm"
          >
            🔄 Retry
          </button>
        </div>
      )}

      {/* Status */}
      {status && (
        <div className="text-center p-3 rounded-xl bg-blue-600/20 text-blue-300 mb-6">
          {status}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-slate-400">Loading streams...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && streams.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🌊</div>
          <p className="text-slate-400 text-lg mb-2">No streams found</p>
          <p className="text-slate-500 text-sm">Create your first money stream above!</p>
        </div>
      )}

      {/* User's Streams */}
      {!isLoading && streams.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-8 border border-indigo-700/50">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            🌊 Your Streams ({streams.length})
          </h2>
          
          <div className="grid gap-6">
            {streams.map((stream) => (
              <StreamCard
                key={stream.id}
                stream={stream}
                account={account}
                onWithdraw={handleWithdraw}
                onCancel={handleCancel}
                isActive={stream.isActive}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Streams */}
      <div className="bg-gradient-to-r from-slate-900/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          🌊 All Active Streams
        </h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading streams...</p>
          </div>
        ) : streams.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💧</div>
            <h3 className="text-xl text-slate-300 mb-2">No Streams Yet</h3>
            <p className="text-slate-400">Create the first money stream to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {streams.map((stream) => (
              <StreamCard
                key={stream.id}
                stream={stream}
                account={account}
                onWithdraw={handleWithdraw}
                onCancel={handleCancel}
                formatTime={formatTime}
                formatDuration={formatDuration}
                canInteract={canInteractWithStream(stream)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Message */}
      {status && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
          <p className="text-center text-slate-300">{status}</p>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={loadStreams}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Refreshing...' : '🔄 Refresh Streams'}
        </button>
      </div>
    </div>
  );
};

// Remove the duplicate StreamCard component and use the one from the separate file
export default StreamList;
