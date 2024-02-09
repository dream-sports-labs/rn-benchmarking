import React from 'react';
import {StyleSheet, Image, View} from 'react-native';
import PerformanceLoggerView from 'react-native-performance/js/RNPerformanceView';
// import PerformanceLoggerView from 'rtn-performance/js/PerformanceLoggerViewNativeComponent';
import {RENDERING_CONSTANTS, TEST_ID_CONSTANTS} from '../../Constants';
import {MainProps} from './Main';

type NImagesProps = {
  itemsToRender: number;
} & MainProps;

function NImages({itemsToRender}: NImagesProps) {
  const items = Array.from(Array(itemsToRender).keys()).map(x => (
    <Image
      accessible={true}
      testID={`${TEST_ID_CONSTANTS.IMAGE_CONTAINER}_${x}`}
      key={x}
      style={styles.image}
      source={require('../../assets/Mumbai.jpeg')}
      resizeMode="cover"
    />
  ));

  return (
    <View accessible={false}>
      {items}
      <PerformanceLoggerView tagName={RENDERING_CONSTANTS.NImages} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 100,
    justifyContent: 'center',
    marginBottom: 10,
  },
});
export default NImages;
