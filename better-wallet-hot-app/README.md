# Better Wallet Web

A web-based hot wallet interface for the Better Wallet air-gapped hardware wallet system.

## Overview

This is a React web application that serves as the hot wallet interface for Better Wallet. It connects to your cold wallet mobile app to manage multi-chain EVM transactions securely using QR codes. Think of it as a MetaMask-like experience, but with air-gapped signing for maximum security.

## Features

### Core Functionality

- **Multi-Chain Support**: Support for 20+ EVM chains including Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, and more
- **Custom Token Import**: Add any ERC-20 token by contract address
- **Hot Wallet Mode**: Connect to blockchain, create transactions, broadcast signed transactions
- **QR Code Communication**: Secure transaction flow via QR codes with mobile app
- **Safe Testing**: Default testnet mode for safe testing (no real funds at risk)
- **Network Switching**: Seamlessly switch between mainnet and testnet chains

### Security Features

- **No Private Keys**: This web app never stores private keys
- **Air-Gapped Signing**: Cold wallet mobile app never connects to internet
- **Transaction Review**: Detailed transaction verification before signing
- **Testnet First**: Defaults to Sepolia testnet for safe experimentation

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

## Supported Networks

### Testnets (Recommended for Testing)

- Ethereum Sepolia
- Polygon Amoy
- Arbitrum Sepolia
- Optimism Sepolia
- Base Sepolia
- BNB Testnet
- Avalanche Fuji
- zkSync Sepolia
- Scroll Sepolia

### Mainnets (Use with Real Funds)

- Ethereum Mainnet
- Polygon
- Arbitrum One
- Optimism
- Base
- BNB Smart Chain
- Avalanche C-Chain
- Gnosis Chain
- Fantom Opera
- Celo
- Moonbeam
- Moonriver
- zkSync Era
- Linea
- Scroll

## Usage Guide

### Setting Up Hot Wallet (Web App)

1. Open the web app in your browser
2. Complete the onboarding flow
3. Choose "Connect to Cold Wallet" on the setup screen
4. Scan the wallet address QR code from your mobile app
5. Your hot wallet is now connected and can view balance
6. Select your preferred network from the network selector (defaults to Sepolia testnet)

### Setting Up Cold Wallet (Mobile App)

1. Install and set up the Better Wallet mobile app
2. Generate a new wallet or import existing one
3. Keep the mobile app offline for maximum security
4. Use the mobile app to sign transactions

### Managing Networks

#### Switching Networks

1. On the home page, click the network selector at the top
2. Choose from testnets (recommended) or mainnets
3. Your wallet will automatically switch to the selected network
4. All balances and tokens will update to reflect the new network

**Note**: Your wallet address remains the same across all EVM chains. However, token balances and transactions are network-specific.

### Managing Custom Tokens

#### Adding a Custom Token

1. On the home page, click "Add Custom Token"
2. Enter the token contract address (e.g., `0x...`)
3. Click "Fetch Token Info"
4. Review the token details (name, symbol, decimals)
5. Click "Add Token to Wallet"
6. The token will now appear on your home page with its balance

**Important**: Always verify the token contract address from official sources before adding. Anyone can create a token with any name.

#### Removing a Custom Token

1. Navigate to Settings
2. Find "Manage Custom Tokens" section
3. Click remove next to the token you want to delete

### Sending Transactions

#### Step 1: Create Transaction (Web App)

