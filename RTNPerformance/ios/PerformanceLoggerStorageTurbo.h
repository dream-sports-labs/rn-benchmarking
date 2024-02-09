#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface PerformanceLoggerStorageTurbo : NSObject

+ (instancetype)logger;

- (void)addStartTimeWithName:(NSString *)name timestamp:(NSString *)timestamp;
- (void)addEndTimeWithName:(NSString *)name timestamp:(NSString *)timestamp;
- (void)resetLogs;
- (NSDictionary<NSString *, NSDictionary<NSString *, NSNumber *> *> *)generateReport;
- (NSString *)getLogs;

@end

NS_ASSUME_NONNULL_END