import type { ViewProps } from "react-native";
import type { HostComponent } from "react-native";
import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";

export interface NativeProps extends ViewProps {
  tagName: string;
  // add other props here
}

export default codegenNativeComponent<NativeProps>(
  "PerformanceLoggerView"
) as HostComponent<NativeProps>;
