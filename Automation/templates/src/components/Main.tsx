
import React, {useRef, useState} from 'react';
import {View, Button, StyleSheet, SafeAreaView} from 'react-native';
import {RENDERING_CONSTANTS, TEST_ID_CONSTANTS} from '../Constants';
import RenderingContainer from './RenderingContainer';
import { PerformanceTracker } from '@d11/marco';
import {generateReport} from '../helpers/generateReport';

function Main() {

  PerformanceTracker.configure({ persistToFile: true });
  const [toRender, setToRender] = useState<RENDERING_CONSTANTS>();
  const renderedItem = useRef<RENDERING_CONSTANTS>();

  const onPress = (toRender: RENDERING_CONSTANTS, timeStamp: number) => {
    if (
      toRender !== RENDERING_CONSTANTS.RESET_VIEW &&
      toRender !== RENDERING_CONSTANTS.RENDER_FLATLIST &&
      toRender !== RENDERING_CONSTANTS.RENDER_ANIMATIONS &&
      toRender !== renderedItem.current
    ) {
      PerformanceTracker?.track(`${toRender.toString()}_PAINT_START_TIME`, timeStamp);
    }

    renderedItem.current = toRender;
    setToRender(toRender);
  };

  const getLogs = async () => {
    const logs = await PerformanceTracker?.getLogs();
    
    const transformedLogs = transformLogs(logs as any[]);
    
    // Generate report with the transformed logs format
    try {
      const response = await generateReport(transformedLogs);
      if (response) {
        console.log('Report generated successfully.');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
    
    return transformedLogs;
  };

  const resetLogs = () => {
    PerformanceTracker?.resetLogs();
  };

  return (
    <SafeAreaView>
      <View style={styles.buttonsContainer}>
        <Button
          title={RENDERING_CONSTANTS['1500View']}
          testID={TEST_ID_CONSTANTS.RENDER_1500_VIEW_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS['1500View'], timeStamp)
          }
        />
        <Button
          title={RENDERING_CONSTANTS['1500Text']}
          testID={TEST_ID_CONSTANTS.RENDER_1500_TEXT_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS['1500Text'], timeStamp)
          }
        />
        <Button
          title={RENDERING_CONSTANTS['1500Image']}
          testID={TEST_ID_CONSTANTS.RENDER_1500_IMAGE_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS['1500Image'], timeStamp)
          }
        />
      </View>
      <View style={styles.buttonsContainer}>
        <Button
          title={RENDERING_CONSTANTS['4000View']}
          testID={TEST_ID_CONSTANTS.RENDER_4000_VIEW_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS['4000View'], timeStamp)
          }
        />
        <Button
          title={RENDERING_CONSTANTS['4000Text']}
          testID={TEST_ID_CONSTANTS.RENDER_4000_TEXT_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS['4000Text'], timeStamp)
          }
        />
        <Button
          title={RENDERING_CONSTANTS['4000Image']}
          testID={TEST_ID_CONSTANTS.RENDER_4000_IMAGE_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS['4000Image'], timeStamp)
          }
        />
      </View>
      <View style={styles.buttonsContainer}>
        <Button
          title={RENDERING_CONSTANTS.RESET_VIEW}
          testID={TEST_ID_CONSTANTS.RESET_VIEW_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS.RESET_VIEW, timeStamp)
          }
        />
        <Button
          title={RENDERING_CONSTANTS.RENDER_FLATLIST}
          testID={TEST_ID_CONSTANTS.RENDER_FLATLIST_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS.RENDER_FLATLIST, timeStamp)
          }
        />
        <Button
          title={RENDERING_CONSTANTS.RENDER_ANIMATIONS}
          testID={TEST_ID_CONSTANTS.RENDER_ANIMATION_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS.RENDER_ANIMATIONS, timeStamp)
          }
        />
        <Button
          title={RENDERING_CONSTANTS.RESET_LOGS}
          testID={TEST_ID_CONSTANTS.RESET_LOGS_BUTTON}
          onPress={resetLogs}
        />
      </View>
      <View style={styles.buttonsContainer}>
        <Button
          title={RENDERING_CONSTANTS.GET_REPORT}
          testID={TEST_ID_CONSTANTS.GET_REPORT_BUTTON}
          onPress={getLogs}
        />
      </View>
      <RenderingContainer toRender={toRender} />
    </SafeAreaView>
  );
}

// Function to transform log data into the desired format
function transformLogs(rawLogs: any[] = []): Record<string, Array<{PAINT_START_TIME: number, PAINT_END_TIME: number}>> {
  if (!rawLogs || !Array.isArray(rawLogs)) return {};
  
  // Create an object to store the transformed data
  const transformedLogs: Record<string, Array<{PAINT_START_TIME: number, PAINT_END_TIME: number}>> = {};
  
  // Create a temporary object to store start times
  const startTimes: Record<string, number> = {};
  
  // Process each log entry
  rawLogs.forEach(log => {
    // Extract component type and event type from the tagName
    const tagParts = log.tagName.split('_');
    const componentType = tagParts[0];
    const eventType = tagParts.slice(1).join('_');
    
    // Initialize the component array if it doesn't exist
    if (!transformedLogs[componentType]) {
      transformedLogs[componentType] = [];
    }
    
    // Handle start time entries
    if (eventType === 'PAINT_START_TIME') {
      // Store the start time with a unique key
      startTimes[`${componentType}_${transformedLogs[componentType].length}`] = log.timestamp;
    }
    // Handle end time entries
    else if (eventType === 'PAINT_END_TIME') {
      // Find the matching start time (use the current group length as key)
      const startKey = `${componentType}_${transformedLogs[componentType].length}`;
      const startTime = startTimes[startKey];
      
      if (startTime) {
        // Create a pair with start and end times
        transformedLogs[componentType].push({
          PAINT_START_TIME: startTime,
          PAINT_END_TIME: log.timestamp
        });
        
        // Remove the used start time
        delete startTimes[startKey];
      }
    }
  });
  
  return transformedLogs;
}

const styles = StyleSheet.create({
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    padding: 5,
  },
});

export default Main;
