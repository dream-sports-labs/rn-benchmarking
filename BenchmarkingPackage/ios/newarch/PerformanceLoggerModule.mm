#import "PerformanceLoggerStorage.h"

#ifdef RCT_NEW_ARCH_ENABLED

#import "PerformanceLoggerSpec.h"
#import "PerformanceLoggerModule.h"

@implementation PerformanceLoggerModule {
    PerformanceLoggerStorage *_storage;
}

//In TurboModules, the module name is inferred from the class name.
//RCT_EXPORT_MODULE()

- (instancetype)init {
    self = [super init];
    if (self) {
        _storage = [[PerformanceLoggerStorage alloc] init];
    }
    return self;
}

- (void)logStartTime:(NSString *)tagName timestamp:(NSString *)timestamp {
    [_storage logStartTime:tagName timestamp:timestamp];
}

- (void)logEndTime:(NSString *)tagName timestamp:(NSString *)timestamp {
    [_storage logEndTime:tagName timestamp:timestamp];
}

- (void)resetLogs {
    [_storage resetLogs];
}

- (void)getLogs:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject { 
    NSDictionary *logs = [_storage getLogs];
    resolve(logs);
}


- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativePerformanceModuleSpecJSI>(params);
}

+ (NSString *)moduleName { 
    return @"PerformanceLoggerModule";
}

@end

#endif
