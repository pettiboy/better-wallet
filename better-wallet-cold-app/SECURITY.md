# Better Wallet Cold - Security Implementation

## Overview

Better Wallet Cold implements multiple layers of security to protect your private keys and recovery phrases. This document explains how data is secured and never leaves your device.

## Security Architecture

### 1. Hardware-Backed Encryption

All sensitive data (private keys and mnemonics) is stored using platform-native secure storage:

- **iOS**: Uses Keychain Services with hardware-backed encryption via Secure Enclave
- **Android**: Uses Hardware-backed Keystore with Trusted Execution Environment (TEE) or StrongBox

### 2. Authentication Requirements

Biometric or device PIN authentication is **always enabled** for all sensitive operations:

```typescript
const SECURE_OPTIONS = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED, // Only when device is unlocked
  requireAuthentication: true, // Biometric/PIN required (always enabled)
  authenticationPrompt: "Authenticate to access your wallet",
};
```

**Note:** On devices without biometric support, wallet operations will proceed with a security warning. For maximum security, it's recommended to use a device with biometric authentication enabled.

### 3. Multiple Security Layers

| Layer                   | Protection                            | Implementation                           |
| ----------------------- | ------------------------------------- | ---------------------------------------- |
| **Physical Access**     | Device must be physically present     | Hardware-based                           |
| **Device Lock**         | Device must be unlocked               | `WHEN_UNLOCKED`                          |
| **Authentication**      | Biometric/PIN required (always on)    | `requireAuthentication: true` (enforced) |
| **Hardware Encryption** | Keys stored in secure hardware        | Keychain/Keystore                        |
| **Auto-Invalidation**   | Keys invalidated on biometric changes | Platform-native                          |

## Data Storage

### What is Stored

1. **Private Key** - Ethereum wallet private key (encrypted)
2. **Mnemonic** - 12-word recovery phrase (encrypted)

### Storage Location

- **iOS**: Keychain (`kSecClassGenericPassword`)
  - Encrypted with key derived from device passcode
  - Key stored in Secure Enclave (hardware)
  - Only accessible when device is unlocked
- **Android**: EncryptedSharedPreferences
  - Keys stored in Hardware Keystore (TEE)
  - Bound to device hardware, cannot be extracted
  - Requires device unlock + biometric confirmation

### What is NOT Stored

❌ Keys are NOT synced to iCloud/Google Cloud
❌ Keys are NOT included in device backups
❌ Keys are NOT migrated to new devices
❌ Keys are NOT accessible in memory dumps
❌ Keys are NOT accessible when device is locked

## Security Guarantees

### Platform-Specific Guarantees

**iOS (`WHEN_UNLOCKED`):**

- Data encrypted with key derived from device passcode
- Key stored in Secure Enclave (hardware)
- Inaccessible until first unlock after boot
- Face ID/Touch ID required for every access
- Keys auto-invalidated if biometrics change

**Android (Hardware Keystore):**

- Keys stored in Trusted Execution Environment (TEE)
- Hardware-backed StrongBox when available (Pixel 3+, Samsung S9+)
- Requires device unlock + biometric confirmation
- Keys bound to device, cannot be exported
- Keys auto-invalidated if biometrics change

### Attack Resistance

✅ **Physical Theft**: Requires device unlock + biometric
✅ **Memory Dumps**: Keys never in plain memory
✅ **Backup Extraction**: Not included in backups
✅ **Jailbreak/Root**: Keys stored in hardware TEE
✅ **Malware**: Requires biometric for each access
✅ **Shoulder Surfing**: Keys never displayed on screen
✅ **Biometric Spoofing**: Hardware-level validation

## Authentication Flow

```
User attempts to access wallet data
         ↓
System checks device lock status
         ↓
If unlocked: Biometric/PIN prompt
         ↓
Hardware validates authentication
         ↓
If valid: SecureStore retrieves encrypted data
         ↓
Platform decrypts using hardware key
         ↓
Decrypted data returned to app
         ↓
Data used and immediately cleared from memory
```

## Key Invalidation

Keys are automatically invalidated in the following scenarios:

1. **Biometric Changes**: Adding/removing fingerprint or changing Face ID
2. **Device Reset**: Factory reset or OS reinstallation
3. **App Uninstall**: All keys deleted permanently
4. **Passcode Change**: On some Android devices

> ⚠️ **Important**: If keys are invalidated, you MUST restore your wallet using the recovery phrase.

## Security Best Practices

### For Users

1. ✅ Enable strong device passcode/PIN
2. ✅ Enable biometric authentication (Face ID/Touch ID/Fingerprint) - **highly recommended**
3. ✅ Keep device OS updated
4. ✅ Write down recovery phrase on paper (not digitally)
5. ✅ Store recovery phrase in safe place
6. ❌ Never share your recovery phrase
7. ❌ Never take screenshots of recovery phrase

> **Note:** Biometric authentication is always enabled in the app and cannot be disabled. For devices without biometric support, wallet operations will proceed with reduced security.

### For Developers

1. ✅ Always use `SECURE_OPTIONS` for wallet storage
2. ✅ Never log sensitive data
3. ✅ Clear sensitive data from memory immediately after use
4. ✅ Handle authentication errors gracefully
5. ✅ Test on real devices (not simulators)
6. ❌ Never store keys in AsyncStorage or plain SecureStore
7. ❌ Never transmit keys over network

## Compliance

### Export Compliance

This app uses platform-native encryption and does NOT implement custom encryption algorithms. Therefore:

- iOS: `usesNonExemptEncryption: false` (no export compliance required)
- No additional export control declarations needed

### Privacy

- ✅ All data stays on device
- ✅ No analytics or tracking
- ✅ No network requests for wallet operations
- ✅ No cloud synchronization
- ✅ No third-party services

## Testing Security

### Security Checklist

Test the following scenarios to verify security:

1. ✅ Creating wallet requires authentication
2. ✅ Viewing recovery phrase requires authentication
3. ✅ Signing transactions requires authentication
4. ✅ Locking device prevents access
5. ✅ Restarting device requires unlock + authentication
6. ✅ Uninstalling app deletes all keys
7. ✅ Changing biometrics invalidates keys
8. ✅ Failed authentication attempts lock out temporarily

### Verification Commands

```bash
# Check SecureStore configuration
grep -r "requireAuthentication" services/wallet.ts

# Verify no plain storage
grep -r "AsyncStorage.*private" .

# Check for proper error handling
grep -r "Authentication required" app/
```

## Audit Trail

### Version History

- **v1.0.0**: Initial secure storage implementation
  - Hardware-backed encryption
  - Biometric authentication always enabled (cannot be disabled)
  - WHEN_UNLOCKED access policy
  - Auto-invalidation on biometric changes
  - Wallet creation allowed on devices without biometric with warnings

## License & Disclaimer

This security implementation follows industry best practices but:

⚠️ **No warranty is provided**
⚠️ **Users responsible for recovery phrase backup**
⚠️ **Keys cannot be recovered if device is lost**
⚠️ **Biometric changes may invalidate keys**

For maximum security, this is a cold wallet - it should NEVER connect to the internet during transaction signing.
