export interface BenchmarkItem {
  id: string;
  title: string;
  description: string;
  benchmarkUrl: string;
  repoUrl: string;
  icon: string;
  category: string;
  type: 'single' | 'multiple';
  libraries?: Array<{
    name: string;
    version: string;
    url: string;
  }>;
}

export const BENCHMARKS: BenchmarkItem[] = [
  // Available Benchmarks (shown first)
  {
    id: 'rn-navigation',
    title: 'React Navigation',
    description: 'Native vs JS stack load time performance benchmarks',
    benchmarkUrl: 'https://dream-sports-labs.github.io/react-navigation-benchmark/',
    repoUrl: 'https://github.com/dream-sports-labs/react-navigation-benchmark',
    icon: '🧭',
    category: 'Navigation',
    type: 'multiple',
    libraries: [
      {
        name: '@react-navigation/native',
        version: '7.1.8',
        url: 'https://reactnavigation.org/docs/native-stack-navigator/'
      },
      {
        name: '@react-navigation/stack',
        version: '7.3.1',
        url: 'https://reactnavigation.org/docs/stack-navigator/'
      }
    ]
  },
  {
    id: 'gotham-bottomsheet',
    title: 'Gorham BottomSheet',
    description: 'BottomSheet performance benchmarks across different versions',
    benchmarkUrl: 'https://dream-sports-labs.github.io/GorhomBottomSheetBenchmark/',
    repoUrl: 'https://github.com/dream-sports-labs/GorhomBottomSheetBenchmark',
    icon: '📊',
    category: 'Components',
    type: 'single',
    libraries: [
      {
        name: '@gorhom/bottom-sheet',
        version: '4.4.5',
        url: 'https://gorhom.dev/react-native-bottom-sheet/'
      },
      {
        name: '@gorhom/bottom-sheet',
        version: '5.1.5',
        url: 'https://gorhom.dev/react-native-bottom-sheet/'
      }
    ]
  },
  {
    id: 'webview-benchmarks',
    title: 'WebView Performance',
    description: 'WebView rendering and loading benchmarks across versions',
    benchmarkUrl: 'https://dream-sports-labs.github.io/rn-webview-benchmark/',
    repoUrl: 'https://github.com/dream-sports-labs/rn-webview-benchmark',
    icon: '🌐',
    category: 'WebView',
    type: 'single',
    libraries: [
      {
        name: 'react-native-webview',
        version: '13.13.5',
        url: 'https://github.com/react-native-webview/react-native-webview'
      },
      {
        name: 'react-native-webview',
        version: '13.14.1',
        url: 'https://github.com/react-native-webview/react-native-webview'
      }
    ]
  },
  {
    id: 'rn-bottomtabs',
    title: 'React Native Bottom Tabs',
    description: 'Native vs JS bottom tab comparison in terms of Tab Load time and Tab Switch time using Native Stack.',
    benchmarkUrl: 'https://dream-sports-labs.github.io/rn-tabs-benchmarks/',
    repoUrl: 'https://github.com/dream-sports-labs/rn-tabs-benchmarks',
    icon: '📱',
    category: 'Navigation',
    type: 'multiple',
    libraries: [
      {
        name: 'react-native-bottom-tabs',
        version: '0.8.6',
        url: 'https://callstackincubator.github.io/react-native-bottom-tabs/'
      },
      {
        name: 'react-navigation/bottom-tabs',
        version: '7.0.11',
        url: 'https://reactnavigation.org/docs/bottom-tab-navigator'
      }
    ]
  },
  {
    id: 'turbo-vs-nitro',
    title: 'Turbo vs Nitro Modules',
    description: 'Performance comparison between Turbo Modules and Nitro Modules',
    benchmarkUrl: '', // Add your benchmark URL here
    repoUrl: '', // Add your repo URL here
    icon: '⚡',
    category: 'Modules',
    type: 'multiple',
    libraries: [
      {
        name: 'Turbo Modules',
        version: 'React Native 0.79',
        url: 'https://reactnative.dev/docs/the-new-architecture/turbo-modules'
      },
      {
        name: 'Nitro Modules',
        version: 'React Native 0.79',
        url: 'https://github.com/react-native-community/discussions-and-proposals/pull/733'
      }
    ]
  }
];