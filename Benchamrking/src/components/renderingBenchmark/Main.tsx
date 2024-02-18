import React, {useRef, useState} from 'react';
import {View, Button, StyleSheet, SafeAreaView} from 'react-native';
import {RENDERING_CONSTANTS, TEST_ID_CONSTANTS} from '../../Constants';
import RenderingContainer from './RenderingContainer';
import PerformanceLogger from 'react-native-performance/js/RNPerformanceModule';
// import PerformanceLogger from 'rtn-performance/js/NativePerformanceModule';

export type MainProps = {
  itemsToRender: number;
};

function Main({itemsToRender = 1000}: MainProps) {
  const [toRender, setToRender] = useState<RENDERING_CONSTANTS>();
  const renderedItem = useRef<RENDERING_CONSTANTS>();

  const onPress = (toRender: RENDERING_CONSTANTS, timeStamp: string) => {
    if (
      toRender !== RENDERING_CONSTANTS.RESET_VIEW &&
      toRender !== RENDERING_CONSTANTS.RENDER_FLATLIST &&
      toRender !== RENDERING_CONSTANTS.RENDER_ANIMATIONS &&
      toRender !== renderedItem.current
    ) {
      PerformanceLogger?.logTimeToStorage(toRender.toString(), timeStamp);
    }

    renderedItem.current = toRender;
    setToRender(toRender);
  };

  const getReport = async () => {
    const report = await PerformanceLogger?.generateReport();
    console.log('********************');
    console.log(report);
    console.log('********************');
  };

  const resetLogs = () => {
    PerformanceLogger?.resetLogs();
  };

  return (
    <SafeAreaView>
      <View style={styles.buttonsContainer}>
        <Button
          title={RENDERING_CONSTANTS.NViews}
          testID={TEST_ID_CONSTANTS.RENDER_VIEW_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS.NViews, timeStamp.toString())
          }
        />
        <Button
          title={RENDERING_CONSTANTS.NTexts}
          testID={TEST_ID_CONSTANTS.RENDER_TEXT_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS.NTexts, timeStamp.toString())
          }
        />
        <Button
          title={RENDERING_CONSTANTS.NImages}
          testID={TEST_ID_CONSTANTS.RENDER_IMAGE_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS.NImages, timeStamp.toString())
          }
        />
        <Button
          title={RENDERING_CONSTANTS.RESET_VIEW}
          testID={TEST_ID_CONSTANTS.RESET_VIEW_BUTTON}
          onPress={({timeStamp}) =>
            onPress(RENDERING_CONSTANTS.RESET_VIEW, timeStamp.toString())
          }
        />
      </View>
      <View style={styles.buttonsContainer}>
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
        <Button
          title={RENDERING_CONSTANTS.GET_REPORT}
          testID={TEST_ID_CONSTANTS.GET_REPORT_BUTTON}
          onPress={getReport}
        />
      </View>
      <RenderingContainer toRender={toRender} itemsToRender={itemsToRender} />
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
