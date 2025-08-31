import { ethers } from 'ethers';

const StreamCard = ({ stream, account, onWithdraw, onCancel, isActive }) => {
  const formatAddress = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`;
  
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  const getStatusColor = () => {
    if (isActive) return 'border-green-500 bg-green-500/10';
    return 'border-slate-500 bg-slate-500/10';
  };

  const getStatusText = () => {
    if (isActive) return '🟢 Active';
    return '⚫ Completed';
  };

  return (
    <div className={`rounded-2xl p-6 border-2 ${getStatusColor()} backdrop-blur-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌊</span>
          <div>
            <h3 className="text-xl font-bold text-white">Stream #{stream.id}</h3>
            <p className="text-slate-400 text-sm">{getStatusText()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{parseFloat(ethers.formatEther(stream.amount)).toFixed(6)} ETH</div>
          <div className="text-slate-400 text-sm">Total Amount</div>
        </div>
      </div>

      {/* Stream Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-slate-400 text-sm">From</div>
          <div className="text-white font-mono">{formatAddress(stream.sender)}</div>
        </div>
        <div>
          <div className="text-slate-400 text-sm">To</div>
          <div className="text-white font-mono">{formatAddress(stream.recipient)}</div>
        </div>
        <div>
          <div className="text-slate-400 text-sm">Flow Rate</div>
          <div className="text-white font-mono">{parseFloat(ethers.formatEther(stream.flowRate)).toFixed(12)} ETH/s</div>
        </div>
        <div>
          <div className="text-slate-400 text-sm">Duration</div>
          <div className="text-white">{formatDuration(parseInt(stream.duration))}</div>
        </div>
        <div>
          <div className="text-slate-400 text-sm">Start Time</div>
          <div className="text-white text-sm">{formatTime(stream.startTime)}</div>
        </div>
        <div>
          <div className="text-slate-400 text-sm">End Time</div>
          <div className="text-white text-sm">{formatTime(parseInt(stream.startTime) + parseInt(stream.duration))}</div>
        </div>
      </div>

      {/* Progress & Actions */}
      {isActive && (
        <>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Progress</span>
              <span>{Math.round((Date.now() / 1000 - parseInt(stream.startTime)) / parseInt(stream.duration) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, Math.max(0, (Date.now() / 1000 - parseInt(stream.startTime)) / parseInt(stream.duration) * 100))}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Claimable Amount */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4 text-center">
            <div className="text-slate-400 text-sm mb-1">Claimable Amount</div>
            <div className="text-2xl font-bold text-green-400">
              {parseFloat(ethers.formatEther(stream.claimableAmount)).toFixed(6)} ETH
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {stream.recipient.toLowerCase() === account.toLowerCase() && (
              <button
                onClick={() => onWithdraw(stream.id)}
                disabled={parseFloat(ethers.formatEther(stream.claimableAmount)) === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                💰 Claim ETH
              </button>
            )}
            
            {stream.sender.toLowerCase() === account.toLowerCase() && (
              <button
                onClick={() => onCancel(stream.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                🚫 Cancel Stream
              </button>
            )}
          </div>
        </>
      )}

      {/* Completed Stream Info */}
      {!isActive && (
        <div className="text-center text-slate-400">
          <p>Stream completed on {formatTime(parseInt(stream.startTime) + parseInt(stream.duration))}</p>
          <p className="text-sm mt-1">
            {stream.recipient.toLowerCase() === account.toLowerCase() 
              ? `You received ${parseFloat(ethers.formatEther(stream.amount)).toFixed(6)} ETH`
              : `You sent ${parseFloat(ethers.formatEther(stream.amount)).toFixed(6)} ETH`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default StreamCard;
