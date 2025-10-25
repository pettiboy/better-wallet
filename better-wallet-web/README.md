# Better Wallet Web

A web-based hot wallet interface for the Better Wallet air-gapped hardware wallet system.

## Overview

This is a React web application that serves as the hot wallet interface for Better Wallet. It connects to your cold wallet mobile app to manage Ethereum transactions securely using QR codes.

## Features

### Core Functionality
- **Hot Wallet Mode**: Connect to blockchain, create transactions, broadcast signed transactions
- **QR Code Communication**: Secure transaction flow via QR codes with mobile app
- **Sepolia Testnet**: Safe testing environment (no real funds at risk)

### Security Features
- **No Private Keys**: This web app never stores private keys
- **Air-Gapped Signing**: Cold wallet mobile app never connects to internet
- **Transaction Review**: Detailed transaction verification before signing

## Getting Started

### Prerequisites
- Modern web browser with camera access
- Better Wallet mobile app set up as cold wallet
- Two devices - mobile app for cold wallet, browser for hot wallet

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

### Setting Up Hot Wallet (Web App)

1. Open the web app in your browser
2. Complete the onboarding flow
3. Choose "Connect to Cold Wallet" on the setup screen
4. Scan the wallet address QR code from your mobile app
5. Your hot wallet is now connected and can view balance

### Setting Up Cold Wallet (Mobile App)

1. Install and set up the Better Wallet mobile app
2. Generate a new wallet or import existing one
3. Keep the mobile app offline for maximum security
4. Use the mobile app to sign transactions

### Sending Transactions

#### Step 1: Create Transaction (Web App)
1. Navigate to "Send Transaction"
2. Enter recipient address (0x...)
3. Enter amount in ETH
4. Tap "Create Transaction"
5. An unsigned transaction QR code will appear

#### Step 2: Sign Transaction (Mobile App)
1. Open the Better Wallet mobile app
2. Tap "Sign Transaction"
3. Scan the unsigned transaction QR from web app
4. Review transaction details carefully
5. Tap "Sign Transaction"
6. A signed transaction QR code will appear

#### Step 3: Broadcast Transaction (Web App)
1. On the web app, tap "Scan Signed Transaction"
2. Scan the signed transaction QR from mobile app
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
- This web app never stores private keys
- Cold wallet mobile app should be kept offline for maximum security
- Recovery phrase should be stored securely offline
- Currently configured for Sepolia testnet (safe for testing)

### File Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts for state management
├── pages/             # Page components
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
   - Create transaction on web app
   - Sign on mobile app
   - Broadcast on web app
   - Verify on Etherscan

## Limitations

- Currently supports ETH transfers only (no ERC-20 tokens)
- Single-signature only (not multi-sig)
- Sepolia testnet by default
- Requires Better Wallet mobile app for cold wallet functionality
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
- Mobile app cold wallet setup

## License

This is a proof-of-concept application. Use at your own risk.