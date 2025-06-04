import fs from 'fs';
import { LogLevel } from './types';

export function formatError(error: unknown): string {
  let formattedError = '';

  if (error instanceof Error) {
    formattedError += `Error: ${error.message}\n`;
    formattedError += `Stack: ${error.stack}\n`;

    for (const key in error) {
      if (Object.prototype.hasOwnProperty.call(error, key) &&
        key !== 'message' &&
        key !== 'stack') {
        formattedError += `${key}: ${JSON.stringify(error[key])}\n`;
      }
    }
  } else {
    formattedError = `${JSON.stringify(error, null, 2)}`;
  }

  return formattedError;
}

export function initializeLogFile(errorLogFile: string): void {
  const timestamp = new Date().toISOString();
  fs.writeFileSync(errorLogFile, `=== Log Started at ${timestamp} ===\n\n`, 'utf8');
}

export function logMessage(level: LogLevel, message: string, error: unknown = null, errorLogFile: string | null = null): void {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}${error ? '\n' + formatError(error) : ''}`;

  if (level === 'ERROR') {
    console.error(logEntry);

    if (errorLogFile) {
      try {
        fs.appendFileSync(errorLogFile, logEntry + '\n\n', 'utf8');
      } catch (err) {
        console.error('Failed to write to error log file:', err);
      }
    }
  } else if (level === 'INFO') {
    console.log(message);
  }
} 