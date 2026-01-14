type ReportsType = {
  [key: string]: any
} 
export const Reports: ReportsType = {
  "0.80/android/newarch/debug": require("./Reports/0.80/android/newarch/debug/newarch.json"),
  "0.80/android/newarch/release": require("./Reports/0.80/android/newarch/release/newarch.json"),
  "0.80/android/oldarch/debug": require("./Reports/0.80/android/oldarch/debug/oldarch.json"),
  "0.80/android/oldarch/release": require("./Reports/0.80/android/oldarch/release/oldarch.json"),
};
