# Swiper Cleaner

A React Native mobile app that helps BlueSky users efficiently manage their posts and reposts through a Tinder-like swiping interface.
Built with Expo, this app enables quick review and cleanup of your BlueSky content.

## Features

- **Secure Authentication**: Direct connection to BlueSky using app passwords
- **Intuitive Swipe Controls**:
  - 👈 Left: Delete post/repost
  - 👉 Right: Keep post (no action)
  - 👆 Up: Repost now
  - 👋 Down: Snooze (move to end of queue)
- **Smart Review System**:
  - Configurable review intervals
  - Option to include/exclude reposts
  - Progress tracking across sessions
- **Privacy-Focused**:
  - No backend server
  - Direct API integration
  - Local storage only
- **Developer-Friendly**:
  - Ready-to-use Dev Container
  - Complete TypeScript support
  - Hot reload enabled

## Prerequisites

- Node.js (version 18 or higher recommended)
- Docker (if using the Dev Container)
- BlueSky account and app password

## Running the App

1. Install dependencies:

   ```bash
   yarn
   ```

2. Start the Metro bundler:

   ```bash
   yarn start
   ```

3. Run on your preferred platform:
   ```bash
   yarn run android  # For Android
   yarn run ios      # For iOS (macOS only)
   ```

## Using the Dev Container

This project includes a Dev Container configuration with:

1. Android SDK and platform tools
2. Node.js & Yarn
3. Watchman for file watching

To use with VS Code:

1. Install the "Dev Containers" extension
2. Open the folder in VS Code
3. When prompted, select "Reopen in Container"
4. Wait for container initialization and dependency installation

For physical device testing over WiFi, see [.devcontainer/README.md](.devcontainer/README.md).

## Project Structure

- `src/`
  - `App.tsx` – Main application component
  - `components/` – UI components (MemoizedCard, ActionButton, etc.)
  - `services/` – BlueSky API integration
  - `styles/` – Styled components and theme
  - `types/` – TypeScript definitions
- `.devcontainer/` – Development environment configuration
- `App.js` – Entry point

## Releasing

Follow this guide: https://docs.expo.dev/guides/local-app-production

### Releasing for Android

- Fetch the keystore from Vaultwarden. Place the file in `android/app/`.
- Edit `~/.gradle/gradle.properties` to add the keystore password:
  ```ini
  SWIPER_CLEANER_UPLOAD_STORE_FILE=swiper-cleaner-upload-key.keystore
  SWIPER_CLEANER_UPLOAD_KEY_ALIAS=swiper-cleaner-key
  SWIPER_CLEANER_UPLOAD_STORE_PASSWORD=******
  SWIPER_CLEANER_UPLOAD_KEY_PASSWORD=******
  ```

```bash
rm ./android/app/build/outputs/bundle/release/app-release.aab
cd android
./gradlew app:bundleRelease
cd -
open ./android/app/build/outputs/bundle/release/
```

This will have created `app-release.aab` in `android/app/build/outputs/bundle/release/` directory.

- [Create a new alpha/internal release](https://play.google.com/console/u/0/developers/9150193425219657230/app/4975439535227823261/tracks/4701409895824290687/create)

### Releasing for iOS

Open Xcode:

```bash
xed ios
```

- Select the target "Swipercleaner" and click on the play button.
- Menubar: Product > Archive
- Select "Swipercleaner" and click on "Distribute App"

## License

This project is provided under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

- Originally forked from [Skipperlla/rn-swiper-list](https://github.com/Skipperlla/rn-swiper-list)
- Dev container based on [thyrlian/android-sdk-vnc](https://hub.docker.com/r/thyrlian/android-sdk-vnc/)
