#import <React/RCTLog.h>
#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>

@interface RTNPerformanceLoggerViewManager : RCTViewManager
@end

@implementation RTNPerformanceLoggerViewManager

RCT_EXPORT_MODULE(RTNPerformanceLoggerView)

RCT_EXPORT_VIEW_PROPERTY(tagName, NSString)

@end