1. Navigate to "Send Transaction"
2. Verify the correct network is selected (displayed at the top)
3. Select asset (native currency or custom tokens) - your balance will be displayed
4. Enter recipient address (0x...)
5. Enter amount
6. Tap "Create Transaction"
7. An unsigned transaction QR code will appear

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
│   ├── NetworkSelector.tsx   # Network switching component
│   ├── AddTokenModal.tsx     # Custom token import modal
│   ├── Button.tsx            # Reusable button component
│   └── QRDisplay/Scanner.tsx # QR code components
├── config/             # Configuration
│   ├── chains.ts       # Multi-chain configurations
│   └── tokens.ts       # Token type definitions
├── contexts/           # React contexts for state management
│   ├── NetworkContext.tsx    # Network selection state
│   ├── TokenContext.tsx      # Custom tokens state
│   ├── DeviceModeContext.tsx # Hot/cold wallet mode
│   └── WalletConnectContext.tsx # WalletConnect integration
├── pages/             # Page components
│   ├── hot/          # Hot wallet pages
│   │   ├── HotHomePage.tsx   # Main dashboard
│   │   ├── SendPage.tsx      # Transaction creation
│   │   ├── DappConnectPage.tsx # WalletConnect
│   │   └── SettingsPage.tsx  # Settings
│   └── OnboardingPage.tsx    # Initial setup
├── services/         # Business logic services
│   ├── ethereum.ts   # Multi-chain provider management
│   └── wallet.ts     # Wallet operations
├── utils/           # Utility functions
│   ├── transaction-serializer.ts # QR code serialization
│   └── erc20-detector.ts        # Token detection
└── App.tsx          # Main app with routing and providers
```

## Testing

### Getting Testnet Tokens

1. **Ethereum Sepolia**:

   - https://sepoliafaucet.com/
   - https://www.infura.io/faucet/sepolia

2. **Polygon Amoy**:

   - https://faucet.polygon.technology/

3. **Arbitrum Sepolia**:

   - https://faucet.quicknode.com/arbitrum/sepolia

4. **Optimism Sepolia**:

   - https://app.optimism.io/faucet

5. **Base Sepolia**:

   - https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

6. **Other Testnets**:
   - Check the respective network's official documentation for faucet links

### Test Transaction Flow

1. **Select Network**: Choose a testnet (e.g., Sepolia)
2. **Get Test Tokens**: Use the appropriate faucet for your selected network
3. **Optional - Add Custom Token**: Test the custom token import feature
4. **Create Transaction**: Select asset and create an unsigned transaction
5. **Sign Transaction**: Scan QR with cold wallet mobile app and sign
6. **Broadcast**: Scan signed transaction back to web app
7. **Verify**: Check transaction on the network's block explorer

## Limitations

- Single-signature only (not multi-sig)
- EVM chains only (no Bitcoin, Solana, etc.)
- Requires Better Wallet mobile app for cold wallet functionality
- Browser-based storage (less secure than hardware wallets)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Features

#### Multi-Chain Architecture

The wallet uses a dynamic provider system that switches between different EVM networks seamlessly:

- **Chain Configuration** (`src/config/chains.ts`): Defines all supported chains with their RPC endpoints, block explorers, and native currencies
- **Network Context** (`src/contexts/NetworkContext.tsx`): Manages the currently selected chain with localStorage persistence
- **Dynamic Provider** (`src/services/ethereum.ts`): Automatically switches the ethers.js provider when the network changes

#### Custom Token Management

Tokens are stored per-chain in localStorage:

- **Token Context** (`src/contexts/TokenContext.tsx`): Manages custom tokens for each chain
- **Add Token Modal** (`src/components/AddTokenModal.tsx`): Validates and fetches ERC-20 token information
- **Storage Format**: `{ [chainId]: TokenInfo[] }`

#### QR Code Transaction Flow

The wallet maintains compatibility with the cold wallet mobile app for air-gapped signing across all supported chains.

### Potential Future Features

- Smart contract interaction interface
- Advanced gas fee configuration (EIP-1559 tuning)
- Enhanced transaction history with filtering
- NFT (ERC-721/ERC-1155) display and transfers
- Address book for saved contacts
- Transaction batching for multiple operations
- Hardware wallet integration (Ledger, Trezor)
- Multi-signature wallet support
- Token swaps via DEX aggregators

## Security Considerations

### Current Security Features

- **Air-Gapped Signing**: Private keys never leave the cold wallet mobile app
- **No Key Storage**: This web app never stores or has access to private keys
- **Testnet Default**: Defaults to Sepolia testnet to prevent accidental mainnet usage
- **Transaction Review**: All transaction details shown before signing
- **localStorage Encryption**: Custom tokens and settings stored locally

### Security Best Practices

1. **Keep Cold Wallet Offline**: Never connect your cold wallet mobile device to the internet
2. **Verify Addresses**: Always double-check recipient addresses before signing
3. **Start with Testnets**: Test all features on testnets before using real funds
4. **Verify Custom Tokens**: Always verify token contract addresses from official sources
5. **Small Test Transactions**: Test with small amounts first when using new features
6. **Backup Recovery Phrase**: Keep your wallet recovery phrase secure and offline

### Known Limitations

- **Browser Security**: Web apps are less secure than native applications
- **RPC Dependency**: Relies on third-party RPC providers (potential downtime or censorship)
- **No Multi-Sig**: Single-signature only (not multi-signature)
- **EVM Only**: Only supports EVM-compatible chains (no Bitcoin, Solana, etc.)

### For Production Use

This is a proof-of-concept wallet. For production use with significant funds, consider:

- **Security Audits**: Professional smart contract and application audits
- **Hardware Wallet Integration**: Direct integration with Ledger or Trezor
- **Multi-Signature**: Require multiple signatures for transactions
- **Bug Bounty Program**: Community security testing
- **Insurance**: Consider crypto insurance for large holdings

## License

This is a proof-of-concept application. Use at your own risk.
