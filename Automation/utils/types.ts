export interface Args {
  RN_VERSION: string;
  ITERATIONS: number;
}

export interface Config {
  BASE_DIR: string;
  TEMPLATE_DIR: string;
  ERROR_LOG_FILE: string;
}

export type LogLevel = 'ERROR' | 'INFO';

export interface BaseState {
  version: string;
  projectCreated: boolean;
  templatesApplied: boolean;
  reportsGenerated: boolean;
  startTime: string;
  packageName?: string;
}

export interface AndroidState {
  androidOldArchTested: boolean;
  androidNewArchTested: boolean;
  androidOldArchApkPath?: string;
  androidNewArchApkPath?: string;
  androidOldArchMetadataPath?: string;
  androidNewArchMetadataPath?: string;
}

export interface IOSState {
  iosOldArchTested: boolean;
  iosNewArchTested: boolean;
  iosPackageName?: string;
  iosOldArchAppPath?: string;
  iosNewArchAppPath?: string;
  iosOldArchMetadataPath?: string;
  iosNewArchMetadataPath?: string;
}

export interface StateFile extends BaseState, AndroidState, IOSState {}

export interface ExecOptions {
  stdio?: 'inherit' | 'pipe';
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  shell?: boolean;
}

export interface InitializeResult {
  RN_VERSION: string;
  ITERATIONS: number;
  BENCHMARK_DIR: string;
  TEMPLATE_DIR: string;
  BASE_DIR: string;
}

export interface BuildResults {
  oldArchBuildSuccessful: boolean;
  newArchBuildSuccessful: boolean;
  oldArchMetadataPath: string;
  newArchMetadataPath: string;
}

export interface AndroidBuildMetadata {
  packageName: string;
  version: string;
  apkPath: string;
  architecture: 'old' | 'new';
}

export interface IOSBuildMetadata {
  bundleId: string;
  version: string;
  appPath: string;
  architecture: 'old' | 'new';
}

export interface SuccessfulInstall {
  arch: 'old' | 'new';
  deviceId: string;
}

export interface SuccessfulIOSInstall {
  arch: 'old' | 'new';
  simulatorId: string;
  bundleId: string;
} 