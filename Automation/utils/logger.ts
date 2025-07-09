import { LogLevel } from './types';

export interface LogInterface {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error: unknown): void;
}

export class Logger implements LogInterface {

  private formatError(error: unknown): string {
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

  debug(message: string): void {
    console.debug(message);
  }

  info(message: string): void {
    console.info(message);
  }

  warn(message: string): void {
    console.warn(message);
  }

  error(message: string, error: unknown): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${LogLevel.ERROR}] ${message}${error ? '\n' + this.formatError(error) : ''}`;
    console.error(logEntry);
  }
}
