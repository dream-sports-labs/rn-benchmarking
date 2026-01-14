export type IterationInfoArgs = {
  RN_VERSION: string;
  ITERATIONS: number;
};

export type BuildArgs = {
  RN_VERSION: string;
  BENCHMARK_DIR: string;
  ARCH_TYPE: Architecture;
};

export enum LogLevel {
  ERROR = 'ERROR',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  WARN = 'WARN'
}

export enum Architecture {
  OLD = 'old',
  NEW = 'new'
}

export type BenchmarkState = {
  version: string;
  projectCreated: boolean;
  templatesApplied: boolean;
  reportsGenerated: boolean;
  startTime: string;
  packageName?: string;
}

export type BuildState = {
  tested?: boolean;
  metadataPath?: string;
  appPath?: string;
}

export type BuildVariants<T> = {
  [key in Architecture]: T;
}

export type AndroidState = {
  android: BuildVariants<BuildState>;
}

export type IOSState = {
  ios: BuildVariants<BuildState>;
  iosPackageName?: string;
}

export type BenchmarkStateFile = BenchmarkState & AndroidState & IOSState;

export type InitializeResult = IterationInfoArgs & {
  BENCHMARK_DIR: string;
  TEMPLATE_DIR: string;
  BASE_DIR: string;
}

export type BuildStatus = {
  buildSuccessful: boolean;
  metadataPath: string;
}

export type ArchitectureVariants<T> = {
  [key in Architecture]: T;
}

export type BuildResults = {
  android?: ArchitectureVariants<BuildStatus>;
  ios?: ArchitectureVariants<BuildStatus>;
}

export type BuildMetadata = {
  bundleId: string;
  version: string;
  appPath: string;
  arch: Architecture;
}

export type SuccessfulInstall = {
  arch: Architecture;
  deviceId: string;
  bundleId?: string;
}