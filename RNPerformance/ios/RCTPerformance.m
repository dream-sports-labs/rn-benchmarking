
#import "RCTPerformance.h"
#import "react_native_performance-Swift.h"

@implementation RCTPerformance


RCT_EXPORT_MODULE(RNPerformanceLogger)


RCT_EXPORT_METHOD(logTimeToStorage: (NSString *)name timestamp: (NSString *)timestamp) {
  
  [[PerformanceLoggerStorage logger] addStartTimeWithName:name timestamp:timestamp];
}

RCT_EXPORT_METHOD(generateReport:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  PerformanceLoggerStorage *logger = [[PerformanceLoggerStorage alloc] init];
  NSDictionary<NSString *, NSDictionary<NSString *, NSNumber *> *> *report = [logger generateReport];

  if (report.count == 0) {
      resolve(@{});
      return;
  }

  NSMutableDictionary<NSString *, NSDictionary<NSString *, NSNumber *> *> *result = [NSMutableDictionary dictionary];

  for (NSString *key in report) {
      NSDictionary<NSString *, NSNumber *> *nestedEntry = report[key];
      NSMutableDictionary<NSString *, NSNumber *> *nestedMap = [NSMutableDictionary dictionary];

      for (NSString *nestedKey in nestedEntry) {
          NSNumber *nestedValue = nestedEntry[nestedKey];
          nestedMap[nestedKey] = nestedValue;
      }

      result[key] = nestedMap;
  }

  resolve(result);
}

RCT_EXPORT_METHOD(printLogs:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSString *logs = [[PerformanceLoggerStorage logger] getLogs];
  NSLog(@":::: Raw logs: %@", logs);

}

RCT_EXPORT_METHOD(resetLogs:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  [[PerformanceLoggerStorage logger] resetLogs];
}

@end
  
