# Better Wallet

A secure, air-gapped cryptocurrency wallet system that turns two smartphones into a hardware wallet setup. Uses QR codes for offline transaction signing with WalletConnect support for dApp interactions.

## 🔐 What is Better Wallet?

Better Wallet is a **2-device wallet system** that provides hardware wallet-level security using devices you already own:

- **Cold Wallet (Device B)**: Offline phone that stores private keys and signs transactions
- **Hot Wallet (Device A)**: Online phone/web app that monitors balance and connects to dApps
- **Communication**: Exclusively via QR codes - no network connection between devices

This architecture ensures your private keys never touch the internet, providing security comparable to Ledger or Trezor hardware wallets.

## 📁 Project Structure

```
better-wallet/
├── better-wallet-cold-app/     # Native mobile app (React Native/Expo) - Offline signing
├── better-wallet-hot-app/      # Web PWA (React/Vite) - View-only wallet + dApps
└── landing/                    # Landing page with APK download
```

## ✨ Key Features

### Cold Wallet (Offline Device)

- ✅ **Airplane Mode Enforcement**: Blocks app usage until completely offline
- ✅ **HD Wallet**: BIP39 mnemonic (12 words) with secure key storage
- ✅ **Biometric Security**: Face ID/Fingerprint authentication for signing
- ✅ **Transaction Verification**: Detailed review before signing (including dApp info)
- ✅ **ERC-20 Support**: Detects and displays token transfers
- ✅ **QR-Based**: Sign transactions by scanning QR codes

### Hot Wallet (Online Device)

- ✅ **View-Only**: No private keys stored
- ✅ **Balance Tracking**: Real-time ETH and ERC-20 token balances
- ✅ **PYUSD Support**: Store and send PayPal USD stablecoin (feels like storing actual dollars)
- ✅ **Transaction Creation**: Build unsigned transactions with gas estimation
- ✅ **WalletConnect**: Connect to dApps (Uniswap, OpenSea, etc.)
- ✅ **Blockscout Integration**: Real-time transaction tracking with visual notifications
- ✅ **PWA**: Install as mobile app with offline UI support
- ✅ **Broadcasting**: Send signed transactions to blockchain

### Landing Page

- ✅ **APK Download**: Direct download of cold wallet Android app
- ✅ **Documentation**: Getting started guide
- ✅ **Modern UI**: Neobrutalism design

## 🚀 Quick Start

### Prerequisites

- **Cold Wallet**: Android phone or iPhone (for React Native app)
- **Hot Wallet**: Any device with modern web browser
- Node.js 20.x or higher
- Expo Go app (for development)

### 1. Setup Cold Wallet (Offline Device)

```bash
# Install and run
cd better-wallet-cold-app
npm install
npm start
```

1. Scan QR code with Expo Go on your offline device
2. Follow onboarding to create wallet
3. **BACKUP YOUR 12-WORD RECOVERY PHRASE**
4. Verify mnemonic by selecting words in order
5. **Enable Airplane Mode** - keep this device offline permanently
6. Go to Settings and display your wallet address QR code

### 2. Setup Hot Wallet (Online Device)

**For Web (Recommended):**

```bash
cd better-wallet-hot-app
npm install
npm run dev
```

Visit `https://localhost:5173` in your browser (HTTPS required for camera access)

1. Scan the wallet address QR from your cold device
2. Your wallet is now connected!
3. View balances for both ETH and PYUSD (Sepolia testnet)
4. Get transaction notifications via Blockscout integration

**For Production Build:**

```bash
npm run build
# Deploy the 'dist' folder to any static host
```

### 3. Get Test Funds

**Get Test ETH:**

1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Request test ETH (0.5 ETH)
4. Wait 30-60 seconds and refresh your hot wallet

**Get Test PYUSD (Optional):**

1. Use Sepolia testnet exchanges or PYUSD faucets
2. Your wallet will display both ETH and PYUSD balances
3. PYUSD gives you a stable "dollar" balance experience

### 4. Send Your First Transaction

**Manual Transaction:**

1. **Hot Wallet**: Select asset (ETH or PYUSD) → Create transaction → scan displayed QR code
2. **Cold Wallet**: Open app → Scan Transaction → review → sign (with biometric)
3. **Cold Wallet**: Signed TX QR code appears
4. **Hot Wallet**: Scan signed QR → transaction broadcasts automatically
5. **Blockscout**: Real-time notification popup appears to track your transaction

**dApp Transaction (WalletConnect):**

1. **Hot Wallet**: Connect to dApps → scan WalletConnect URI from dApp
2. **Hot Wallet**: Approve connection
3. **dApp**: Initiate transaction (swap, NFT purchase, etc.)
4. **Hot Wallet**: Transaction QR appears with dApp information
5. **Cold Wallet**: Scan → review dApp details → sign
6. **Hot Wallet**: Scan signed TX → broadcasts and confirms to dApp

## 🛠️ Development Setup

