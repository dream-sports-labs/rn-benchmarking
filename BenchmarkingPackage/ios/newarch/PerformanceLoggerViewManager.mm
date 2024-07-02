#ifdef RCT_NEW_ARCH_ENABLED

#import <React/RCTLog.h>
#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>

@interface PerformanceLoggerViewManager : RCTViewManager
@end

@implementation PerformanceLoggerViewManager

RCT_EXPORT_MODULE(PerformanceLoggerView)

RCT_EXPORT_VIEW_PROPERTY(tagName, NSString)

@end

#endif