
#import "RTNPerformanceLoggerComponentView.h"
#import "RCTThirdPartyFabricComponentsProvider.h"
#import "PerformanceLoggerStorageTurbo.h"

#import <React/RCTConversions.h>

#import <react/renderer/components/RTNPerformanceSpec/ComponentDescriptors.h>
#import <react/renderer/components/RTNPerformanceSpec/EventEmitters.h>
#import <react/renderer/components/RTNPerformanceSpec/Props.h>
#import <react/renderer/components/RTNPerformanceSpec/RCTComponentViewHelpers.h>
#import "RCTFabricComponentsPlugins.h"


using namespace facebook::react;

@implementation RTNPerformanceLoggerComponentView

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<RTNPerformanceLoggerViewProps const>();
    _props = defaultProps;
  }

  return self;
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
}

- (void)didMoveToWindow {
  [super didMoveToWindow];


  if (!self.window) {
    return;
  }

  NSString *tagName = RCTNSStringFromString(std::static_pointer_cast<RTNPerformanceLoggerViewProps const>(_props)->tagName);

  // However, we cannot do it right now: the views were just mounted but pixels
  // were not drawn on the screen yet.
  // They will be drawn for sure before the next tick of the main run loop.
  // Let's wait for that and then report.
  dispatch_async(dispatch_get_main_queue(), ^{
    NSString *endTime = [NSString stringWithFormat:@"%f", [[NSDate date] timeIntervalSince1970] * 1000];
   [[PerformanceLoggerStorageTurbo logger] addEndTimeWithName:tagName timestamp:endTime];
  });
}


+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RTNPerformanceLoggerViewComponentDescriptor>();
}

@end

Class<RCTComponentViewProtocol> RTNPerformanceLoggerViewCls(void)
{
  return RTNPerformanceLoggerComponentView.class;
}