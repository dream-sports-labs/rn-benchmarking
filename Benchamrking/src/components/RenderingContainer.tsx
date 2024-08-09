import React, {View, ScrollView, StyleSheet} from 'react-native';
import {RENDERING_CONSTANTS} from '../Constants';
import NViews from './NViews';
import NTexts from './NTexts';
import NImages from './NImages';
import FlatlistPerformance from './FlatlistPerformace';
import AnimationPerformance from './AnimationPerformance';

type RenderingContainerProps = {
  toRender: RENDERING_CONSTANTS | undefined;
};
function RenderingContainer(props: RenderingContainerProps) {
  const {toRender} = props;

  let content;

  switch (toRender) {
    case RENDERING_CONSTANTS['1500View']:
      content = (
        <NViews
          itemsToRender={1500}
          tagName={RENDERING_CONSTANTS['1500View']}
        />
      );
      break;
    case RENDERING_CONSTANTS['1500Text']:
      content = (
        <NTexts
          itemsToRender={1500}
          tagName={RENDERING_CONSTANTS['1500Text']}
        />
      );
      break;
    case RENDERING_CONSTANTS['1500Image']:
      content = (
        <NImages
          itemsToRender={1500}
          tagName={RENDERING_CONSTANTS['1500Image']}
        />
      );
      break;
    case RENDERING_CONSTANTS['5000View']:
      content = (
        <NViews
          itemsToRender={5000}
          tagName={RENDERING_CONSTANTS['5000View']}
        />
      );
      break;
    case RENDERING_CONSTANTS['5000Text']:
      content = (
        <NTexts
          itemsToRender={5000}
          tagName={RENDERING_CONSTANTS['5000Text']}
        />
      );
      break;
    case RENDERING_CONSTANTS['5000Image']:
      content = (
        <NImages
          itemsToRender={5000}
          tagName={RENDERING_CONSTANTS['5000Image']}
        />
      );
      break;
    case RENDERING_CONSTANTS.RENDER_FLATLIST:
      content = <FlatlistPerformance itemsToRender={1500} />;
      break;
    case RENDERING_CONSTANTS.RENDER_ANIMATIONS:
      content = <AnimationPerformance itemsToRender={1500} />;
      break;
    case RENDERING_CONSTANTS.RESET_VIEW:
      content = <View style={styles.emptyView} testID="render_empty_view" />;
      break;
  }

  if (
    toRender === RENDERING_CONSTANTS.RENDER_FLATLIST ||
    toRender === RENDERING_CONSTANTS.RENDER_ANIMATIONS
  ) {
    return content;
  }

  return <ScrollView>{content}</ScrollView>;
}

const styles = StyleSheet.create({
  emptyView: {
    width: '100%',
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default RenderingContainer;
