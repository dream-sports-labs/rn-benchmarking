import {
    StyleProp,
    StyleSheet,
    ViewStyle,
    requireNativeComponent,
  } from "react-native";
  
  type PerformanceLogggerViewProps = {
    tagName: string;
  };
  
  const PerformanceLoggerViewWrapper = requireNativeComponent<
    PerformanceLogggerViewProps & {
      style: StyleProp<ViewStyle>;
    }
  >("PerformanceLoggerView");
  
  function PerformanceLoggerView(props: PerformanceLogggerViewProps) {
    return <PerformanceLoggerViewWrapper {...props} style={styles.container} />;
  }
  
  const styles = StyleSheet.create({
    container: {
      width: "100%",
      height: 10,
    },
  });
  
  export default PerformanceLoggerView;
  