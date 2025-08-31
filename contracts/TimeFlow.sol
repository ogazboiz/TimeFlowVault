// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TimeFlow
 * @dev Real-time money streaming protocol for continuous financial flows
 */
contract TimeFlow {
    struct Stream {
        address sender;
        address recipient;
        uint256 totalAmount;
        uint256 flowRate; // amount per second
        uint256 startTime;
        uint256 stopTime;
        uint256 amountWithdrawn;
        bool isActive;
    }

    mapping(uint256 => Stream) public streams;
    uint256 public nextStreamId;

    event StreamCreated(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 totalAmount,
        uint256 flowRate,
        uint256 startTime,
        uint256 stopTime
    );

    event Withdrawn(
        uint256 indexed streamId,
        address indexed recipient,
        uint256 amount
    );

    event StreamCancelled(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 senderBalance,
        uint256 recipientBalance
    );

    /**
     * @dev Create a new money stream
     * @param recipient Address receiving the stream
     * @param duration Duration of the stream in seconds
     */
    function createStream(address recipient, uint256 duration) external payable {
        require(recipient != address(0), "TimeFlow: Invalid recipient");
        require(recipient != msg.sender, "TimeFlow: Cannot stream to self");
        require(duration > 0, "TimeFlow: Duration must be positive");
        require(msg.value > 0, "TimeFlow: Amount must be positive");

        uint256 streamId = nextStreamId++;
        uint256 flowRate = msg.value / duration;

        streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            totalAmount: msg.value,
            flowRate: flowRate,
            startTime: block.timestamp,
            stopTime: block.timestamp + duration,
            amountWithdrawn: 0,
            isActive: true
        });

        emit StreamCreated(
            streamId,
            msg.sender,
            recipient,
            msg.value,
            flowRate,
            block.timestamp,
            block.timestamp + duration
        );
    }

    /**
     * @dev Withdraw funds from a stream
     * @param streamId ID of the stream to withdraw from
     */
    function withdrawFromStream(uint256 streamId) external {
        Stream storage stream = streams[streamId];
        require(stream.isActive, "TimeFlow: Stream is not active");
        require(msg.sender == stream.recipient, "TimeFlow: Only recipient can withdraw");

        uint256 claimable = getClaimableBalance(streamId);
        require(claimable > 0, "TimeFlow: Nothing to withdraw");

        stream.amountWithdrawn += claimable;
        
        // If stream is finished and all funds withdrawn, mark as inactive
        if (block.timestamp >= stream.stopTime && 
            stream.amountWithdrawn >= stream.totalAmount) {
            stream.isActive = false;
        }

        (bool success, ) = msg.sender.call{value: claimable}("");
        require(success, "TimeFlow: Transfer failed");

        emit Withdrawn(streamId, msg.sender, claimable);
    }

    /**
     * @dev Cancel a stream and refund remaining funds
     * @param streamId ID of the stream to cancel
     */
    function cancelStream(uint256 streamId) external {
        Stream storage stream = streams[streamId];
        require(stream.isActive, "TimeFlow: Stream is not active");
        require(
            msg.sender == stream.sender || msg.sender == stream.recipient,
            "TimeFlow: Only sender or recipient can cancel"
        );

        uint256 recipientBalance = getClaimableBalance(streamId);
        uint256 senderBalance = stream.totalAmount - stream.amountWithdrawn - recipientBalance;

        stream.isActive = false;

        // Refund recipient
        if (recipientBalance > 0) {
            (bool success, ) = stream.recipient.call{value: recipientBalance}("");
            require(success, "TimeFlow: Recipient refund failed");
        }

        // Refund sender
        if (senderBalance > 0) {
            (bool success, ) = stream.sender.call{value: senderBalance}("");
            require(success, "TimeFlow: Sender refund failed");
        }

        emit StreamCancelled(
            streamId,
            stream.sender,
            stream.recipient,
            senderBalance,
            recipientBalance
        );
    }

    /**
     * @dev Get the claimable balance for a stream
     * @param streamId ID of the stream
     * @return Claimable amount in wei
     */
    function getClaimableBalance(uint256 streamId) public view returns (uint256) {
        Stream storage stream = streams[streamId];
        if (!stream.isActive) return 0;

        uint256 currentTime = block.timestamp;
        uint256 cappedNow = currentTime > stream.stopTime ? stream.stopTime : currentTime;
        uint256 elapsed = cappedNow - stream.startTime;
        
        uint256 streamedSoFar = elapsed * stream.flowRate;
        uint256 claimable = streamedSoFar > stream.amountWithdrawn ? 
            streamedSoFar - stream.amountWithdrawn : 0;

        return claimable;
    }

    /**
     * @dev Get stream information
     * @param streamId ID of the stream
     * @return Stream details
     */
    function getStream(uint256 streamId) external view returns (Stream memory) {
        return streams[streamId];
    }

    /**
     * @dev Get total streams count
     * @return Total number of streams created
     */
    function getTotalStreams() external view returns (uint256) {
        return nextStreamId;
    }
}
