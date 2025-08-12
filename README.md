# MorphStream

Real-time, per-second money streaming on Morph Holesky. This repo contains:
- `contracts/`: Solidity contract for creating, withdrawing from, and cancelling streams
- `vite-project/`: React + Vite frontend with TailwindCSS

## Prerequisites
- Node.js 18+
- npm 9+
- MetaMask (or any EIP-1193 wallet)

## Contracts (Hardhat)

- Install:
```bash
npm install
```

- Compile & Test:
```bash
npx hardhat compile
npx hardhat test
```

- Deploy (example using Ignition template provided):
```bash
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

Update your deployed `MorphStream` address in the frontend environment (below).

## Frontend (Vite + React)

- Setup:
```bash
cd vite-project
npm install
```

- Configure environment (create `vite-project/.env`):
```bash
VITE_CONTRACT_ADDRESS=0xYourDeployedAddress
VITE_TARGET_CHAIN_ID=2810
```

- Run dev server:
```bash
npm run dev
```

- Build & Preview:
```bash
npm run build
npm run preview
```

## dApp Features
- Connect wallet and auto/suggest network switch to Morph Holesky
- Create a money stream by specifying recipient, total amount (ETH), and duration (seconds)
- Incoming/Outgoing streams dashboard with:
  - Stream cards showing ID, participant, total, flow rate (ETH/s)
  - Progress bar for elapsed duration
  - Real-time claimable balance ticker (incoming)
  - Withdraw/Cancel actions
- Manual withdraw panel to check claimable balance by Stream ID and withdraw
- Floating status toast with loading indicator and clear success/failure messages

## Contract Notes
`contracts/MorphStream.sol`:
- Emits `StreamCreated`, `Withdrawn`, `StreamCancelled`
- `createStream(recipient, duration)` is payable and computes `flowRate = msg.value / duration`
  - Guard added: `flowRate > 0` to prevent zero-rate streams
- `getClaimableBalance(streamId)` returns the currently claimable amount
- `withdrawFromStream(streamId)` allows the recipient to withdraw accrued funds
- `cancelStream(streamId)` refunds both parties proportionally and closes the stream

## Configuration
- Frontend reads the contract address from `VITE_CONTRACT_ADDRESS` (falls back to the hardcoded address in `src/contactInfo.js` if unset).
- Target chain id is expected to be Morph Holesky (2810). Some wallets may report 2818; the app tolerates both.

## Common Commands
```bash
# Contracts
npx hardhat compile
npx hardhat test

# Frontend
cd vite-project
npm run dev
npm run build && npm run preview
```

## Notes
- For hackathon deployment, push both `contracts/` and `vite-project/` directories.
- If you change networks or redeploy, update `VITE_CONTRACT_ADDRESS` and restart the dev server.
