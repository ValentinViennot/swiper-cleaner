# Swiper Cleaner

A React Native project built with Expo that enables swipe interactions (left, right, up, down) on a list of images. This project uses Dev Containers to provide a consistent development environment for React Native, including Android tooling and Watchman.

## Table of Contents

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Installation and Setup](#installation-and-setup)
4. [Running the App](#running-the-app)
5. [Using the Dev Container](#using-the-dev-container)
6. [Project Structure](#project-structure)
7. [License](#license)

## Features

- Swipeable card list built on React Native & Expo.  
- Customizable swipe gestures (up, down, left, right).  
- Visual overlays for diverse swipe directions.  
- Ready-to-use Dev Container for local development.  

## Prerequisites

- Node.js (version 18 or higher recommended)
- Expo CLI (optional but recommended for local testing):  
  npm install -g expo-cli
- Docker (if using the Dev Container)

## Running the App

1. Start the Metro bundler:  
   npm run start

2. To run on an Android device or emulator:  
   npm run android

3. To run on an iOS simulator (macOS only):  
   npm run ios

(You can also use expo start, expo start --android, etc., if you have Expo CLI installed globally.)

## Using the Dev Container

This project includes configuration for a Dev Container (in .devcontainer/) with the following features:

1. Android SDK and platform tools  
2. Node.js & Yarn  
3. Watchman for file watching  

Steps to use the Dev Container in VS Code:

1. Install the “Dev Containers” extension.  
2. Open the folder in VS Code.  
3. When prompted, “Reopen in Container” to build and enter the Dev Container.  
4. The container initialization will install dependencies and set up your environment for development.  

Optional: You can connect a physical Android device over Wi-Fi by following the instructions in [.devcontainer/README.md](.devcontainer/README.md) (e.g., enabling TCP/IP with adb, identifying the device IP, executing adb connect, etc.).

## Project Structure

- src/  
  - App.tsx – Main application component.  
  - components/ – Reusable UI components (e.g., ActionButton).  
- .devcontainer/  
  - Dockerfile, devcontainer.json – Container configuration.  
  - postCreateCommand.sh – Runs after the container is built, installing dependencies and tooling.  
- App.js – Entry point for the React Native application, importing the src/App.tsx file.  
- package.json – Node/Expo scripts and dependencies.

## License

This project is provided under the MIT License. See [LICENSE](LICENSE) for details.

Originally forked from [Skipperlla/rn-swiper-list](https://github.com/Skipperlla/rn-swiper-list).
Dev container forked from [thyrlian/android-sdk-vnc](https://hub.docker.com/r/thyrlian/android-sdk-vnc/).
