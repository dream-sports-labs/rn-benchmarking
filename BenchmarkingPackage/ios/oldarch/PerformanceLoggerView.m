#ifndef RCT_NEW_ARCH_ENABLED

#import "PerformanceLoggerView.h"
#import "PerformanceLoggerStorage.h"

@implementation PerformanceLoggerView {
    PerformanceLoggerStorage *_storage;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _storage = [[PerformanceLoggerStorage alloc] init];
    }
    return self;
}

- (void)setTagName:(NSString *)tagName {
    _tagName = tagName;
}

- (void)drawRect:(CGRect)rect {
    [super drawRect:rect];

    // Get the current timestamp in milliseconds
    NSTimeInterval currentTimeMillis = ([[NSDate date] timeIntervalSince1970] * 1000);

    // Log end time with PerformanceLoggerStorage
    [_storage logEndTime:self.tagName timestamp:[NSString stringWithFormat:@"%f", currentTimeMillis]];
}

@end

#endif