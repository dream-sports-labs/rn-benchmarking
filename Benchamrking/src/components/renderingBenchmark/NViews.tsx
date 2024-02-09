import React from 'react';
import {StyleSheet, View} from 'react-native';
import PerformanceLoggerView from 'react-native-performance/js/RNPerformanceView';
// import PerformanceLoggerView from 'rtn-performance/js/PerformanceLoggerViewNativeComponent';
import {RENDERING_CONSTANTS, TEST_ID_CONSTANTS} from '../../Constants';
import {MainProps} from './Main';

type NViewsProps = {
  itemsToRender: number;
} & MainProps;

function NViews({itemsToRender}: NViewsProps) {
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
      <PerformanceLoggerView tagName={RENDERING_CONSTANTS.NViews} />
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
