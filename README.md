# RN Benchmarking

This repository can be used for benchmarking react-native versions for old and new architecture on sample app.

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

1. [React Native Environment Setup](https://reactnative.dev/docs/next/environment-setup)
2. [Maestro Setup](https://maestro.mobile.dev/)
   To check if Maestro is installed on your system, run command `maestro --version`.
3. [Flashlight Setup](https://docs.flashlight.dev/)

## Setup

```
git clone https://github.com/dream-sports-labs/rn-benchmarking.git
cd Benchamrking
yarn install
```

---

## Benchmarking Old Architecture

### Android:

1. Before running benchmarking on old architecture we need to make sure it's enabled.
2. Open android/gradle.properties and make sure **newArchEnabled** is set to **false**.
3. Run app using `yarn android`.
4. The benchmarking numbers can be found under **ExternalDirectoryPath** of emulator storage.
5. The path will be **/storage/emulated/0/Android/data/com.benchamrking/files/oldarch.json**

### iOS:

1. Before running benchmarking on old architecture we need to make sure it's enabled.
2. Run the following command to enable old architecture.
   ```
   cd ios
   export NO_FLIPPER=1 && bundle install && bundle exec pod install
   rm -rf build
   ```
3. Run app using `yarn ios`.
4. The benchmarking numbers can be found under app's **DocumentDirectoryPath**.
5. To get access to app's document directory run the following command:
   ```
   open $(xcrun simctl get_app_container booted com.benchamrking data)
   ```
6. After running the above benchmarking numbers can be found under **Documents/oldarch.json**.

---

## Benchmarking New Architecture

### Android:

1. Before running benchmarking on new architecture we need to make sure it's enabled.
2. Open android/gradle.properties and make sure **newArchEnabled** is set to **true**.
3. Run app using `yarn android`.
4. The benchmarking numbers can be found under **ExternalDirectoryPath** of emulator storage.
5. The path will be **/storage/emulated/0/Android/data/com.benchamrking/files/newarch.json**

### iOS:

1. Before running benchmarking on new architecture we need to make sure it's enabled.
2. Run the following command to enable old architecture.
   ```
   cd ios
   export NO_FLIPPER=1 && bundle install && RCT_NEW_ARCH_ENABLED=1 bundle exec pod install
   rm -rf build
   ```
3. Run app using `yarn ios`.
4. The benchmarking numbers can be found under app's **DocumentDirectoryPath**.
5. To get access to app's document directory run the following command:
   ```
   open $(xcrun simctl get_app_container booted com.benchamrking data)
   ```
6. After running the above benchmarking numbers can be found under **Documents/newarch.json**.

---

## Automation

1. Getting benchmarking number's manually by clicking on buttons sometimes be tedious.
2. In order to resolve this we have provided some automations scripts that can do this job for you.
3. This scripts will help getting numbers for time taken to render N views, texts, images component and flashlight score for spin animations of N views.
5. Run the following to get rendering time of N views, texts, images (tested on Android emulator & iOS Simulator):
6. The command sometimes might cause an error when processing 5,000 images because Maestro might encounter performance issues due to the high volume of data, leading to timeouts or the app becoming unresponsive while attempting to load and render the images.
   ```
    yarn get:numbers:android <ITERATION_COUNT>
    /* Example: yarn get:numbers:android 10 */
    yarn get:numbers:ios <ITERATION_COUNT>
    /* Example: yarn get:numbers:ios 10 */
   ```
7. Run the following command to get flashlight score (supported only on Android):
   ```
   yarn get:flashlight:score <ITERATION_COUNT>
   /* Example: yarn get:flashlight:score 10 
      Defaults to 1 iteration 
   */
   ```
8. Check flashlight score by running:
    ```
    flashlight report <PATH_TO_FLASHLIGHT_REPORT> 
    /* Example: flashlight report ../Reports/0.73.5/android/flashlightscore.json (assuming you are inside Benchamrking/ directory) */

NOTE: 
1. After running automation scripts the benchmarking numbers can be found under **Reports** directory. 
2. So, if we are benchmarking for react-native version 0.73.5 the rendering benchmarking numbers will be found under **Reports/0.73.5/android** for android & **Reports/0.73.5/ios** for iOS for both architecture
3. Since flashlight is only supported on android the flashlight score can be found under **Reports/react-native-version/android**

---
## Motivation & References:
1. https://github.com/react-native-community/RNNewArchitectureLibraries?tab=readme-ov-file
2. https://github.com/reactwg/react-native-new-architecture/discussions/123
3. https://github.com/react-native-community/RNNewArchitectureApp/tree/new-architecture-benchmarks

---
## Webpage:
1. The repository has a simple webpage build to compare performance of different react-native versions for rendering N views, texts & images.
2. Please head to [https://dream-sports-labs.github.io/rn-benchmarking/](https://dream-sports-labs.github.io/rn-benchmarking/) to compare the benchmarking numbers.
   
## Contribution:
See [CONTRIBUTION.md](./CONTRIBUTION.md) to learn how to contribute to the repository and the development workflow.

## License:
See [LICENSE](./LICENSE) to understand more about terms and conditions.

---
## Demo:
Instrested in taking a look at the demonstration!
You can view or download the video from [here](./Demo/RNBenchmarking.mp4).
