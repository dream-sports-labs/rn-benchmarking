# Benchmarking Scripts

## Overview

This directory contains scripts to automate React Native performance benchmarking across different versions, architectures, and build types.

## Scripts

### `run-benchmark.ts`

Main script that automates the entire benchmarking process:

1. **Prompts for configuration:**
   - React Native version (e.g., 0.79.2)
   - Platform (android/ios)
   - Number of iterations

2. **Creates React Native app** with the specified version

3. **Links BenchmarkingPackage** native module

4. **Copies benchmark components** from the main benchmarking app

5. **Runs benchmarks** for all combinations:
   - Old Architecture + Debug
   - Old Architecture + Release
   - New Architecture + Debug
   - New Architecture + Release

6. **Saves reports** in organized folder structure:
   ```
   WebpageRevamped/src/Reports/
     {version}/
       {platform}/
         oldarch/
           debug/oldarch.json
           release/oldarch.json
         newarch/
           debug/newarch.json
           release/newarch.json
   ```

### `generate-reports.ts`

Generates `Reports.ts` file from the Reports directory structure. This file is used by the web dashboard to load benchmark data.

## Usage

### Prerequisites

1. **Node.js** >= 18
2. **React Native CLI** (will be installed via npx)
3. **Android Studio** (for Android builds)
4. **Xcode** (for iOS builds)
5. **Maestro** installed and in PATH
6. **Android Emulator** or **iOS Simulator** running
7. **ADB** (for Android) accessible

### Running Benchmarks

From the project root:

```bash
# Install dependencies (first time only)
yarn install

# Run the benchmark script
yarn benchmark
```

The script will:
- Prompt for React Native version, platform, and iterations
- Create a new React Native app in `generated/` directory
- Run all benchmark combinations automatically
- Save reports in the Reports directory
- Generate Reports.ts automatically

### Generating Reports.ts Manually

If you need to regenerate `Reports.ts` after manually adding reports:

```bash
yarn generate-reports
```

## Report Structure

### New Structure (with build types)

```
Reports/
  {version}/
    {platform}/
      {architecture}/
        {buildType}/
          {architecture}.json
```

Example:
```
Reports/
  0.79.2/
    android/
      oldarch/
        debug/oldarch.json
        release/oldarch.json
      newarch/
        debug/newarch.json
        release/newarch.json
```

### Backward Compatibility

The script also saves reports in the old structure (without build type) for backward compatibility. The old structure uses debug builds as the default.

## Notes

- **Generated apps** are stored in `generated/` directory and can be deleted after benchmarking
- **Build times** can be long, especially for release builds
- **iOS builds** require CocoaPods to be set up correctly
- **Android builds** require Gradle to be configured properly
- The script will **overwrite** existing apps in the generated directory if they exist

## Troubleshooting

### App creation fails
- Ensure you have internet connection (npx downloads React Native CLI)
- Check that the React Native version exists

### Build fails
- Ensure emulator/simulator is running
- For Android: Check `android/gradle.properties` configuration
- For iOS: Ensure CocoaPods is installed (`bundle install` in ios directory)

### Maestro tests fail
- Ensure the app is installed and running
- Check that test IDs match the app's test IDs
- Verify Maestro is installed: `maestro --version`

### Reports not found
- Check that the app successfully generated reports
- Verify ADB (Android) or simulator access (iOS)
- Check file permissions


