# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Platform does not support secure random numbers" Error

**Error Message:**

```
Error: platform does not support secure random numbers (operation="randomBytes", code=UNSUPPORTED_OPERATION, version=6.15.0)
```

**Cause:**
Ethers.js v6 requires a secure random number generator that's not available by default in React Native environments.

**Solution:**
✅ **FIXED** - The app now includes the necessary polyfills:

- `react-native-get-random-values` - Provides secure random number generation
- `expo-crypto` - Fallback for additional crypto operations

These are automatically imported at the app's entry point (`app/_layout.tsx`).

**If you still see this error:**

1. Ensure packages are installed: `npm install`
2. Restart Metro bundler: `npm start` (or `r` in the terminal)
3. Clear cache: `npm start -- --clear`

---

### 2. QR Code Won't Scan

**Symptoms:**

- Camera opens but doesn't detect QR code
- QR code scans but shows "Invalid QR code" error

**Solutions:**

**For scanning issues:**

- Ensure good lighting
- Hold phone steady at 6-12 inches from QR code
- Try adjusting the distance and angle
- Verify camera permissions are granted

**For invalid QR errors:**

- Make sure you're scanning the correct QR code (address vs transaction)
- On cold wallet: scan the **unsigned transaction** QR from hot wallet
- On hot wallet setup: scan the **address** QR from cold wallet
- On hot wallet send: scan the **signed transaction** QR from cold wallet

---

### 3. Camera Permission Denied

**Error:** "Camera permission is required to scan QR codes"

**Solution:**

1. iOS: Settings → Better Wallet → Camera → Enable
2. Android: Settings → Apps → Better Wallet → Permissions → Camera → Allow

Then restart the app.

---

### 4. Balance Shows 0 After Getting Testnet ETH

**Symptoms:**

- Received testnet ETH from faucet
- Balance still shows 0.0 ETH

**Solutions:**

1. **Wait longer** - Testnet transactions can take 1-5 minutes
2. **Pull to refresh** - Swipe down on the balance screen
3. **Check the faucet** - Verify it actually sent funds (check confirmation)
4. **Verify address** - Ensure you copied the correct address
5. **Check network** - Make sure you're connected to the internet on hot wallet
6. **View on explorer** - Check https://sepolia.etherscan.io/address/YOUR_ADDRESS

---

### 5. Transaction Failed to Broadcast

**Error:** "Failed to broadcast transaction"

**Possible Causes & Solutions:**

**Insufficient Balance:**

- Check you have enough ETH for both the transfer amount AND gas fees
- Get more test ETH from a Sepolia faucet

**Network Issues:**

- Verify hot wallet has internet connection
- Try switching WiFi networks or using mobile data
- Wait a moment and try again

**Invalid Signed Transaction:**

- Ensure you scanned the complete QR code
- Try signing the transaction again on cold wallet
- Verify the cold wallet properly signed the transaction

---

### 6. App Crashes on Startup

**Solutions:**

1. **Clear app data:**

   - iOS: Delete and reinstall app
   - Android: Settings → Apps → Better Wallet → Storage → Clear Data

2. **Update Expo Go:**

   - Check for updates in App Store / Play Store

3. **Clear Metro cache:**

   ```bash
   npm start -- --clear
   ```

4. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### 7. "No wallet address found" on Hot Wallet

**Cause:** Hot wallet setup wasn't completed properly

**Solution:**

1. Delete app data or reinstall
2. Start fresh with setup:
   - Device B (Cold): Set up as Cold Wallet first
   - Device B: Show address QR code
   - Device A (Hot): Set up as Hot Wallet
   - Device A: Scan the address QR from Device B

---

### 8. Lost Recovery Phrase

**Unfortunately:** If you lost your 12-word recovery phrase and don't have access to the cold wallet device, **your funds are permanently lost**. This is the same as with hardware wallets.

**Prevention:**

- Write down your recovery phrase immediately after wallet creation
- Store it in multiple secure locations
- Never store it digitally (no photos, no cloud storage)
- Consider using a metal backup for long-term storage

---

### 9. Metro Bundler Won't Start

**Error:** Port already in use or bundler fails to start

**Solutions:**

1. Kill existing Metro processes:

   ```bash
   # macOS/Linux
   killall node

   # Windows
   taskkill /F /IM node.exe
   ```

2. Start on different port:

   ```bash
   npm start -- --port 8082
   ```

3. Check for firewall/antivirus blocking:
   - Temporarily disable and retry
   - Add exception for Metro bundler

---

### 10. Expo Go Shows "Unable to connect to development server"

**Solutions:**

1. **Ensure same WiFi network:**

   - Both computer and phone must be on same network
   - Corporate/hotel WiFi may block device communication

2. **Use tunnel mode:**

   ```bash
   npm start -- --tunnel
   ```

3. **Use physical connection:**
   ```bash
   npm run ios    # For iOS
   npm run android # For Android
   ```

---

## Development Issues

### TypeScript Errors

**Clear TypeScript cache:**

```bash
rm -rf node_modules/.cache
npm start -- --clear
```

### Linting Errors

**Run linter:**

```bash
npm run lint
```

**Fix auto-fixable issues:**

```bash
npx eslint . --fix
```

---

## Testing on Physical Devices

### iOS Issues

**"Unable to install" error:**

1. Trust developer certificate: Settings → General → Device Management
2. Ensure device is in developer mode
3. Try deleting existing app first

### Android Issues

**"Installation failed" error:**

1. Enable USB debugging in Developer Options
2. Allow installation from this source
3. Check storage space available

---

## Network & RPC Issues

### Slow Balance Loading

**Solutions:**

1. The default Sepolia RPC might be slow
2. Try alternative RPC in `services/ethereum.ts`:
   ```typescript
   const SEPOLIA_RPC = "https://rpc2.sepolia.org";
   // or
   const SEPOLIA_RPC = "https://ethereum-sepolia.publicnode.com";
   ```

### RPC Endpoint Down

**Check RPC status:**

- Visit https://chainlist.org/chain/11155111
- Try alternative endpoints from the list

---

## Getting Help

### Still Having Issues?

1. **Check documentation:**

   - README.md - Complete user guide
   - QUICKSTART.md - Setup walkthrough

2. **Review implementation:**

   - IMPLEMENTATION_SUMMARY.md - Technical details
   - Check inline code comments

3. **Debug mode:**

   - Enable React Native debugger
   - Check console logs for detailed errors

4. **Report issues:**
   - Provide error messages
   - Describe steps to reproduce
   - Include device/OS information

---

## Emergency Recovery

### Cold Wallet Device Lost/Broken

**If you have your recovery phrase:**

1. Get a new device
2. Install the app
3. Set up as cold wallet
4. Use recovery import feature (if implemented)
5. Or restore using the 12-word phrase in any compatible wallet

**If you don't have your recovery phrase:**

- Unfortunately, funds are permanently lost
- This is the security tradeoff of self-custody

### Hot Wallet Issues

Good news! The hot wallet only stores the watch-only address. You can:

1. Reinstall the app
2. Set up as hot wallet again
3. Scan the address QR from your cold wallet
4. All funds are safe as long as cold wallet is secure

---

## Best Practices to Avoid Issues

1. ✅ **Always backup recovery phrase** immediately after wallet creation
2. ✅ **Test with small amounts** before using larger values
3. ✅ **Keep cold wallet offline** - never connect to internet
4. ✅ **Verify addresses** before sending transactions
5. ✅ **Update apps regularly** for security patches
6. ✅ **Use strong device passwords/biometrics**
7. ✅ **Keep devices physically secure**

---

**Last Updated:** After fixing crypto polyfill issue
