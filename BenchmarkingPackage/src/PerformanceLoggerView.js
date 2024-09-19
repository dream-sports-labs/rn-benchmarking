"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
const PerformanceLoggerViewWrapper = (0, react_native_1.requireNativeComponent)("PerformanceLoggerView");
function PerformanceLoggerView(props) {
    return <PerformanceLoggerViewWrapper {...props} style={styles.container}/>;
}
const styles = react_native_1.StyleSheet.create({
    container: {
        width: "100%",
        height: 10,
    },
});
exports.default = PerformanceLoggerView;
