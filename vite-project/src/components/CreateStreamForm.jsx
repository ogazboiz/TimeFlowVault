import React, { useState, useEffect } from 'react';























































import { ethers } from 'ethers';

const CreateStreamForm = ({ contract, onStreamCreated, onLoadBalance, onRecreateContract }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [userBalance, setUserBalance] = useState('0');

  // Load user balance
  useEffect(() => {
    const loadBalance = async () => {
      if (contract && contract.signer) {
        try {
          const address = await contract.signer.getAddress();
          const balance = await contract.provider.getBalance(address);
          const balanceEth = ethers.formatEther(balance);
          setUserBalance(balanceEth);
        } catch (error) {
          console.error('Error loading balance:', error);
          setUserBalance('0');
        }
      } else if (contract && contract.provider) {
        try {
          const signer = await contract.provider.getSigner();
          const address = await signer.getAddress();
          const balance = await contract.provider.getBalance(address);
          const balanceEth = ethers.formatEther(balance);
          setUserBalance(balanceEth);
        } catch (error) {
          console.error('Fallback balance loading failed:', error);
          setUserBalance('0');
        }
      }
    };

    loadBalance();
    const interval = setInterval(loadBalance, 30000);
    return () => clearInterval(interval);
  }, [contract, contract?.signer, contract?.provider]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!ethers.isAddress(recipient)) {
      setStatus('Please enter a valid recipient address');
      return;
    }

    if (recipient.toLowerCase() === contract.target.toLowerCase()) {
      setStatus('❌ Cannot create stream to the contract address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setStatus('Please enter a valid amount');
      return;
    }

    const amountEth = parseFloat(amount);
    const balanceEth = parseFloat(userBalance);
    if (amountEth > balanceEth * 0.9) {
      setStatus(`❌ Amount too large! Use less than ${(balanceEth * 0.9).toFixed(6)} ETH`);
      return;
    }

    if (!duration || parseInt(duration) <= 0) {
      setStatus('Please enter a valid duration');
      return;
    }

    setIsLoading(true);
    setStatus('Creating stream...');

    try {
      const amountWei = ethers.parseEther(amount);
      const durationSeconds = parseInt(duration);
      
      // Estimate gas
      setStatus('Estimating gas...');
      let gasEstimate;
      try {
        gasEstimate = await contract.createStream.estimateGas(recipient, durationSeconds, { value: amountWei });
      } catch (gasError) {
        if (gasError.message.includes('insufficient funds')) {
          setStatus('❌ Insufficient funds for gas');
        } else {
          setStatus('❌ Gas estimation failed');
        }
        return;
      }
      
      const gasLimit = gasEstimate * 120n / 100n;
      
      setStatus('Creating stream...');
      const tx = await contract.createStream(recipient, durationSeconds, { 
        value: amountWei,
        gasLimit: gasLimit
      });
      
      await tx.wait();
      
      setStatus('✅ Stream created successfully!');
      setRecipient('');
      setAmount('');
      setDuration('');
      
      onStreamCreated();
      
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error creating stream:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFee = () => {
    if (!amount || parseFloat(amount) <= 0) return '0';
    const fee = (parseFloat(amount) * 0.001);
    return fee.toFixed(6);
  };

  const calculateStreamAmount = () => {
    if (!amount || parseFloat(amount) <= 0) return '0';
    const streamAmount = parseFloat(amount) - parseFloat(calculateFee());
    return streamAmount.toFixed(6);
  };

  const calculateFlowRate = () => {
    if (!amount || !duration || parseFloat(amount) <= 0 || parseInt(duration) <= 0) return '0';
    const streamAmount = parseFloat(calculateStreamAmount());
    const flowRate = streamAmount / parseInt(duration);
    return flowRate.toFixed(12);
  };

  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-3xl p-8 border border-blue-700/30">
      {/* Header with Balance */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4">🌊 Create Money Stream</h2>
        <div className="bg-slate-800/50 rounded-2xl p-4 inline-block">
          <span className="text-slate-300 text-lg">Your Balance: </span>
          <span className="text-3xl font-bold text-white ml-2">{parseFloat(userBalance).toFixed(6)} ETH</span>
        </div>
      </div>
      
      {/* Simple Form */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        {/* Recipient */}
        <div>
          <label className="block text-white font-medium mb-2">📧 Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-white font-medium mb-2">💰 Amount (ETH)</label>
          <input
            type="number"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-white font-medium mb-2">⏱️ Duration (seconds)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="1200"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* Quick Preview */}
        {amount && duration && parseFloat(amount) > 0 && parseInt(duration) > 0 && (
          <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/30">
            <h3 className="text-white font-medium mb-3 text-center">📊 Stream Preview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-slate-300">Amount:</div>
              <div className="text-white font-medium">{amount} ETH</div>
              <div className="text-slate-300">Fee (0.1%):</div>
              <div className="text-white font-medium">{calculateFee()} ETH</div>
              <div className="text-slate-300">Stream Amount:</div>
              <div className="text-white font-medium">{calculateStreamAmount()} ETH</div>
              <div className="text-slate-300">Flow Rate:</div>
              <div className="text-white font-medium">{calculateFlowRate()} ETH/s</div>
            </div>
          </div>
        )}

        {/* Status */}
        {status && (
          <div className={`text-center p-3 rounded-xl ${
            status.includes('✅') ? 'bg-green-600/20 text-green-300' : 
            status.includes('❌') ? 'bg-red-600/20 text-red-300' : 
            'bg-blue-600/20 text-blue-300'
          }`}>
            {status}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
            isLoading 
              ? 'bg-slate-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105'
          } text-white`}
        >
          {isLoading ? '⏳ Creating...' : '🚀 Create Stream'}
        </button>
      </form>
    </div>
  );
};

export default CreateStreamForm;