### Cold Wallet App (React Native/Expo)

```bash
cd better-wallet-cold-app
npm install

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Build APK for Android
npm run build:android

# Development with Expo Go
npm start
```

**Key Dependencies:**

- `ethers` - Ethereum wallet operations
- `expo-secure-store` - Secure key storage
- `expo-camera` - QR scanning
- `expo-local-authentication` - Biometric auth
- `react-native-qrcode-svg` - QR generation

### Hot Wallet (React/Vite PWA)

```bash
cd better-wallet-hot-app
npm install

# Development
npm run dev

# Build
npm run build

# Preview production
npm run preview
```

**Key Dependencies:**

- `ethers` - Blockchain interaction
- `@reown/walletkit` - WalletConnect integration
- `@blockscout/app-sdk` - Transaction tracking and notifications
- `vite-plugin-pwa` - Progressive Web App support
- `html5-qrcode` - QR scanning in browser

**WalletConnect Setup:**

Create `.env` file:

```bash
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

Get Project ID from [Reown Cloud](https://cloud.reown.com)

### Landing Page

```bash
cd landing
npm install
npm run dev  # Development
npm run build  # Production build
```

## 🔒 Security Model

### Air-Gap Architecture

```
┌─────────────────┐                    ┌──────────────────┐
│  Cold Wallet    │                    │   Hot Wallet     │
│  (Offline)      │                    │   (Online)       │
├─────────────────┤                    ├──────────────────┤
│ • Private Key   │    QR Code Only    │ • Watch Address  │
│ • Signs TX      │ ◄────────────────► │ • Creates TX     │
│ • Never Online  │                    │ • Broadcasts TX  │
│ • Biometric     │                    │ • Connects dApps │
└─────────────────┘                    └──────────────────┘
```

### Key Security Features

1. **Private Key Isolation**: Keys never leave the cold device
2. **Offline Enforcement**: App blocks usage until airplane mode enabled
3. **Biometric Authentication**: Required for every transaction signature
4. **Transaction Verification**: Full transaction details shown before signing
5. **dApp Transparency**: Cold wallet displays which dApp requested the transaction
6. **Secure Storage**: iOS Keychain / Android Keystore for private keys
7. **No Network Permissions**: Cold wallet has no internet access

### Transaction Flow Security

1. Hot wallet constructs unsigned transaction (no private key access)
2. Transaction serialized and displayed as QR code
3. Cold wallet scans and parses transaction
4. User reviews all details (recipient, amount, gas, dApp source)
5. Biometric authentication required
6. Cold wallet signs with private key (offline)
7. Signed transaction displayed as QR code
8. Hot wallet scans, broadcasts to network

## 💰 PayPal USD (PYUSD) Integration

Better Wallet supports **PayPal USD (PYUSD)**, a dollar-backed stablecoin that gives you the feeling of storing actual US dollars in your wallet:

### Why PYUSD?

- **1:1 USD Peg**: Each PYUSD token equals $1 USD
- **Stable Value**: Unlike volatile cryptocurrencies, your balance stays stable
- **Dollar Experience**: See your balance in PYUSD and know exactly how many dollars you have
- **PayPal Backed**: Issued and backed by PayPal, a trusted financial institution
- **Fast Transfers**: Send "dollars" anywhere in the world instantly via blockchain

### Using PYUSD

1. View your PYUSD balance alongside ETH on the home screen
2. Send PYUSD to any Ethereum address
3. Receive PYUSD just like ETH (same wallet address)
4. Track PYUSD transactions with Blockscout

**Sepolia Testnet Contract**: `0xcac524bca292aaade2df8a05cc58f0a65b1b3bb9`

## 🔍 Blockscout Transaction Tracking

Better Wallet integrates with **Blockscout** to provide real-time transaction monitoring:

### Features

- **Visual Notifications**: Toast popups when transactions are broadcasted
- **Live Tracking**: Watch your transaction progress in real-time
- **Block Explorer**: Direct links to Blockscout for transaction details
- **Status Updates**: See confirmations as they happen
- **Transaction History**: View complete transaction details on Blockscout

### How It Works

1. When you broadcast a transaction, a notification popup appears
2. Click the notification to open Blockscout transaction page
3. Watch real-time updates as your transaction gets confirmed
4. View all transaction details (gas used, block number, etc.)

Blockscout provides transparent, open-source blockchain exploration without relying on centralized services.

## 🌐 Network Support

**Currently Supported:**

- Ethereum Sepolia Testnet (default)

**Can Be Configured For:**

- Ethereum Mainnet
- Other EVM chains (Polygon, Arbitrum, BSC, etc.)

**Configuration:**
Update RPC URL in `better-wallet-hot-app/src/services/ethereum.ts`

## 📱 Platform Support

### Cold Wallet

- ✅ iOS (via Expo)
- ✅ Android (APK available)
- ✅ iOS Simulator/Android Emulator (development)

### Hot Wallet

- ✅ Web browsers (Chrome, Safari, Firefox, Edge)
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Installable as PWA on mobile

## 🧪 Testing

### Test on Sepolia Testnet

1. **Get testnet ETH**: [sepoliafaucet.com](https://sepoliafaucet.com/)
2. **Get testnet PYUSD**: Use Sepolia testnet exchanges or request from PYUSD faucets
3. **Test transactions**: Send ETH and PYUSD between addresses
4. **Test dApps**: Use [WalletConnect test dApp](https://react-app.walletconnect.com)
5. **Track transactions**: Watch real-time updates via Blockscout notifications
6. **Verify on Explorer**: [sepolia.etherscan.io](https://sepolia.etherscan.io) or Blockscout

### Security Testing

- ✅ Verify cold wallet works in airplane mode
- ✅ Test biometric authentication
- ✅ Verify recovery phrase backup/restore
- ✅ Test invalid QR code handling
- ✅ Verify transaction details match before/after signing
- ✅ Test multiple dApp sessions

## 📦 Deployment

### Cold Wallet App

**Android (APK):**

```bash
cd better-wallet-cold-app
eas build --platform android --profile production
```

**iOS (TestFlight/App Store):**

```bash
eas build --platform ios --profile production
```

### Hot Wallet (Web)

Deploy `better-wallet-hot-app/dist` to any static hosting:

- **Firebase Hosting**: `firebase deploy`
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `dist` folder
- **GitHub Pages**: Push dist folder

**Requirements:**

- HTTPS (required for camera API and service workers)
- Environment variables configured

### Landing Page

Deploy `landing/dist` folder to static hosting.

## 🎨 UI/UX Features

### Cold Wallet

- Ethereum-themed color scheme
- Dark/light mode support
- Smooth animations
- Responsive layouts
- Security-focused design

### Hot Wallet

- Neobrutalism design system
- Mobile-first (max-width: 428px)
- Bottom tab navigation
- PWA with offline support
- Bold colors and typography

## 🔧 Configuration

### Cold Wallet

Edit `better-wallet-cold-app/services/wallet.ts` for:

- Network settings
- Derivation path
- Gas estimation

### Hot Wallet

Edit `better-wallet-hot-app/src/services/ethereum.ts` for:

- RPC endpoint
- Chain ID
- Block explorer
- Token contracts

## 📚 Technical Details

### Transaction Serialization

Transactions are serialized as JSON with metadata:

```typescript
{
  transaction: {
    to: "0x...",
    value: "1000000000000000000",
    gasLimit: "21000",
    maxFeePerGas: "...",
    maxPriorityFeePerGas: "...",
    nonce: 5,
    chainId: 11155111
  },
  metadata: {
    source: "dapp" | "manual",
    dappMetadata: {
      name: "Uniswap",
      url: "https://app.uniswap.org",
      icon: "...",
      description: "..."
    },
    requestId: "...",
    topic: "..."
  }
}
```

### WalletConnect Integration

- Uses Reown's WalletKit SDK
- Supports `eth_sendTransaction` and `eth_signTransaction`
- Session management with persistent storage
- Metadata preserved through signing flow
- Responses sent back to dApps after broadcast

## ⚠️ Important Security Notes

### For Testnet Use

- ✅ Safe to test with Sepolia testnet
- ✅ Use test ETH (no real value)
- ✅ Experiment with all features

### Best Practices

1. **Always backup** recovery phrase (write down, store securely)
2. **Use old phone** as cold wallet (factory reset recommended)
3. **Keep offline** - never connect cold wallet to internet
4. **Verify addresses** - double-check all transaction details
5. **Small tests first** - test with small amounts before large transfers
6. **Physical security** - store cold wallet device safely
7. **Multiple backups** - keep recovery phrase in multiple secure locations

## 🐛 Troubleshooting

### Cold Wallet

**App won't start:**

- Ensure airplane mode is enabled
- Disable WiFi and cellular data
- Restart app

**Camera not working:**

- Grant camera permissions
- Check for good lighting
- Hold QR code steady

**Biometric fails:**

- Verify biometric is set up on device
- Try manual unlock fallback
- Check device security settings

### Hot Wallet

**Can't scan QR:**

- Use HTTPS (required for camera)
- Grant camera permissions
- Ensure good lighting

**Balance shows 0:**

- Wait for blockchain sync (30-60 seconds)
- Pull to refresh
- Verify address is correct
- Check testnet has funds

**WalletConnect fails:**

- Verify Project ID is set
- Check internet connection
- Try new connection URI
- Restart app

## 🤝 Contributing

This is an open-source project. Contributions welcome!

## 📄 License

MIT License - see individual package.json files for details.

## 🙏 Acknowledgments

Built with:

- React Native & Expo
- Ethers.js
- WalletConnect (Reown)
- Vite & React

---

**⚡ Better Wallet - Hardware wallet security with devices you already own**
