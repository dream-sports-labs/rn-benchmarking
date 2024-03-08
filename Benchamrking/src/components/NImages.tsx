import React from 'react';
import {StyleSheet, Image, View} from 'react-native';
import PerformanceLoggerView from 'benchmarking-package/src/Component';
import {RENDERING_CONSTANTS, TEST_ID_CONSTANTS} from '../Constants';

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
      source={{
        uri: 'https://placekitten.com/100/100',
      }}
      resizeMode='cover'
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
  image: {
    height: 100,
    justifyContent: 'center',
    marginBottom: 10,
  },
});
export default NImages;
