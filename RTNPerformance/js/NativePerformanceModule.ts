import { TurboModule, TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
  logTimeToStorage(name: string, timestamp: string): void;
  printLogs(): void;
  generateReport(): Promise<Record<string, string>>;
  resetLogs(): void;
}

export default TurboModuleRegistry.get<Spec>(
  "RTNPerformanceLogger"
) as Spec | null;
