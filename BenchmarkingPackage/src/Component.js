const isFabricEnabled = global.nativeFabricUIManager != null;

export default isFabricEnabled ? require("./PerformanceLoggerViewNativeComponent").default : require("./PerformanceLoggerView").default