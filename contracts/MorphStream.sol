    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    /**
    * @title MorphStream
    * @dev A protocol for creating real-time, per-second money streams on Morph.
    */
    contract MorphStream {
        // Structure to hold all data for a single stream
        struct Stream {
            address sender;
            address recipient;
            uint256 totalAmount;        // The total amount to be streamed.
            uint256 flowRate;           // Amount per second.
            uint256 startTime;          // Timestamp when the stream begins.
            uint256 stopTime;           // Timestamp when the stream ends.
            uint256 amountWithdrawn;    // Total amount withdrawn by the recipient.
            bool isActive;              // Status of the stream.
        }

        // Mapping from a unique streamId to the Stream struct
        mapping(uint256 => Stream) public streams;
        uint256 private nextStreamId = 1;

        // Events
        event StreamCreated(uint256 indexed streamId, address indexed sender, address indexed recipient, uint256 totalAmount, uint256 startTime, uint256 stopTime);
        event Withdrawn(uint256 indexed streamId, address indexed recipient, uint256 amount);
        event StreamCancelled(uint256 indexed streamId, address sender, address recipient, uint256 senderBalance, uint256 recipientBalance);

        /**
        * @dev Calculates the amount accrued to the recipient for a given stream at the current time.
        * @param streamId The ID of the stream.
        * @return The amount the recipient is eligible to withdraw.
        */
        function getClaimableBalance(uint256 streamId) public view returns (uint256) {
            Stream storage stream = streams[streamId];
            require(stream.isActive, "MorphStream: Stream is not active.");

            // If the current time is before the start time, nothing has been streamed.
            if (block.timestamp < stream.startTime) {
                return 0;
            }

            // If the current time is after the stop time, the full remaining amount is claimable.
            if (block.timestamp >= stream.stopTime) {
                return stream.totalAmount - stream.amountWithdrawn;
            }

            // Otherwise, calculate the streamed amount based on time elapsed.
            uint256 streamedAmount = (block.timestamp - stream.startTime) * stream.flowRate;
            return streamedAmount - stream.amountWithdrawn;
        }

        /**
        * @dev Creates a new money stream.
        * @param recipient The address that will receive the funds.
        * @param duration The duration of the stream in seconds.
        */
        function createStream(address recipient, uint256 duration) external payable {
            require(msg.value > 0, "MorphStream: Total amount must be greater than 0.");
            require(recipient != address(0), "MorphStream: Recipient cannot be the zero address.");
            require(duration > 0, "MorphStream: Duration must be greater than 0.");

            uint256 streamId = nextStreamId++;
            uint256 startTime = block.timestamp;
            uint256 stopTime = startTime + duration;
            // Floor division to avoid rounding up. Require non-zero rate to prevent zero-per-second streams.
            uint256 flowRate = msg.value / duration;
            require(flowRate > 0, "MorphStream: flowRate would be zero. Increase amount or duration.");

            streams[streamId] = Stream({
                sender: msg.sender,
                recipient: recipient,
                totalAmount: msg.value,
                flowRate: flowRate,
                startTime: startTime,
                stopTime: stopTime,
                amountWithdrawn: 0,
                isActive: true
            });

            emit StreamCreated(streamId, msg.sender, recipient, msg.value, startTime, stopTime);
        }

        /**
        * @dev Allows the recipient to withdraw their accrued funds.
        * @param streamId The ID of the stream to withdraw from.
        */
        function withdrawFromStream(uint256 streamId) external {
            Stream storage stream = streams[streamId];
            require(stream.isActive, "MorphStream: Stream is not active.");
            require(msg.sender == stream.recipient, "MorphStream: Caller is not the recipient.");

            uint256 claimableAmount = getClaimableBalance(streamId);
            require(claimableAmount > 0, "MorphStream: No funds to withdraw.");

            stream.amountWithdrawn += claimableAmount;
            
            (bool success, ) = payable(stream.recipient).call{value: claimableAmount}("");
            require(success, "MorphStream: Transfer failed.");

            emit Withdrawn(streamId, stream.recipient, claimableAmount);
        }

        /**
        * @dev Cancels a stream and refunds both parties.
        * @param streamId The ID of the stream to cancel.
        */
        function cancelStream(uint256 streamId) external {
            Stream storage stream = streams[streamId];
            require(stream.isActive, "MorphStream: Stream already cancelled.");
            require(msg.sender == stream.sender || msg.sender == stream.recipient, "MorphStream: Caller cannot cancel this stream.");

            uint256 recipientBalance = getClaimableBalance(streamId);
            uint256 senderBalance = (stream.totalAmount - stream.amountWithdrawn) - recipientBalance;
            
            stream.isActive = false;

            if (recipientBalance > 0) {
                (bool success, ) = payable(stream.recipient).call{value: recipientBalance}("");
                require(success, "MorphStream: Recipient transfer failed on cancel.");
            }

            if (senderBalance > 0) {
                (bool success, ) = payable(stream.sender).call{value: senderBalance}("");
                require(success, "MorphStream: Sender refund failed on cancel.");
            }

            emit StreamCancelled(streamId, stream.sender, stream.recipient, senderBalance, recipientBalance);
        }
    }