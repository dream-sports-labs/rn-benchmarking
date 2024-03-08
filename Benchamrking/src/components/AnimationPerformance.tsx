import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {TEST_ID_CONSTANTS} from '../Constants';

type AnimationPerformanceProps = {
  itemsToRender: number;
};

function AnimationPerformance({itemsToRender}: AnimationPerformanceProps) {
  const animationRef = useRef(new Animated.Value(0)).current;

  const spin = animationRef.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const items = Array.from(Array(itemsToRender).keys()).map(x => (
    <Animated.View
      key={x}
      style={[
        styles.viewStyle,
        {
          transform: [
            {
              rotate: spin,
            },
          ],
        },
      ]}
    />
  ));

  useEffect(() => {
    Animated.loop(
      Animated.timing(animationRef, {
        toValue: 1,
        useNativeDriver: true,
        easing: Easing.linear,
        duration: 1000,
      }),
    ).start();
  }, [animationRef]);

  return (
    <View
      style={styles.container}
      testID={TEST_ID_CONSTANTS.ANIMATION_CONTAINER}>
      {items}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  viewStyle: {
    margin: 10,
    width: 50,
    height: 50,
    backgroundColor: '#0088a9',
    borderRadius: 10,
  },
});

export default AnimationPerformance;
