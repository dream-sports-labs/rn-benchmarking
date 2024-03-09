#ifdef RCT_NEW_ARCH_ENABLED

#import "PerformanceLoggerView.h"
#import "RCTThirdPartyFabricComponentsProvider.h"
#import "PerformanceLoggerStorage.h"

#import <React/RCTConversions.h>

#import <react/renderer/components/PerformanceLoggerSpec/ComponentDescriptors.h>
#import <react/renderer/components/PerformanceLoggerSpec/EventEmitters.h>
#import <react/renderer/components/PerformanceLoggerSpec/Props.h>
#import <react/renderer/components/PerformanceLoggerSpec/RCTComponentViewHelpers.h>
#import "RCTFabricComponentsPlugins.h"


using namespace facebook::react;

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

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<PerformanceLoggerViewProps const>();
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

  NSString *tagName = RCTNSStringFromString(std::static_pointer_cast<PerformanceLoggerViewProps const>(_props)->tagName);

  // However, we cannot do it right now: the views were just mounted but pixels
  // were not drawn on the screen yet.
  // They will be drawn for sure before the next tick of the main run loop.
  // Let's wait for that and then report.
  dispatch_async(dispatch_get_main_queue(), ^{
    NSString *currentTimeMillis = [NSString stringWithFormat:@"%f", [[NSDate date] timeIntervalSince1970] * 1000];
      [self->_storage logEndTime:tagName timestamp:[NSString stringWithFormat:@"%@", currentTimeMillis]];
  });
}


+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<PerformanceLoggerViewComponentDescriptor>();
}

@end

Class<RCTComponentViewProtocol> PerformanceLoggerViewCls(void)
{
  return PerformanceLoggerView.class;
}

#endif
