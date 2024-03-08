import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {RENDERING_CONSTANTS, TEST_ID_CONSTANTS} from '../Constants';
import PerformanceLoggerView from 'benchmarking-package/src/Component';

type NTextsProps = {
  itemsToRender: number;
  tagName: RENDERING_CONSTANTS
}

function NTexts({itemsToRender, tagName}: NTextsProps) {
  const items = Array.from(Array(itemsToRender).keys()).map(x => (
    <Text
      key={x}
      style={styles.text}
      testID={`${TEST_ID_CONSTANTS.TEXT_CONTAINER}_${x}`}
      accessible={true}>
      Sample text for benchmarking
    </Text>
  ));

  return (
    <View accessible={false}>
      {items}
      <PerformanceLoggerView tagName={tagName} />
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
});

export default NTexts;
