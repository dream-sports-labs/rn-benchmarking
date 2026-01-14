/**
 * Type definitions for the benchmarking script
 */

export type Platform = 'android' | 'ios';
export type Architecture = 'oldarch' | 'newarch';
export type BuildType = 'debug' | 'release';

export interface BenchmarkConfig {
  rnVersion: string;
  platforms: Platform[];
  iterations: number;
  deviceId?: string;
}

export interface BuildConfig {
  architecture: Architecture;
  buildType: BuildType;
}

export interface AppDirectoryResult {
  appPath: string;
  isNew: boolean;
}

export interface PlatformResult {
  platform: Platform;
  success: boolean;
}

export interface AndroidAVD {
  name: string;
}

export interface iOSSimulator {
  name: string;
  udid: string;
  runtime: string;
}

export interface MaestroEnvVars {
  [key: string]: string;
}


