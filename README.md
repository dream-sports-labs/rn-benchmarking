# RN Benchmarking

A toolkit to benchmark the performance of different React Native versions using a sample app.
Supports both Old and New Architecture, with manual and automated testing.

## Table of Contents

- [Prerequisite](#prerequisite)
- [Setup](#Setup)
  - [Benchmarking Old Architecture](#benchmarking-old-architecture)
      - [Android](#android)
      - [iOS](#iOS)
  - [Benchmarking New Architecture](#benchmarking-new-architecture)
      - [Android](#android)
      - [iOS](#iOS)
  - [Automation](#automation)
  - [Motivation & References](#motivation--references)
  - [Webpage](#webpage)
  - [Demo](#demo)

## Prerequisite

1. **[React Native Environment Setup](https://reactnative.dev/docs/next/environment-setup)**  
   Make sure your local dev environment is configured for React Native.

2. **[Maestro Setup](https://maestro.mobile.dev/)**  
   To verify if Maestro is installed, run:
   ```bash
   maestro --version

## Setup

```
git clone https://github.com/dream-sports-labs/rn-benchmarking.git
cd Benchamrking
yarn install
```

---

## Benchmarking Old Architecture

### Android:

1. Make sure the Old Architecture is enabled before running benchmarks.
2. Open `android/gradle.properties` and set: **newArchEnabled=false**
3. Run app using `yarn android`.
4. Benchmarking results will be stored in the emulator's ExternalDirectoryPath:  `/storage/emulated/0/Android/data/com.benchamrking/files/oldarch.json`
5. You can run benchmarks manually (by interacting with the app) or use automation scripts for faster and consistent results. 
   ➤ See [Manual Benchmarking & Web Panel Setup](#manual-benchmarking--web-panel-setup) and [Automation](#automation) for details.


### iOS:

1. Make sure the Old Architecture is enabled before running benchmarks.
2. Run the following command to enable old architecture:
   ```
   cd ios
   export NO_FLIPPER=1 && bundle install && bundle exec pod install
   rm -rf build
   ```
3. Start the app using: `yarn ios`.
4. Benchmarking results will be stored in the app's `DocumentDirectoryPath`.
5. To access the app’s document directory, run:
   ```
   open $(xcrun simctl get_app_container booted com.benchamrking data)
   ```
6. After opening the directory, you'll find the benchmarking results under: `Documents/oldarch.json`.
7. You can run benchmarks manually (by interacting with the app) or use automation scripts for faster and consistent results.
   ➤ See [Manual Benchmarking & Web Panel Setup](#manual-benchmarking--web-panel-setup) and [Automation](#automation) for details.

---

## Benchmarking New Architecture

### Android:

1. Make sure the New Architecture is enabled before running benchmarks.
2. Open `android/gradle.properties` and set: **newArchEnabled=true**
3. Run app using `yarn android`.
4. Benchmarking results will be stored in the emulator's ExternalDirectoryPath: **/storage/emulated/0/Android/data/com.benchamrking/files/newarch.json**
5. You can run benchmarks manually or use automation scripts for faster and consistent results.
   ➤ See [Manual Benchmarking & Web Panel Setup](#manual-benchmarking--web-panel-setup) and [Automation](#automation) for details.

### iOS:

1. Make sure the New Architecture is enabled before running benchmarks.
2. Run the following command to enable new architecture.
   ```
   cd ios
   export NO_FLIPPER=1 && bundle install && RCT_NEW_ARCH_ENABLED=1 bundle exec pod install
   rm -rf build
   ```
3. Run app using `yarn ios`.
4. Benchmarking results will be stored in the app's DocumentDirectoryPath. 
5. To access the app’s document directory, run:
   ```
   open $(xcrun simctl get_app_container booted com.benchamrking data)
   ```
6. After opening the directory, you'll find the benchmarking results under: `Documents/newarch.json`.
7. You can run benchmarks manually (by interacting with the app) or use automation scripts for faster and consistent results.
   ➤ See [Manual Benchmarking & Web Panel Setup](#manual-benchmarking--web-panel-setup) and [Automation](#automation) for details.

---

## Manual Benchmarking & Web Panel Setup
You can also collect benchmarking data manually by interacting with the app.
1. Run the app using:
   ```
   yarn android
   # or
   yarn ios
   ```
2. In the app, tap on:
   - View, Text, or Images buttons (as needed)
   - Then tap on the Get Report button
3.Manual Web Panel Setup
   1. Copy the generated report file from the respective emulator/simulator path:
      - Android Old Arch:
        `/storage/emulated/0/Android/data/com.benchamrking/files/oldarch.json`
      - Android New Arch:
        `/storage/emulated/0/Android/data/com.benchamrking/files/newarch.json`
   2. iOS Old/New Arch:
      - Run: `open $(xcrun simctl get_app_container booted com.benchamrking data)`
      - Then look in: `Documents/oldarch.json` or `Documents/newarch.json`
4. Paste the report(s) into:
`WebpageRevamped/src/Reports/<version>/<platform>/`
Example: WebpageRevamped/src/Reports/0.73.0/android/oldarch.json
5. Add the React Native version to the supported versions list: WebpageRevamped/src/supportedVersions.json


## Automation

1. Manually clicking buttons to collect benchmarking numbers can be tedious and error-prone. 
2. To simplify this process, we provide automation scripts that handle benchmarking for you. 
3. These scripts help gather performance data such as:
    - Time taken to render N views, texts, and image components 
4. Run the following commands to get rendering times (tested on Android Emulator & iOS Simulator):
   ```
   yarn get:numbers:android <ITERATION_COUNT>
   /* Example: yarn get:numbers:android 10 */
   yarn get:numbers:ios <ITERATION_COUNT>
   /* Example: yarn get:numbers:ios 10 */
   ```
5. The command sometimes might cause an error when processing 5,000 images because Maestro might encounter performance issues due to the high volume of data, leading to timeouts or the app becoming unresponsive while attempting to load and render the images.
   
NOTE: 
1. After running automation scripts the benchmarking numbers can be found under **WebpageRevamped/src/Reports** directory. 
2. So, if we are benchmarking for react-native version 0.73.5 the rendering benchmarking numbers will be found under **WebpageRevamped/src/Reports/0.73.5/android** for android & **WebpageRevamped/src/Reports/0.73.5/ios** for iOS for both architecture.

## Webpage:
This repository includes a simple webpage to compare the performance of different React Native versions in rendering N views, texts, and images.
1. To update the benchmarking data shown on the web panel:
```
cd .. && cd WebpageRevamped
yarn generate-reports
```
2. To view the panel locally in your browser: `yarn start`
3. Visit the live webpage to explore and compare benchmarking results: [https://reactnativebenchmark.dev](https://reactnativebenchmark.dev/) to compare the benchmarking numbers.

---
## Motivation & References:
1. https://github.com/react-native-community/RNNewArchitectureLibraries?tab=readme-ov-file
2. https://github.com/reactwg/react-native-new-architecture/discussions/123
3. https://github.com/react-native-community/RNNewArchitectureApp/tree/new-architecture-benchmarks

---
   
## Contribution:
See [CONTRIBUTION.md](./CONTRIBUTION.md) to learn how to contribute to the repository and the development workflow.

## License:
See [LICENSE](./LICENSE) to understand more about terms and conditions.

---
## Demo:
Instrested in taking a look at the demonstration!
You can view or download the video from [here](./Demo/RNBenchmarking.mp4).
