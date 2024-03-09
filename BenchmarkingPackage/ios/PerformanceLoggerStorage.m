#import "PerformanceLoggerStorage.h"

@implementation PerformanceLoggerStorage

static NSMutableDictionary<NSString *, NSMutableArray<NSDictionary<NSString *, NSNumber *> *> *> *_logs = nil;

//+ (instancetype)sharedInstance {
//    static PerformanceLoggerStorage *sharedInstance = nil;
//    static dispatch_once_t onceToken;
//    dispatch_once(&onceToken, ^{
//        sharedInstance = [[self alloc] init];
//    });
//    return sharedInstance;
//}

- (instancetype)init {
    self = [super init];
    if (self) {
        if (!_logs) {
            _logs = [NSMutableDictionary dictionary];
        }
    }
    return self;
}

- (void)logStartTime:(NSString *)tagName timestamp:(NSString *)timestamp {
    if (!_logs[tagName]) {
        _logs[tagName] = [NSMutableArray arrayWithObject:@{@"PAINT_START_TIME": @([timestamp doubleValue])}];
    } else {
        [_logs[tagName] addObject:@{@"PAINT_START_TIME": @([timestamp doubleValue])}];
    }
}

- (void)logEndTime:(NSString *)tagName timestamp:(NSString *)timestamp {
    NSMutableArray<NSDictionary<NSString *, NSNumber *> *> *list = _logs[tagName];
    
    if (list && list.count > 0) {
        NSMutableDictionary<NSString *, NSNumber *> *lastEntry = [list lastObject].mutableCopy;
        lastEntry[@"PAINT_END_TIME"] = @([timestamp doubleValue]);

        // Replace the last entry in the array with the modified one
        [list replaceObjectAtIndex:list.count - 1 withObject:lastEntry];
    }
}
- (void)resetLogs {
    [_logs removeAllObjects];
}

- (NSDictionary<NSString *, NSArray<NSDictionary<NSString *, NSNumber *> *> *> *)getLogs {
    return [_logs copy];
}

@end
