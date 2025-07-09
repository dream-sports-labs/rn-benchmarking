import React from 'react';
import {StyleSheet, Image, View} from 'react-native';
import {RENDERING_CONSTANTS, TEST_ID_CONSTANTS} from '../Constants';
import { PerformanceTracker } from '@d11/marco';

type NImagesProps = {
  itemsToRender: number;
  tagName: RENDERING_CONSTANTS
}

function NImages({itemsToRender, tagName}: NImagesProps) {
  const items = Array.from(Array(itemsToRender).keys()).map(x => (
    <Image
      accessible={true}
      testID={`${TEST_ID_CONSTANTS.IMAGE_CONTAINER}_${x}`}
      key={x}
      style={styles.image}
      source={require('../../src/assets/Mumbai.jpeg')}
      resizeMode='cover'
    />
  ));

  return (
    <PerformanceTracker tagName={`${tagName}_PAINT_END_TIME`}>
      {items}
    </PerformanceTracker>
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
