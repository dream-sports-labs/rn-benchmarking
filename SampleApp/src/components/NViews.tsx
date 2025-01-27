import React from 'react';
import {StyleSheet, View} from 'react-native';
import PerformanceLoggerView from 'benchmarking-package/src/Component';
import {RENDERING_CONSTANTS, TEST_ID_CONSTANTS} from '../Constants';

type NViewsProps = {
  itemsToRender: number;
  tagName: RENDERING_CONSTANTS
}

function NViews({itemsToRender, tagName}: NViewsProps) {
  const items = Array.from(Array(itemsToRender).keys()).map(x => (
    <View
      key={x}
      style={styles.view}
      accessible={true}
      testID={`${TEST_ID_CONSTANTS.VIEW_CONTAINER}_${x}`}
    />
  ));

  return (
    <View accessible={false}>
      {items}
      <PerformanceLoggerView tagName={tagName} />
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    height: 100,
    margin: 10,
    backgroundColor: '#0088a9',
  },
});
export default NViews;
