#import <Foundation/Foundation.h>

@interface PerformanceLoggerStorage : NSObject

//+ (instancetype)sharedInstance;
- (void)logStartTime:(NSString *)tagName timestamp:(NSString *)timestamp;
- (void)logEndTime:(NSString *)tagName timestamp:(NSString *)timestamp;
- (void)resetLogs;
- (NSDictionary<NSString *, NSArray<NSDictionary<NSString *, NSNumber *> *> *> *)getLogs;

@end
