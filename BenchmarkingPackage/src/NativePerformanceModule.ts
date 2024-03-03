import { TurboModuleRegistry, TurboModule } from 'react-native';

export interface Spec extends TurboModule {
    logStartTime(tagName: string, timestamp: string): void;
    logEndTime(tagName: string, timestamp: string): void;
    getLogs(): Promise<Record<string, any>>;
    resetLogs(): void;
}

export default TurboModuleRegistry.get<Spec>(
    'PerformanceLoggerModule'
) as Spec | null