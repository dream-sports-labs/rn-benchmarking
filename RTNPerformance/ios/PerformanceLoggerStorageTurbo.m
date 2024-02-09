#import "PerformanceLoggerStorageTurbo.h"

@interface PerformanceLoggerStorageTurbo ()

@property (nonatomic, strong) NSString *START_TIME;
@property (nonatomic, strong) NSString *END_TIME;
@property (nonatomic, strong) NSString *MEAN;
@property (nonatomic, strong) NSString *STANDARD_DEVIATION;
@property (nonatomic, strong) NSString *ERROR_RATE;

@property (nonatomic) double Z_VALUE;
@property (nonatomic, strong) NSString *FOLDER_NAME;

@property (nonatomic, strong) NSMutableDictionary<NSString *, NSMutableDictionary<NSString *, NSMutableArray<NSNumber *> *> *> *logs;
@property (nonatomic, strong) NSMutableDictionary<NSString *, NSMutableDictionary<NSString *, NSNumber *> *> *result;

@end

@implementation PerformanceLoggerStorageTurbo

+ (instancetype)logger {
    static PerformanceLoggerStorageTurbo *logger = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        logger = [[PerformanceLoggerStorageTurbo alloc] init];
    });
    return logger;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _START_TIME = @"Start";
        _END_TIME = @"End";
        _MEAN = @"Mean";
        _STANDARD_DEVIATION = @"Standard Deviation";
        _ERROR_RATE = @"Error Rate";

        _Z_VALUE = 1.97;
        _FOLDER_NAME = @"D11PerformanceLog";

        _logs = [NSMutableDictionary dictionary];
        _result = [NSMutableDictionary dictionary];
    }
    return self;
}

- (void)addStartTimeWithName:(NSString *)name timestamp:(NSString *)timestamp {
    if (self.logs[name]) {
        [self.logs[name][self.START_TIME] addObject:@(timestamp.doubleValue)];
    } else {
        self.logs[name] = [@{
            self.START_TIME: [@[ @(timestamp.doubleValue) ] mutableCopy],
            self.END_TIME: [NSMutableArray array]
        } mutableCopy];
    }

    [self writeToFileWithFileName:name contentToWrite:[NSString stringWithFormat:@"%@ %@", self.START_TIME, timestamp]];
}

- (void)addEndTimeWithName:(NSString *)name timestamp:(NSString *)timestamp {
    if (self.logs[name]) {
        [self.logs[name][self.END_TIME] addObject:@(timestamp.doubleValue)];
    } else {
        self.logs[name] = [@{
            self.START_TIME: [NSMutableArray array],
            self.END_TIME: [@[ @(timestamp.doubleValue) ] mutableCopy]
        } mutableCopy];
    }

    [self writeToFileWithFileName:name contentToWrite:[NSString stringWithFormat:@"%@ %@", self.END_TIME, timestamp]];
}

- (void)writeToFileWithFileName:(NSString *)fileName contentToWrite:(NSString *)contentToWrite {
    @try {
        NSFileManager *fileManager = [NSFileManager defaultManager];
        NSURL *documentsURL = [fileManager URLForDirectory:NSDocumentDirectory inDomain:NSUserDomainMask appropriateForURL:nil create:YES error:nil];
        NSURL *folderURL = [documentsURL URLByAppendingPathComponent:self.FOLDER_NAME];
        [fileManager createDirectoryAtURL:folderURL withIntermediateDirectories:YES attributes:nil error:nil];

        NSURL *logFileURL = [folderURL URLByAppendingPathComponent:[NSString stringWithFormat:@"%@.txt", fileName]];

        if (![fileManager fileExistsAtPath:logFileURL.path]) {
            [fileManager createFileAtPath:logFileURL.path contents:nil attributes:nil];
        }

        NSFileHandle *fileWriter = [NSFileHandle fileHandleForWritingToURL:logFileURL error:nil];
        [fileWriter seekToEndOfFile];
        [fileWriter writeData:[contentToWrite dataUsingEncoding:NSUTF8StringEncoding]];
        [fileWriter writeData:[@"\n" dataUsingEncoding:NSUTF8StringEncoding]];
        [fileWriter closeFile];
    } @catch (NSException *exception) {
        NSLog(@"Error writing to file: %@", exception);
    }
}

- (void)resetLogs {
    self.logs = [NSMutableDictionary dictionary];
    self.result = [NSMutableDictionary dictionary];
}

- (NSDictionary<NSString *, NSDictionary<NSString *, NSNumber *> *> *)generateReport {
    if (self.logs.count == 0) {
        return self.result;
    }

    [self.logs enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSMutableDictionary<NSString *, NSMutableArray<NSNumber *> *> *value, BOOL *stop) {
        NSArray<NSNumber *> *startTime = value[self.START_TIME] ?: @[];
        NSArray<NSNumber *> *endTime = value[self.END_TIME] ?: @[];
        
        NSMutableArray<NSNumber *> *difference = [NSMutableArray array];

        NSUInteger listSize = startTime.count;

        for (NSUInteger i = 0; i < listSize; i++) {
            [difference addObject:@(fabs(endTime[i].doubleValue - startTime[i].doubleValue))];
        }

        double mean = [self getAverageWithTimestamps:difference] / 1000.0;
        double standardDeviation = [self getStandardDeviationWithMean:mean timestamps:difference] / 1000.0;
        double errorRate = [self getErrorRateWithStandardDeviation:standardDeviation size:difference.count] / 1000.0;

        [self writeToFileWithFileName:key contentToWrite:[NSString stringWithFormat:@"%@ %f", self.MEAN, mean]];
        [self writeToFileWithFileName:key contentToWrite:[NSString stringWithFormat:@"%@ %f", self.STANDARD_DEVIATION, standardDeviation]];
        [self writeToFileWithFileName:key contentToWrite:[NSString stringWithFormat:@"%@ %f", self.ERROR_RATE, errorRate]];

        self.result[key] = [NSMutableDictionary dictionaryWithDictionary:@{
            self.MEAN: @(mean),
            self.STANDARD_DEVIATION: @(standardDeviation),
            self.ERROR_RATE: @(errorRate)
        }];
    }];

    return self.result;
}

- (double)getStandardDeviationWithMean:(double)mean timestamps:(NSArray<NSNumber *> *)timestamps {
    // Calculate squared differences
    NSMutableArray<NSNumber *> *squaredDifferences = [NSMutableArray array];
    for (NSNumber *timestamp in timestamps) {
        double difference = timestamp.doubleValue - mean;
        [squaredDifferences addObject:@(difference * difference)];
    }

    // Calculate sum of squared differences
    double squaredDifferencesSum = [[squaredDifferences valueForKeyPath:@"@sum.doubleValue"] doubleValue];

    // Calculate variance and return standard deviation
    double variance = squaredDifferencesSum / squaredDifferences.count;
    return sqrt(variance);
}


- (double)getErrorRateWithStandardDeviation:(double)standardDeviation size:(NSUInteger)size {
    return (standardDeviation * self.Z_VALUE * 100) / sqrt(size);
}

- (double)getAverageWithTimestamps:(NSArray<NSNumber *> *)timestamps {
    double sum = [[timestamps valueForKeyPath:@"@sum.self"] doubleValue];
    return sum / timestamps.count;
}

- (NSString *)getLogs {
    return [self.logs description];
}

@end
