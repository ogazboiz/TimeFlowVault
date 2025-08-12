# 🌊 MorphStream: Real-Time Finance, Powered by Morph

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

MorphStream is a protocol built to demonstrate the powerful, real-world use cases unlocked **exclusively by the Morph L2 architecture**. By enabling per-second money streaming, this project showcases a new financial paradigm that is fundamentally impossible on traditional Layer 1 blockchains due to prohibitive costs.

---

### ## 📺 Live Demo & Video

* **Live dApp Link:** `[Link to your Vercel deployment will go here]`
* **Demo Video:** `[Link to your YouTube or Loom demo video will go here]`

---

### ## ✨ The "Why Morph?" Vision

The core question this project answers is: "What can we build on Morph that we simply cannot build anywhere else?"

The answer is **real-time, per-second finance**.

* **The Layer 1 Problem:** On Ethereum, a simple transaction can cost several dollars. Attempting to stream a salary or subscription payment would require thousands of micro-transactions, resulting in gas fees that are hundreds or even thousands of times greater than the amount being sent. This renders the entire concept of "per-second finance" economically absurd on Layer 1.

* **The Morph Solution:** MorphStream leverages Morph's L2 architecture to provide **near-zero gas fees and high transaction throughput**. This efficiency is not just a "nice-to-have"—it is the **enabling technology** that transforms money streaming from a theoretical idea into a practical, powerful financial primitive. MorphStream is built on Morph because its core function is only viable on Morph.



---

### ## 🚀 Key Features

* **Create Streams on Morph:** Lock ETH and initiate a continuous stream to any recipient, with each state change secured by the Morph network.
* **On-Demand Withdrawals:** Recipients can withdraw their accrued funds at any time, with each withdrawal being a fast and cheap transaction on Morph.
* **Cancelable Streams:** Senders or recipients can cancel an active stream, with funds fairly refunded through a low-cost Morph transaction.
* **Real-Time Balance Display:** The UI showcases the power of continuous streams, with balances accruing second by second.

---

### ## 🛠️ Technology Stack

* **Blockchain:** **Morph Holesky Testnet**
* **Smart Contracts:** Solidity, Hardhat
* **Frontend:** React (Vite), JavaScript
* **Blockchain Interaction:** Ethers.js
* **Deployment:** Vercel (Frontend)

---

### ## 🏁 Getting Started

To run this project locally, follow these steps.

#### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or later)
* [MetaMask](https://metamask.io/) browser extension configured for the Morph Holesky Testnet.

#### 1. Backend Setup

```bash
# Clone the repository
git clone [Your GitHub Repo URL]
cd MorphStream-Submission/backend

# Install dependencies
npm install

# Create a .env file in the 'backend' directory
# and add your details
Your backend/.env file should look like this:

MORPH_RPC_URL="[https://rpc-quicknode-holesky.morphl2.io](https://rpc-quicknode-holesky.morphl2.io)"
PRIVATE_KEY="YOUR_METAMASK_PRIVATE_KEY_HERE"
2. Frontend Setup
Bash

# From the root folder, navigate to the frontend
cd ../frontend

# Install dependencies
npm install
You will also need to add your deployed contract details to the frontend. Create a file at frontend/src/contractInfo.js and add the following:

JavaScript

export const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
export const contractABI = [ /* PASTE YOUR ABI ARRAY HERE */ ];
3. Running the Application
Run the Frontend: From the frontend directory, run:

Bash

npm run dev
The application will be available at http://localhost:5173.

Note: Since the backend smart contract is already deployed on the Morph Holesky Testnet, you do not need to run a local Hardhat node. Simply connect your MetaMask to the Morph testnet.









