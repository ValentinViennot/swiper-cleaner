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

## License

This project is provided under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

- Originally forked from [Skipperlla/rn-swiper-list](https://github.com/Skipperlla/rn-swiper-list)
- Dev container based on [thyrlian/android-sdk-vnc](https://hub.docker.com/r/thyrlian/android-sdk-vnc/)
