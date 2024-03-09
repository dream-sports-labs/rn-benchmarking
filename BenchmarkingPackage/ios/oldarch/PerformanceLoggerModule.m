#ifndef RCT_NEW_ARCH_ENABLED

#import "PerformanceLoggerStorage.h"
#import "React/RCTBridgeModule.h"

 @interface PerformanceLoggerModule : NSObject <RCTBridgeModule>

 @property (nonatomic, strong) PerformanceLoggerStorage *storage;

 @end

@implementation PerformanceLoggerModule

RCT_EXPORT_MODULE(PerformanceLoggerModule)

- (instancetype)init {
    self = [super init];
    if (self) {
        _storage = [[PerformanceLoggerStorage alloc] init];
    }
    return self;
}

RCT_EXPORT_METHOD(logStartTime:(NSString *)tagName timestamp:(NSString *)timestamp) {
    [self.storage logStartTime:tagName timestamp:timestamp];
}

RCT_EXPORT_METHOD(logEndTime:(NSString *)tagName timestamp:(NSString *)timestamp) {
    [self.storage logEndTime:tagName timestamp:timestamp];
}

RCT_EXPORT_METHOD(getLogs:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSDictionary *logs = [self.storage getLogs];
    resolve(logs);
}

RCT_EXPORT_METHOD(resetLogs) {
    [self.storage resetLogs];
}

@end

#endif