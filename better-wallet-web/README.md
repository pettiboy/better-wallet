# Better Wallet Web

A web-based implementation of the Better Wallet air-gapped hardware wallet system.

## Overview

This is a React web application that replicates the core functionality of the Better Wallet mobile app. It provides both hot and cold wallet modes for secure Ethereum transaction signing using QR codes.

## Features

### Core Functionality
- **Cold Wallet Mode**: Generate and store private keys offline, sign transactions
- **Hot Wallet Mode**: Connect to blockchain, create transactions, broadcast signed transactions
- **QR Code Communication**: Secure transaction flow via QR codes between devices
- **Sepolia Testnet**: Safe testing environment (no real funds at risk)

### Security Features
- **Encrypted Storage**: Private keys encrypted with Web Crypto API using browser fingerprint
- **Air-Gapped Signing**: Cold wallet never connects to internet
- **Transaction Review**: Detailed transaction verification before signing

## Getting Started

### Prerequisites
- Modern web browser with camera access
- Two devices (or browser tabs) - one for hot wallet, one for cold wallet

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

## Usage Guide

### Setting Up Cold Wallet (Device 1)

1. Open the app in your browser
2. Complete the onboarding flow
3. Choose "Cold Wallet" on the setup screen
4. A new Ethereum wallet will be generated
5. **Important**: Write down and safely store the recovery phrase shown in Settings
6. Keep this device offline (turn off WiFi/cellular) for maximum security

### Setting Up Hot Wallet (Device 2)

1. Open the app in a different browser/tab
2. Complete the onboarding flow
3. Choose "Hot Wallet" on the setup screen
4. Scan the wallet address QR code from your cold wallet
5. Your hot wallet is now connected and can view balance

### Sending Transactions

#### Step 1: Create Transaction (Hot Wallet)
1. Navigate to "Send Transaction"
2. Enter recipient address (0x...)
3. Enter amount in ETH
4. Tap "Create Transaction"
5. An unsigned transaction QR code will appear

#### Step 2: Sign Transaction (Cold Wallet)
1. Open the cold wallet
2. Tap "Sign Transaction"
3. Scan the unsigned transaction QR from hot wallet
4. Review transaction details carefully
5. Tap "Sign Transaction"
6. A signed transaction QR code will appear

#### Step 3: Broadcast Transaction (Hot Wallet)
1. On the hot wallet, tap "Scan Signed Transaction"
2. Scan the signed transaction QR from cold wallet
3. Transaction will be broadcasted to the network
4. Transaction hash will be displayed

## Technical Details

### Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Ethereum**: ethers.js v6 for blockchain interactions
- **QR Codes**: qrcode.react for generation, @zxing/browser for scanning
- **Storage**: localStorage with Web Crypto API encryption
- **Routing**: react-router-dom for navigation

### Security Considerations
- Private keys are encrypted using browser fingerprint + PBKDF2
- Cold wallet should be kept offline for maximum security
- Recovery phrase should be stored securely offline
- Currently configured for Sepolia testnet (safe for testing)

### File Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts for state management
├── pages/             # Page components
│   ├── cold/         # Cold wallet pages
│   └── hot/          # Hot wallet pages
├── services/         # Business logic services
├── utils/           # Utility functions
└── App.tsx          # Main app with routing
```

## Testing

1. **Get Test ETH**: Visit a Sepolia faucet to get test ETH:
   - https://sepoliafaucet.com/
   - https://www.infura.io/faucet/sepolia

2. **Test Transaction Flow**: 
   - Create transaction on hot wallet
   - Sign on cold wallet
   - Broadcast on hot wallet
   - Verify on Etherscan

## Limitations

- Currently supports ETH transfers only (no ERC-20 tokens)
- Single-signature only (not multi-sig)
- Sepolia testnet by default
- Requires camera access for QR scanning
- Browser-based storage (less secure than hardware wallets)

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding Features
- ERC-20 token support
- Multiple blockchain support
- Smart contract interaction
- Advanced gas fee configuration
- Transaction history

## Security Warning

This is a proof-of-concept application. While it implements security best practices, it should not be used for storing significant amounts of cryptocurrency without additional security measures.

For production use, consider:
- Hardware wallet integration
- Multi-signature support
- Additional encryption layers
- Security audits

## License

This is a proof-of-concept application. Use at your own risk.