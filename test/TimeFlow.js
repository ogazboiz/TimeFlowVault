const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TimeFlow", function () {
  let timeFlow;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    const TimeFlow = await ethers.getContractFactory("TimeFlow");
    timeFlow = await TimeFlow.deploy();
    await timeFlow.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await timeFlow.getAddress()).to.be.properAddress;
      expect(await timeFlow.nextStreamId()).to.equal(0);
    });
  });

  describe("Stream Creation", function () {
    it("Should create a stream successfully", async function () {
      const amount = ethers.parseEther("1000");
      const duration = 3600; // 1 hour
      
      const tx = await timeFlow.connect(user1).createStream(user2.address, duration, { value: amount });
      await expect(tx).to.emit(timeFlow, "StreamCreated");
      
      const stream = await timeFlow.streams(0);
      expect(stream.sender).to.equal(user1.address);
      expect(stream.recipient).to.equal(user2.address);
      expect(stream.totalAmount).to.equal(amount);
      expect(stream.flowRate).to.equal(amount / BigInt(duration));
      expect(stream.isActive).to.be.true;
    });

    it("Should revert if recipient is zero address", async function () {
      const amount = ethers.parseEther("1000");
      const duration = 3600;
      
      await expect(
        timeFlow.connect(user1).createStream(ethers.ZeroAddress, duration, { value: amount })
      ).to.be.revertedWith("TimeFlow: Invalid recipient");
    });

    it("Should revert if sender is recipient", async function () {
      const amount = ethers.parseEther("1000");
      const duration = 3600;
      
      await expect(
        timeFlow.connect(user1).createStream(user1.address, duration, { value: amount })
      ).to.be.revertedWith("TimeFlow: Cannot stream to self");
    });

    it("Should revert if duration is zero", async function () {
      const amount = ethers.parseEther("1000");
      const duration = 0;
      
      await expect(
        timeFlow.connect(user1).createStream(user2.address, duration, { value: amount })
      ).to.be.revertedWith("TimeFlow: Duration must be positive");
    });

    it("Should revert if amount is zero", async function () {
      const amount = 0;
      const duration = 3600;
      
      await expect(
        timeFlow.connect(user1).createStream(user2.address, duration, { value: amount })
      ).to.be.revertedWith("TimeFlow: Amount must be positive");
    });
  });

  describe("Stream Withdrawal", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("1000");
      const duration = 3600; // 1 hour
      await timeFlow.connect(user1).createStream(user2.address, duration, { value: amount });
    });

    it("Should allow recipient to withdraw from stream", async function () {
      // Fast forward 30 minutes
      await ethers.provider.send("evm_increaseTime", [1800]);
      await ethers.provider.send("evm_mine");
      
      const initialBalance = await ethers.provider.getBalance(user2.address);
      
      const tx = await timeFlow.connect(user2).withdrawFromStream(0);
      await expect(tx).to.emit(timeFlow, "Withdrawn");
      
      const finalBalance = await ethers.provider.getBalance(user2.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should revert if non-recipient tries to withdraw", async function () {
      await expect(
        timeFlow.connect(user3).withdrawFromStream(0)
      ).to.be.revertedWith("TimeFlow: Only recipient can withdraw");
    });

    it("Should revert if stream is not active", async function () {
      // Cancel the stream first
      await timeFlow.connect(user1).cancelStream(0);
      
      await expect(
        timeFlow.connect(user2).withdrawFromStream(0)
      ).to.be.revertedWith("TimeFlow: Stream is not active");
    });
  });

  describe("Stream Cancellation", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("1000");
      const duration = 3600; // 1 hour
      await timeFlow.connect(user1).createStream(user2.address, duration, { value: amount });
    });

    it("Should allow sender to cancel stream", async function () {
      const tx = await timeFlow.connect(user1).cancelStream(0);
      await expect(tx).to.emit(timeFlow, "StreamCancelled");
      
      const stream = await timeFlow.streams(0);
      expect(stream.isActive).to.be.false;
    });

    it("Should allow recipient to cancel stream", async function () {
      const tx = await timeFlow.connect(user2).cancelStream(0);
      await expect(tx).to.emit(timeFlow, "StreamCancelled");
      
      const stream = await timeFlow.streams(0);
      expect(stream.isActive).to.be.false;
    });

    it("Should revert if non-participant tries to cancel", async function () {
      await expect(
        timeFlow.connect(user3).cancelStream(0)
      ).to.be.revertedWith("TimeFlow: Only sender or recipient can cancel");
    });
  });

  describe("Claimable Balance", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("1000");
      const duration = 3600; // 1 hour
      await timeFlow.connect(user1).createStream(user2.address, duration, { value: amount });
    });

    it("Should calculate claimable balance correctly", async function () {
      // Fast forward 30 minutes (half the duration)
      await ethers.provider.send("evm_increaseTime", [1800]);
      await ethers.provider.send("evm_mine");
      
      const claimable = await timeFlow.getClaimableBalance(0);
      const expectedAmount = ethers.parseEther("500"); // Half of 1000
      expect(claimable).to.be.closeTo(expectedAmount, ethers.parseEther("1")); // Allow small rounding differences
    });

    it("Should return 0 for inactive streams", async function () {
      await timeFlow.connect(user1).cancelStream(0);
      
      const claimable = await timeFlow.getClaimableBalance(0);
      expect(claimable).to.equal(0);
    });
  });

  describe("Stream Information", function () {
    it("Should return correct stream information", async function () {
      const amount = ethers.parseEther("1000");
      const duration = 3600; // 1 hour
      
      await timeFlow.connect(user1).createStream(user2.address, duration, { value: amount });
      
      const stream = await timeFlow.getStream(0);
      expect(stream.sender).to.equal(user1.address);
      expect(stream.recipient).to.equal(user2.address);
      expect(stream.totalAmount).to.equal(amount);
      expect(stream.isActive).to.be.true;
    });

    it("Should return correct total streams count", async function () {
      expect(await timeFlow.getTotalStreams()).to.equal(0);
      
      const amount = ethers.parseEther("1000");
      const duration = 3600;
      await timeFlow.connect(user1).createStream(user2.address, duration, { value: amount });
      
      expect(await timeFlow.getTotalStreams()).to.equal(1);
    });
  });

  describe("Multiple Streams", function () {
    it("Should handle multiple streams correctly", async function () {
      const amount1 = ethers.parseEther("1000");
      const amount2 = ethers.parseEther("500");
      const duration = 3600;
      
      await timeFlow.connect(user1).createStream(user2.address, duration, { value: amount1 });
      await timeFlow.connect(user2).createStream(user3.address, duration, { value: amount2 });
      
      expect(await timeFlow.getTotalStreams()).to.equal(2);
      
      const stream1 = await timeFlow.streams(0);
      const stream2 = await timeFlow.streams(1);
      
      expect(stream1.sender).to.equal(user1.address);
      expect(stream1.recipient).to.equal(user2.address);
      expect(stream2.sender).to.equal(user2.address);
      expect(stream2.recipient).to.equal(user3.address);
    });
  });
});
