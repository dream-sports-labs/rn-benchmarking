export interface BenchmarkItem {
  id: string;
  title: string;
  description: string;
  benchmarkUrl: string;
  repoUrl: string;
  icon: string;
  category: string;
}

export const BENCHMARKS: BenchmarkItem[] = [
  // Available Benchmarks (shown first)
  {
    id: 'rn-navigation',
    title: 'React Navigation',
    description: 'Native vs JS navigation performance benchmarks and metrics',
    benchmarkUrl: 'https://dream-sports-labs.github.io/react-navigation-benchmark/',
    repoUrl: '', // Add your repo URL here
    icon: '🧭',
    category: 'Navigation'
  },
  {
    id: 'gotham-bottomsheet',
    title: 'Gorham BottomSheet',
    description: 'BottomSheet performance benchmarks across different versions',
    benchmarkUrl: 'https://dream-sports-labs.github.io/GorhomBottomSheetBenchmark/',
    repoUrl: 'https://github.com/dream-sports-labs/GorhomBottomSheetBenchmark',
    icon: '📊',
    category: 'Components'
  },
  {
    id: 'webview-benchmarks',
    title: 'WebView Performance',
    description: 'WebView rendering and loading benchmarks across versions',
    benchmarkUrl: 'https://dream-sports-labs.github.io/rn-webview-benchmark/',
    repoUrl: '', // Add your repo URL here
    icon: '🌐',
    category: 'WebView'
  },
  // Coming Soon Benchmarks (shown last)
  {
    id: 'rn-bottomtabs',
    title: 'React Native Bottom Tabs',
    description: 'Native vs JS bottom tab implementation performance comparison',
    benchmarkUrl: '', // Add your benchmark URL here
    repoUrl: '', // Add your repo URL here
    icon: '📱',
    category: 'Navigation'
  },
  {
    id: 'turbo-vs-nitro',
    title: 'Turbo vs Nitro Modules',
    description: 'Performance comparison between Turbo Modules and Nitro Modules',
    benchmarkUrl: '', // Add your benchmark URL here
    repoUrl: '', // Add your repo URL here
    icon: '⚡',
    category: 'Modules'
  }
];

// You can easily add more benchmarks here in the future
// Just follow the same structure and they'll automatically appear in the UI 