# Better Wallet - Cold Storage

A secure, offline-only Ethereum cold wallet with hardware-backed encryption and biometric authentication.

## 🔒 Security Features

- **Hardware-Backed Encryption**: Keys stored in iOS Secure Enclave / Android Hardware Keystore
- **Biometric Authentication**: Face ID / Touch ID / Fingerprint required for all access
- **Device-Lock Protection**: Data only accessible when device is unlocked
- **Auto-Invalidation**: Keys automatically invalidated if biometrics change
- **No Cloud Sync**: All data stays on device, never backed up or synced
- **Offline-Only**: No internet connectivity required or used
- **Import/Create**: Create new wallet or import existing via 12-word recovery phrase

See [SECURITY.md](./SECURITY.md) for detailed security documentation.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

---

## Build APK

```zsh
npx expo prebuild
cd android
./gradlew assembleRelease
```

OR

(optional)

```zsh
eas prebuild
```

very slow

```zsh
eas build --platform android --local
```

## Install on device

after apk ready

```zsh
adb devices              # verify phone
adb -s <DEVICE_ID> install ./name.apk   # install
```
