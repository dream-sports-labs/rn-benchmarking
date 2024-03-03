#ifndef RCT_NEW_ARCH_ENABLED

#import "PerformanceLoggerViewManager.h"
#import "PerformanceLoggerView.h"

@implementation PerformanceLoggerViewManager

RCT_EXPORT_MODULE(PerformanceLoggerView)

RCT_EXPORT_VIEW_PROPERTY(tagName, NSString)

- (UIView *)view {
    return [[PerformanceLoggerView alloc] init];
}

@end

#endif