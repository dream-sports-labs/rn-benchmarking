import React, {useRef, useState} from 'react';
import {View, Button, StyleSheet, SafeAreaView} from 'react-native';
import {RENDERING_CONSTANTS, TEST_ID_CONSTANTS} from '../Constants';
import RenderingContainer from './RenderingContainer';
import PerformanceLogger from "benchmarking-package/src/Module"
import { generateReport } from "../helpers/generateReport";

function Main() {
  const [toRender, setToRender] = useState<RENDERING_CONSTANTS>();
  const renderedItem = useRef<RENDERING_CONSTANTS>();

  const onPress = (toRender: RENDERING_CONSTANTS, timeStamp: string) => {
    if (
      toRender !== RENDERING_CONSTANTS.RESET_VIEW &&
      toRender !== RENDERING_CONSTANTS.RENDER_FLATLIST &&
      toRender !== RENDERING_CONSTANTS.RENDER_ANIMATIONS &&
      toRender !== renderedItem.current
    ) {
      PerformanceLogger?.logStartTime(toRender.toString(), timeStamp);
    }
    
    renderedItem.current = toRender;
    setToRender(toRender);
  };

  const getLogs = async () => {
      const logs = await PerformanceLogger?.getLogs();
      // console.log(logs)
      const response = await generateReport(logs)
      if (response) {
        console.log("Report generated successfully.")
        return
      }
  }

  const resetLogs = () => {
    PerformanceLogger?.resetLogs();
  };

  return (
    <SafeAreaView>
      <View style={styles.buttonsContainer}>
        <Button
          title={RENDERING_CONSTANTS['1500View']}
          testID={TEST_ID_CONSTANTS.RENDER_1500_VIEW_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS['1500View'], timeStamp.toString())
          }
        />
        <Button
          title={RENDERING_CONSTANTS['1500Text']}
          testID={TEST_ID_CONSTANTS.RENDER_1500_TEXT_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS['1500Text'], timeStamp.toString())
          }
        />
      <Button
          title={RENDERING_CONSTANTS['1500Image']}
          testID={TEST_ID_CONSTANTS.RENDER_1500_IMAGE_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS['1500Image'], timeStamp.toString())
          }
        />
        </View>
        <View style={styles.buttonsContainer}>
        <Button
          title={RENDERING_CONSTANTS['5000View']}
          testID={TEST_ID_CONSTANTS.RENDER_5000_VIEW_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS['5000View'], timeStamp.toString())
          }
        />
        <Button
          title={RENDERING_CONSTANTS['5000Text']}
          testID={TEST_ID_CONSTANTS.RENDER_5000_TEXT_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS['5000Text'], timeStamp.toString())
          }
        />
              <Button
          title={RENDERING_CONSTANTS['5000Image']}
          testID={TEST_ID_CONSTANTS.RENDER_5000_IMAGE_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS['5000Image'], timeStamp.toString())
          }
        />
      </View>
      <View style={styles.buttonsContainer}>
      <Button
          title={RENDERING_CONSTANTS.RESET_VIEW}
          testID={TEST_ID_CONSTANTS.RESET_VIEW_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS.RESET_VIEW, timeStamp.toString())
          }
        />
        <Button
          title={RENDERING_CONSTANTS.RENDER_FLATLIST}
          testID={TEST_ID_CONSTANTS.RENDER_FLATLIST_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS.RENDER_FLATLIST, timeStamp.toString())
          }
        />
        <Button
          title={RENDERING_CONSTANTS.RENDER_ANIMATIONS}
          testID={TEST_ID_CONSTANTS.RENDER_ANIMATION_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS.RENDER_ANIMATIONS, timeStamp.toString())
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
