import {
  StyleProp,
  StyleSheet,
  ViewStyle,
  requireNativeComponent,
} from "react-native";

type RNPerformanceViewProps = {
  tagName: string;
};

const RNPerformanceViewWrapper = requireNativeComponent<
  RNPerformanceViewProps & {
    style: StyleProp<ViewStyle>;
  }
>("RNPerformanceView");

function RNPerformanceView(props: RNPerformanceViewProps) {
  return <RNPerformanceViewWrapper {...props} style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 10,
  },
});

export default RNPerformanceView;
