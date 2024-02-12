# RN Benchmarking

This repository can be used for benchmarking react-native versions for old and new architecture on sample app.

## Prerequisite

1. [React Native Environment Setup](https://reactnative.dev/docs/next/environment-setup)
2. [Maestro Setup](https://maestro.mobile.dev/)
3. [Flashlight Setup](https://docs.flashlight.dev/)

## Setup

```
git clone https://github.com/dream11/rn-benchmarking.git
yarn install
```

---

## Benchmarking Old Architecture

1. Navigate to directory Benchamrking by running:
   ```
   cd Benchamrking
   ```
2. For benchmarking old architecture we will need to install package RNPerformance (contains Native Module & Native Component).
3. Run the following command to add the package:
   ```
   yarn add ../RNPerformance
   ```
   > NOTE: Make sure to remove package **rtn-performance** if present before installing current package, since it has Turbo Module and Facric Native Component.

### Android:

1. Before running benchmarking on old architecture we need to make sure it's enabled.
2. Open android/gradle.properties and make sure **newArchEnabled** is set to **false**.
3. Replace the following imports in files present inside src/ directory if any:
   ```
   1. rtn-performance/js/NativePerformanceModule => react-native-performance/js/RNPerformanceModule
   2. rtn-performance/js/PerformanceLoggerViewNativeComponent => react-native-performance/js/RNPerformanceView
   ```
4. Run app in release mode using `yarn android --mode release`.
5. After benchamrking numbers can be found under **D11PerformanceLog** of device storage.

> NOTE: Before getting benchmarking numbers make sure android app has storage permissions.

### iOS:

1. Before running benchmarking on old architecture we need to make sure it's enabled.
2. Run the following command to enable old architecture.
   ```
   cd ios
   RCT_NEW_ARCH_ENABLED=0 bundle exec pod install
   rm -rf build
   ```
3. Replace the following imports in files present inside src/ directory if any:
   ```
   1. rtn-performance/js/NativePerformanceModule => react-native-performance/js/RNPerformanceModule
   2. rtn-performance/js/PerformanceLoggerViewNativeComponent => react-native-performance/js/RNPerformanceView
   ```
4. Run app in release mode using `yarn ios --mode Release`.
5. For iOS numbers can be found under **D11PerformanceLog** of app's document directory.
6. The document directory of any installed app on pysical device can be accessed via using tools like [iexplorer](https://macroplant.com/iexplorer).
7. To get number's from iOS simulator use command:
   ```
   xcrun simctl get_app_container booted com.benchamrking data
   ```
8. The above command will output the path where number's are dumped.

---

## Benchmarking New Architecture

1. Navigate to directory Benchamrking by running:
   ```
   cd Benchamrking
   ```
2. For benchmarking new architecture we will need to install package RTNPerformance (contains Turbo Module & Fabric Native Component).
3. Run the following command to add the package:
   ```
   yarn add ../RTNPerformance
   ```
   > NOTE: Make sure to remove package **react-native-performance** if present before installing current package, since it has Native Module and Native Component.

### Android:

1. Before running benchmarking on new architecture we need to make sure it's enabled.
2. Open android/gradle.properties and make sure **newArchEnabled** is set to **true**.
3. For benchmarking on new architecture we first need to generate codegen artifacts by running the following command:
   ```
   cd android
   ./gradlew generateCodegenArtifactsFromSchema
   ```
4. Replace the following imports in files present inside src/ directory if any:
   ```
   1. react-native-performance/js/RNPerformanceModule => rtn-performance/js/NativePerformanceModule
   2. react-native-performance/js/RNPerformanceView => rtn-performance/js/PerformanceLoggerViewNativeComponent
   ```
5. Run app in release mode using `yarn android --mode release`.
6. After benchamrking numbers can be found under **D11PerformanceLog** of device storage.

> NOTE: Before getting benchmarking numbers make sure android app has storage permissions.

### iOS:

1. Before running benchmarking on new architecture we need to make sure it's enabled.
2. Run the following command to enable old architecture.
   ```
   cd ios
   RCT_NEW_ARCH_ENABLED=1 bundle exec pod install
   rm -rf build
   ```
3. **RCT_NEW_ARCH_ENABLED=1** will enable new architecture and generate codegen artifacts.
4. Replace the following imports in files present inside src/ directory if any:
   ```
   1. rtn-performance/js/NativePerformanceModule => react-native-performance/js/RNPerformanceModule
   2. rtn-performance/js/PerformanceLoggerViewNativeComponent => react-native-performance/js/RNPerformanceView
   ```
5. Run app in release mode using `yarn ios --mode Release`.
6. For iOS numbers can be found under **D11PerformanceLog** of app's document directory.
7. The document directory of any installed app on pysical device can be accessed via using tools like [iexplorer](https://macroplant.com/iexplorer).
8. To get number's from iOS simulator use command:
   ```
   xcrun simctl get_app_container booted com.benchamrking data
   ```
9. The above command will output the path where number's are dumped.

---

## Automation

1. Getting benchmarking number's manually by clicking on buttons sometimes be tedious.
2. In order to resolve this we have provided some automations scripts that can do this job for you.
3. This scripts wil help getting numbers for time taken to render N views, texts, images component and flashlight score for spin animations of N views.
4. One can change the number of views to render by heading to **App.tsx** and changing the prop value of **itemsToRender** passed to component **Main**.
5. Run the following to get rendering time of N views, texts, images (supported on android emulator, anroid physical device, iOS simulators):
   ```
   cd AutomationScripts
   sh renderflow.sh <PACKAGE_NAME> <ITERATION_COUNT> <DEVICE_ID (OPTIONAL)>
   /* Example: sh renderflow.sh com.benchamrking 10 */
   ```
6. Run the following command to get flashlight score (supported only on Android):
   ```
   cd AutomationScripts
   sh flashlightflow.sh
   ```

> NOTE: 1. Benchmarking numbers can be found at same locations for respective platform's as specfied above. 2. Flashlight report can be found under **AutomationScripts** (from where the script was originally started) with name result.json.
