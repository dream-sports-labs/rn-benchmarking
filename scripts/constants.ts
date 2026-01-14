/**
 * Constants and configuration values
 */

import * as path from 'path';

export const ROOT_DIR = path.join(__dirname, '..');
export const BENCHMARKING_DIR = path.join(ROOT_DIR, 'Benchamrking');
export const BENCHMARKING_PACKAGE_DIR = path.join(ROOT_DIR, 'BenchmarkingPackage');
export const REPORTS_DIR = path.join(ROOT_DIR, 'WebpageRevamped', 'src', 'Reports');
export const GENERATED_DIR = path.join(ROOT_DIR, 'generated');

// Default emulator configurations (matching project specs)
export const DEFAULT_ANDROID_AVD = 'Pixel_3a_API_34';
export const DEFAULT_ANDROID_DEVICE = 'pixel_3a';
export const DEFAULT_ANDROID_API = '34';
export const DEFAULT_IOS_DEVICE = 'iPhone 15 Pro';
export const DEFAULT_IOS_RUNTIME = 'iOS-17-2';

// Maestro environment variables
export const MAESTRO_ENV_VARS = {
  MAESTRO_VIEW_CONTAINER: 'n_view_container_0',
  MAESTRO_TEXT_CONTAINER: 'n_text_container_0',
  MAESTRO_IMAGE_CONTAINER: 'n_image_container_0',
  MAESTRO_EMPTY_VIEW: 'render_empty_view',
  MAESTRO_RENDER_1500_VIEW_BUTTON: 'render_1500_view',
  MAESTRO_RENDER_1500_TEXT_BUTTON: 'render_1500_text',
  MAESTRO_RENDER_1500_IMAGE_BUTTON: 'render_1500_image',
  MAESTRO_RENDER_5000_VIEW_BUTTON: 'render_5000_view',
  MAESTRO_RENDER_5000_TEXT_BUTTON: 'render_5000_text',
  MAESTRO_RENDER_5000_IMAGE_BUTTON: 'render_5000_image',
  MAESTRO_RESET_VIEW_BUTTON: 'reset_view',
  MAESTRO_RESET_LOGS_BUTTON: 'reset_logs',
  MAESTRO_GET_REPORT_BUTTON: 'get_report',
} as const;

// Build configurations to run
export const BUILD_CONFIGS: Array<{ architecture: 'oldarch' | 'newarch'; buildType: 'debug' | 'release' }> = [
  { architecture: 'oldarch', buildType: 'debug' },
  { architecture: 'oldarch', buildType: 'release' },
  { architecture: 'newarch', buildType: 'debug' },
  { architecture: 'newarch', buildType: 'release' },
];


