# Contributing to RN Benchmarking Repository

Welcome to the RN Benchmarking Repository! We appreciate your interest in contributing. This document outlines how you can get involved and contribute to this project.

## Table of Contents

- [Introduction](#introduction)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Requesting Features](#requesting-features)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [License](#license)

## Introduction

The RN Benchmarking Repository is a project aimed at benchmarking the performance of rendering views, text, images, and other components for react native. By contributing to this project, you'll help us gather data and insights on the performance characteristics of react native across different scenarios and configurations.
 

## How to Contribute

### Reporting Bugs

If you encounter any bugs or issues while using the benchmarking tools or analyzing the results, please [open a new issue](https://github.com/dream11/rn-benchmarking/issues) in this repository. When reporting a bug, please provide as much information as possible, including:

- A detailed description of the issue
- Steps to reproduce the issue
- Expected behavior
- Any relevant error messages or screenshots


### Submitting Pull Requests

If you'd like to contribute code to the project by fixing the existing issues or by adding a new feature, you can do so by [submitting a pull request](https://github.com/dream11/rn-benchmarking/pulls). When raising the pull request, please provide the following information if possible:

- A detailed description of the fix / feature
- How can it improve current working

### Adding benchmarking for new react-native versions
 
 Currently this repository only holds information around benchmarking of N rendered views, texts & images. If you have benchmarked the new react-native version against mentioned scenarios either by upgrading react-native versions in existing project, by using existing tool or in freshly crafted react-native project please make sure to add the benchmarking numbers under **Reports** directory in same format as other versions. In order to make sure the versions is comparable with other versions you will also need to add the versions for which benchmarking is done under **Webpage/supportedVersions.json**. By default if benchmarking is done using existing automation script the data will be dumped automatically in respective formats.

 Also, for making the comparsion more promising we encourgage to get benchmarking numbers on same environment as we have for other versions.
 Older version are benchmarked on the following devices for 30 itertions:
 - Android Emulator: Pixel 3A API 34
 - iOS Simulator: iPhone 15 Pro (17.2)

 If you want to add or would like to have benchmarking of other scenarios like time taken to make a bridge, JSI calls for respective react-native versions feel to submit a new pull request with this data or open a feature request for the same.
 We will more than happy to incorporate the changes so that it's available to consume on wider forums.

 While adding benchmarking of new scenrios currently not available in this project it will be great addon to also add a simple webpage for quicker comparsion like we have for comparing time taken to render N views, texts & images inside **Webpage** directory of the project.


## License

This project is licensed under the [MIT License](./LICENSE). By contributing to this project, you agree to license your contributions under the terms of this license.