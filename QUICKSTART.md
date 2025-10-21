# Better Wallet - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites

- Two smartphones (iOS or Android)
- Node.js 20.x+ installed
- Expo Go app installed on both phones

### Step 1: Install and Run (2 minutes)

```bash
cd better-wallet-app
npm install
npm start
```

Scan the QR code with Expo Go on both devices.

### Step 2: Setup Cold Wallet (Device B - Old Phone) (1 minute)

1. Open app on Device B
2. Tap **"Cold Wallet"** (🔒 icon)
3. App generates wallet automatically
4. **CRITICAL**: Go to Settings tab and backup your 12-word recovery phrase
5. **Turn OFF WiFi and cellular data** - keep this device offline

### Step 3: Setup Hot Wallet (Device A - Main Phone) (1 minute)

1. Open app on Device A
2. Tap **"Hot Wallet"** (📱 icon)
3. Device B: Show Address QR (in Settings or home screen)
4. Device A: Scan the QR code
5. Done! You'll see your wallet balance (0 ETH on Sepolia testnet)

### Step 4: Get Test ETH (1 minute)

1. Copy your wallet address from Device A
2. Visit https://sepoliafaucet.com/
3. Paste address and request test ETH
4. Wait 30-60 seconds
5. Pull down to refresh balance on Device A

### Step 5: Send Your First Transaction (2 minutes)

**On Device A (Hot Wallet):**

1. Tap "Send Transaction"
2. Enter a recipient address (can use your own for testing)
3. Enter amount (e.g., 0.001 ETH)
4. Tap "Create Transaction"
5. A QR code appears

**On Device B (Cold Wallet):**

1. Tap "Sign Transaction"
2. Scan the QR code from Device A
3. Review transaction details
4. Tap "Sign Transaction"
5. A new QR code appears

**Back on Device A (Hot Wallet):**

1. Tap "Scan Signed Transaction"
2. Scan the QR code from Device B
3. Transaction broadcasts automatically
4. View transaction on Sepolia Etherscan

## ✅ Success!

You've just completed a secure, air-gapped transaction without your private keys ever touching the internet!

## 🔐 Security Reminders

- ✅ Keep Device B (cold wallet) offline at all times
- ✅ Backup your recovery phrase and store it safely
- ✅ Never share your recovery phrase with anyone
- ✅ This is Sepolia testnet - safe for testing
- ⚠️ Don't use mainnet until you've thoroughly tested

## 🆘 Troubleshooting

### QR Code Won't Scan

- Ensure good lighting
- Hold phone steady
- Try adjusting distance
- Check camera permissions

### Balance Shows 0 After Faucet

- Wait a bit longer (can take up to 5 minutes)
- Pull down to refresh
- Check faucet actually sent funds
- Verify you copied correct address

### Transaction Failed

- Ensure you have enough balance
- Check gas estimation
- Verify recipient address is valid
- Make sure Device A has internet connection

### App Crashes or Freezes

- Restart the app
- Check Expo Go is up to date
- Clear cache and restart

## 📚 Next Steps

- Read the full README.md for detailed documentation
- Explore cold wallet settings
- Try multiple transactions
- Learn about recovery phrase backup
- Test wallet recovery on a third device

## 🎯 What You've Built

You now have:

- ✅ Secure private key storage (cold wallet)
- ✅ Air-gapped transaction signing
- ✅ Blockchain connectivity (hot wallet)
- ✅ QR-based secure communication
- ✅ Full control of your crypto

This is the same security model used by hardware wallets like Ledger and Trezor, but using devices you already own!

## ⚡ Pro Tips

1. **Use an old phone**: Any old smartphone works as a cold wallet
2. **Factory reset**: Consider factory resetting the old phone before use
3. **Physical security**: Store cold wallet device in a safe place
4. **Multiple backups**: Keep recovery phrase in multiple secure locations
5. **Test small amounts**: Always test with small amounts first

---

**Congratulations!** You're now using an air-gapped hardware wallet system. 🎉
