import React, {View, ScrollView, StyleSheet} from 'react-native';
import {RENDERING_CONSTANTS} from '../../Constants';
import NViews from './NViews';
import NTexts from './NTexts';
import NImages from './NImages';
import FlatlistPerformance from './FlatlistPerformace';
import AnimationPerformance from './AnimationPerformance';
import {MainProps} from './Main';

type RenderingContainerProps = {
  toRender: RENDERING_CONSTANTS | undefined;
} & MainProps;
function RenderingContainer(props: RenderingContainerProps) {
  const {toRender, itemsToRender} = props;

  let content;

  switch (toRender) {
    case RENDERING_CONSTANTS.NViews:
      content = <NViews itemsToRender={itemsToRender} />;
      break;
    case RENDERING_CONSTANTS.NTexts:
      content = <NTexts itemsToRender={itemsToRender} />;
      break;
    case RENDERING_CONSTANTS.NImages:
      content = <NImages itemsToRender={itemsToRender} />;
      break;
    case RENDERING_CONSTANTS.RENDER_FLATLIST:
      content = <FlatlistPerformance itemsToRender={itemsToRender} />;
      break;
    case RENDERING_CONSTANTS.RENDER_ANIMATIONS:
      content = <AnimationPerformance itemsToRender={itemsToRender} />;
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
