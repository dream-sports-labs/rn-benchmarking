#import "RTNPerformanceSpec.h"
#import "PerformanceLoggerTurbo.h"
#include "PerformanceLoggerStorageTurbo.h"

@implementation PerformanceLoggerTurbo

RCT_EXPORT_MODULE(RTNPerformanceLogger)

- (void)logTimeToStorage:(NSString *)name timestamp:(NSString *)timestamp {
    [[PerformanceLoggerStorageTurbo logger] addStartTimeWithName:name timestamp:timestamp];
}

- (void)generateReport:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    PerformanceLoggerStorageTurbo *logger = [PerformanceLoggerStorageTurbo logger];
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

- (void)printLogs {
    NSString *logs = [[PerformanceLoggerStorageTurbo logger] getLogs];
    NSLog(@":::: Raw logs: %@", logs);
}

- (void)resetLogs {
    [[PerformanceLoggerStorageTurbo logger] resetLogs];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativePerformanceModuleSpecJSI>(params);
}

@end
