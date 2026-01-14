/**
 * Utility functions
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Prompt user for input
 */
export function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Recursively find a file in a directory
 */
export function findFileRecursive(dir: string, filename: string): string | null {
  if (!fs.existsSync(dir)) return null;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      const found = findFileRecursive(filePath, filename);
      if (found) return found;
    } else if (file === filename) {
      return filePath;
    }
  }
  return null;
}

/**
 * Ensure directory exists
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Format label for display (e.g., "0.79.2/android/newarch" -> "0.79.2 Android New")
 */
export function formatLabel(label: string): string {
  const parts = label.split('/');
  const version = parts[0];
  const platform = parts[1]?.charAt(0).toUpperCase() + parts[1]?.slice(1) || '';
  const arch = parts[2] === 'newarch' ? 'New' : 'Old';
  return `${version} ${platform} ${arch}`;
}


