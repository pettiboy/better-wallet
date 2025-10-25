# WalletConnect Quick Start Guide

## Prerequisites

1. Two devices with the Better Wallet app installed
2. One device set up as Cold Wallet (with private key)
3. One device set up as Hot Wallet (watching the cold wallet address)
4. WalletConnect Project ID from https://cloud.reown.com

## Step 1: Get WalletConnect Project ID

1. Visit https://cloud.reown.com
2. Sign up or log in
3. Click "Create Project"
4. Enter project details:
   - Name: "BetterWallet" (or your choice)
   - Home page URL: Can use placeholder
5. Copy the Project ID

## Step 2: Configure the App

1. In the `better-wallet-app` directory, create a `.env` file:

```bash
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_copied_project_id
```

2. Restart the Expo development server:

```bash
npm start
```

3. Reload the app on both devices

## Step 3: Connect to a Test dApp

### Option A: Use WalletConnect Test dApp

1. On your computer, visit: https://react-app.walletconnect.com
2. Click "Connect Wallet"
3. Select "WalletConnect"
4. A QR code will appear

### Option B: Use Sepolia Testnet Uniswap

1. Visit Uniswap on Sepolia testnet
2. Click "Connect Wallet"
3. Look for WalletConnect option
4. QR code will appear

## Step 4: Connect Hot Wallet to dApp

### Method 1: Scan QR Code (Recommended)

1. On Hot Wallet device, open the app
2. Tap "Connect to dApps"
3. Tap "Scan QR Code"
4. Scan the WalletConnect QR code from your computer
5. Review the connection request
6. Tap "Approve"

### Method 2: Copy/Paste URI

1. On the dApp, click "Copy to Clipboard" under the QR code
2. On Hot Wallet device, tap "Connect to dApps"
3. Paste the URI in the text field
4. Tap "Connect"
5. Review and approve the connection

## Step 5: Sign Your First dApp Transaction

### On the dApp:

1. Initiate a transaction (e.g., send ETH, swap tokens)
2. The transaction request will be sent to your hot wallet

### On Hot Wallet:

1. You'll see the transaction request pop up
2. Review the dApp name and transaction details
3. An unsigned transaction QR code will be displayed

### On Cold Wallet:

1. Open the app
2. Tap "Sign Transaction"
3. Scan the QR code from the hot wallet
4. **Notice the new information:**
   - "📱 dApp Request" badge
   - dApp name and URL
   - Complete transaction details
5. Review carefully
6. Tap "Sign Transaction"
7. A signed transaction QR code appears

### Back on Hot Wallet:

1. Tap "Scan Signed Transaction"
2. Scan the QR code from cold wallet
3. Transaction is automatically:
   - Broadcasted to the network
   - Confirmed back to the dApp
4. The dApp will show success!

## Verification Checklist

✅ Hot wallet shows "Connect to dApps" button
✅ Can scan/paste WalletConnect URI
✅ Connection request shows dApp details
✅ Can approve/reject connections
✅ Transaction request generates QR code
✅ Cold wallet shows dApp information
✅ Signed transaction includes metadata
✅ dApp receives transaction confirmation
✅ Can view connected dApps list
✅ Can disconnect from dApps

## Troubleshooting

### "WalletKit not initialized"

- Check that EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID is set
- Restart the Expo server
- Reload the app

### "Pairing failed"

- Ensure WalletConnect URI is complete (starts with "wc:")
- Try copying the URI again
- Check internet connection on hot wallet

### "Unsupported method"

- Some dApps may use methods not yet supported
- Currently supports: eth_sendTransaction, eth_signTransaction
- Check console for method name

### Connection times out

- WalletConnect URIs expire after a few minutes
- Generate a new QR code on the dApp
- Try the connection again

### dApp doesn't receive response

- Ensure the signed transaction was scanned correctly
- Check that the hot wallet has internet connection
- Look for error messages in the app

## Testing Tips

1. **Start Simple**: Use the WalletConnect test dApp first
2. **Use Testnet**: Always test with Sepolia testnet (free test ETH)
3. **Small Amounts**: Start with small test transactions
4. **Review Carefully**: Always verify dApp name and URL on cold wallet
5. **Stay Connected**: Keep hot wallet online during dApp interaction

## Security Reminders

⚠️ **Cold Wallet Security:**

- Cold wallet stays offline (except for app updates)
- Never enter private key anywhere
- Always verify dApp information before signing
- Review ALL transaction details

⚠️ **Hot Wallet Security:**

- Only connect to trusted dApps
- Review connection requests carefully
- Disconnect when done
- Monitor active sessions

⚠️ **General Security:**

- Double-check recipient addresses
- Verify transaction amounts
- Be cautious of unknown dApps
- Never sign blank or suspicious transactions

## What's Next?

After successful testing:

1. **Try More dApps:**

   - DEXs (Uniswap, SushiSwap)
   - NFT marketplaces (OpenSea testnet)
   - DeFi protocols (Aave testnet)

2. **Explore Features:**

   - Multiple concurrent connections
   - Session management
   - Manual transactions alongside dApp transactions

3. **Production Use:**
   - Get testnet ETH from faucet
   - Thoroughly test all features
   - Consider security audits before mainnet use

## Support

For issues or questions:

- Check the main README.md
- Review WALLETCONNECT_IMPLEMENTATION.md
- Check WalletConnect docs: https://docs.reown.com
- Review transaction serializer implementation

## Success! 🎉

You now have a fully functional 2-device wallet with WalletConnect support! Your private keys stay safe on the offline cold wallet while you interact with the entire Ethereum dApp ecosystem.
