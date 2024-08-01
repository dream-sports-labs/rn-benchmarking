import {ReportsType} from './RnBenchmarkingWebPage.interface'

export const Reports: ReportsType = {
  '0.73.2/android/oldarch': require('./Reports/0.73.2/android/oldarch.json'),
  '0.73.2/android/newarch': require('./Reports/0.73.2/android/newarch.json'),
  '0.73.2/ios/oldarch': require('./Reports/0.73.2/ios/oldarch.json'),
  '0.73.2/ios/newarch': require('./Reports/0.73.2/ios/newarch.json'),
  '0.73.5/ios/newarch': require('./Reports/0.73.5/ios/newarch.json'),
  '0.73.5/ios/oldarch': require('./Reports/0.73.5/ios/oldarch.json'),
  '0.73.5/android/newarch': require('./Reports/0.73.5/android/newarch.json'),
  '0.73.5/android/oldarch': require('./Reports/0.73.5/android/oldarch.json'),
}

export const GraphBarColor = ['#05DEFF', '#A780E9', '#0074E8', '#FF7070']

export const xAxisLabels = 'App Versions'
export const yAxisLabels = 'Seconds'
