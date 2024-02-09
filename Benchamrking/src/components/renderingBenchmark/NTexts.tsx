import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {RENDERING_CONSTANTS, TEST_ID_CONSTANTS} from '../../Constants';
import PerformanceLoggerView from 'react-native-performance/js/RNPerformanceView';
// import PerformanceLoggerView from 'rtn-performance/js/PerformanceLoggerViewNativeComponent';
import {MainProps} from './Main';

type NTextsProps = {
  itemsToRender: number;
} & MainProps;

function NTexts({itemsToRender}: NTextsProps) {
  const items = Array.from(Array(itemsToRender).keys()).map(x => (
    <Text
      key={x}
      style={styles.text}
      testID={`${TEST_ID_CONSTANTS.TEXT_CONTAINER}_${x}`}
      accessible={true}>
      Rendering Text From RN 0.73.x
    </Text>
  ));

  return (
    <View accessible={false}>
      {items}
      <PerformanceLoggerView tagName={RENDERING_CONSTANTS.NTexts} />
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#0088a9',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NTexts;
