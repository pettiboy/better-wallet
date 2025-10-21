# Better Wallet - Air-Gapped Hardware Wallet

Transform any old smartphone into a secure, air-gapped hardware wallet using QR codes for transaction signing.

## 🔐 Concept

This app provides a dual-mode wallet system that mimics hardware wallets like Ledger or Keystone:

- **Device A (Hot Wallet - Main Phone)**: Connects to the blockchain, constructs transactions, and broadcasts signed transactions
- **Device B (Cold Wallet - Old Phone)**: Stores private keys offline, signs transactions, never connects to the internet

Communication between devices happens exclusively through QR codes, ensuring the signing device remains air-gapped.

## 🚀 Features

### Cold Wallet Mode (Device B)

- Generate and securely store Ethereum private keys using expo-secure-store
- Display wallet address as QR code for hot wallet setup
- Scan unsigned transactions from hot wallet
- Sign transactions offline with visual confirmation
- View and backup recovery phrase (mnemonic)
- Offline indicator and security warnings

### Hot Wallet Mode (Device A)

- Import watch-only address from cold wallet via QR code
- View wallet balance (Sepolia testnet)
- Construct unsigned transactions with recipient address and amount
- Display unsigned transaction as QR code
- Scan signed transaction from cold wallet
- Broadcast transactions to Ethereum network
- Transaction history and confirmation

## 📋 Prerequisites

- Node.js 20.x or higher
- Expo CLI
- Two iOS/Android devices (one for hot wallet, one for cold wallet)
- Camera permissions on both devices

## 🛠️ Installation

1. Install dependencies:

```bash
cd better-wallet-app
npm install
```

2. Start the Expo development server:

```bash
npm start
```

3. Build and install on both devices:

```bash
# For iOS
npm run ios

# For Android
npm run android
```

## 📱 Setup Guide

### Setting Up Device B (Cold Wallet)

1. Launch the app on your old phone (the one you'll keep offline)
2. Select **"Cold Wallet"** on the setup screen
3. The app will generate a new Ethereum wallet
4. **IMPORTANT**: Write down and safely store the recovery phrase shown in Settings
5. Display your wallet address QR code for Device A to scan
6. **Turn off WiFi/cellular** - keep this device offline from now on

### Setting Up Device A (Hot Wallet)

1. Launch the app on your main phone
2. Select **"Hot Wallet"** on the setup screen
3. Scan the wallet address QR code from Device B
4. Your hot wallet is now connected and can view balance

## 💸 Sending Transactions

### Step 1: Create Transaction (Device A - Hot Wallet)

1. Navigate to the "Send" tab
2. Enter recipient address (0x...)
3. Enter amount in ETH
4. Tap "Create Transaction"
5. An unsigned transaction QR code will appear

### Step 2: Sign Transaction (Device B - Cold Wallet)

1. Open the cold wallet app
2. Tap "Sign Transaction"
3. Scan the unsigned transaction QR from Device A
4. Review transaction details carefully
5. Tap "Sign Transaction"
6. A signed transaction QR code will appear

### Step 3: Broadcast Transaction (Device A - Hot Wallet)

1. On the hot wallet, tap "Scan Signed Transaction"
2. Scan the signed transaction QR from Device B
3. Tap "Broadcast" to send to the network
4. Transaction hash will be displayed

## 🔒 Security Considerations

### Critical Security Practices

1. **Device B (Cold Wallet)**:

   - Never connect to the internet after setup
   - Keep in airplane mode at all times
   - Store in a secure location when not in use
   - Only use for signing transactions

2. **Recovery Phrase**:

   - Write down the 12-word recovery phrase
   - Store in a secure, offline location
   - Never share with anyone
   - Never enter into websites or other apps

3. **Transaction Review**:
   - Always verify recipient address on cold wallet screen
   - Confirm transaction amount before signing
   - Never sign transactions you didn't initiate

### Network Configuration

- Currently configured for **Sepolia testnet** (safe for testing)
- To use mainnet, update `DEFAULT_RPC` and `DEFAULT_CHAIN_ID` in `services/ethereum.ts`
- **Warning**: Only use mainnet after thorough testing

## 🧪 Testing on Sepolia Testnet

1. Get your wallet address from Device B
2. Visit a Sepolia faucet to get test ETH:
   - https://sepoliafaucet.com/
   - https://www.infura.io/faucet/sepolia
3. Wait for funds to arrive (check balance in hot wallet)
4. Test sending transactions between addresses

## 🏗️ Architecture

### Core Services

- **`services/wallet.ts`**: Private key generation, storage, and transaction signing
- **`services/ethereum.ts`**: Blockchain interaction, balance fetching, transaction construction

### Components

- **`QRDisplay.tsx`**: Displays data as QR codes
- **`QRScanner.tsx`**: Scans and parses QR codes
- **`DeviceModeContext.tsx`**: Manages hot/cold/setup mode state

### Screens

**Cold Wallet:**

- `app/cold/sign.tsx` - Transaction signing flow
- `app/cold/settings.tsx` - Address display and recovery phrase

**Hot Wallet:**

- `app/hot/home.tsx` - Balance and wallet overview
- `app/hot/send.tsx` - Transaction creation and broadcasting

## 🔧 Customization

### Switching to Mainnet

Edit `services/ethereum.ts`:

```typescript
const MAINNET_RPC = "https://eth.llamarpc.com";
const DEFAULT_RPC = MAINNET_RPC;
const DEFAULT_CHAIN_ID = 1; // Ethereum Mainnet
```

### Adding More Chains

1. Add RPC endpoint in `services/ethereum.ts`
2. Update chain ID
3. Optionally add chain selector in UI

## 📦 Dependencies

- **ethers**: Ethereum wallet and transaction handling
- **expo-secure-store**: Secure private key storage
- **expo-camera**: QR code scanning
- **react-native-qrcode-svg**: QR code generation
- **@react-native-async-storage/async-storage**: Device mode persistence

## ⚠️ Limitations

- Currently supports ETH transfers only (no ERC-20 tokens or smart contract interactions)
- Single-signature only (not multi-sig)
- Sepolia testnet by default
- Manual QR code scanning (no automatic detection)

## 🛣️ Roadmap

- [ ] ERC-20 token support
- [ ] Multiple blockchain support (Bitcoin, Solana)
- [ ] Smart contract interaction
- [ ] Advanced gas fee configuration
- [ ] Transaction history on hot wallet
- [ ] Multiple wallet accounts
- [ ] WalletConnect integration

## 📄 License

This is a proof-of-concept application. Use at your own risk.

## 🙏 Acknowledgments

Inspired by hardware wallets like Ledger, Trezor, and Keystone.

---

**Remember**: This turns your old phone into a hardware wallet. Treat it with the same security as you would a physical hardware wallet device.
