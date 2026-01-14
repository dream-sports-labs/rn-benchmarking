import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './GraphContainer.css';
import { GenerateReportProps } from '../../RnBenchmarkingWebPage.interface';
import { useTheme } from '../../contexts/ThemeContext';
import { ViewIcon, TextIcon, ImageIcon, TrendingDownIcon, TrendingUpIcon, CheckIcon } from '../ui/Icons';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Chart Colors
const CHART_COLORS = [
  'rgba(0, 212, 170, 0.85)',   // Accent Teal
  'rgba(99, 102, 241, 0.85)',  // Indigo
  'rgba(245, 158, 11, 0.85)',  // Amber
  'rgba(236, 72, 153, 0.85)',  // Pink
  'rgba(34, 197, 94, 0.85)',   // Green
  'rgba(168, 85, 247, 0.85)',  // Purple
  'rgba(59, 130, 246, 0.85)',  // Blue
  'rgba(239, 68, 68, 0.85)',   // Red
  'rgba(20, 184, 166, 0.85)',  // Teal
  'rgba(251, 146, 60, 0.85)',  // Orange
  'rgba(139, 92, 246, 0.85)',  // Violet
  'rgba(6, 182, 212, 0.85)',   // Cyan
];

const CHART_BORDERS = [
  'rgb(0, 212, 170)',
  'rgb(99, 102, 241)',
  'rgb(245, 158, 11)',
  'rgb(236, 72, 153)',
  'rgb(34, 197, 94)',
  'rgb(168, 85, 247)',
  'rgb(59, 130, 246)',
  'rgb(239, 68, 68)',
  'rgb(20, 184, 166)',
  'rgb(251, 146, 60)',
  'rgb(139, 92, 246)',
  'rgb(6, 182, 212)',
];

// Helper to format label for display
const formatLabel = (label: string): string => {
  const parts = label.split('/');
  const version = parts[0];
  const platform = parts[1]?.charAt(0).toUpperCase() + parts[1]?.slice(1) || '';
  const arch = parts[2] === 'newarch' ? 'New' : 'Old';
  return `${version} ${platform} ${arch}`;
};

// Helper to get short label
const getShortLabel = (label: string): string => {
  const parts = label.split('/');
  const version = parts[0];
  const platform = parts[1]?.charAt(0).toUpperCase() || '';
  const arch = parts[2] === 'newarch' ? 'N' : 'O';
  return `${version} ${platform}${arch}`;
};

interface PerformanceAnalysis {
  bestIndex: number;
  bestLabel: string;
  bestValue: number;
  worstIndex: number;
  worstLabel: string;
  worstValue: number;
  improvement: number; // percentage improvement from worst to best
  avgValue: number;
}

const analyzePerformance = (labels: string[], data: number[]): PerformanceAnalysis | null => {
  if (data.length === 0 || data.every(v => v === 0)) return null;

  let bestIndex = 0;
  let worstIndex = 0;
  let sum = 0;

  data.forEach((value, index) => {
    if (value < data[bestIndex]) bestIndex = index;
    if (value > data[worstIndex]) worstIndex = index;
    sum += value;
  });

  const bestValue = data[bestIndex];
  const worstValue = data[worstIndex];
  const improvement = worstValue > 0 ? ((worstValue - bestValue) / worstValue) * 100 : 0;

  return {
    bestIndex,
    bestLabel: labels[bestIndex],
    bestValue,
    worstIndex,
    worstLabel: labels[worstIndex],
    worstValue,
    improvement,
    avgValue: sum / data.length,
  };
};

interface BenchmarkCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  labels: string[];
  data: number[];
  theme: 'light' | 'dark';
  maxValue: number;
  accentColor: string;
}

const BenchmarkCard: React.FC<BenchmarkCardProps> = ({
  title,
  subtitle,
  icon,
  labels,
  data,
  theme,
  maxValue,
  accentColor,
}) => {
  const isDark = theme === 'dark';
  const analysis = analyzePerformance(labels, data);

  const chartData = {
    labels: labels.map((label) => getShortLabel(label)),
    datasets: [
      {
        data,
        backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderColor: labels.map((_, i) => CHART_BORDERS[i % CHART_BORDERS.length]),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#1f1f2a' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#1a1a1a',
        bodyColor: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (items: any[]) => {
            const index = items[0]?.dataIndex;
            return formatLabel(labels[index]);
          },
          label: (context: any) => ` ${context.raw.toFixed(2)}s`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          font: {
            size: 9,
            family: "'JetBrains Mono', monospace",
          },
          maxRotation: 45,
          minRotation: 45,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        max: maxValue,
        grid: {
          color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        },
        ticks: {
          color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          font: {
            size: 11,
            family: "'JetBrains Mono', monospace",
          },
          callback: (value: any) => `${value}s`,
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="benchmark-card">
      <div className="benchmark-card__header">
        <div className="benchmark-card__icon" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
          {icon}
        </div>
        <div className="benchmark-card__title-group">
          <h3 className="benchmark-card__title">{title}</h3>
          <span className="benchmark-card__subtitle">{subtitle}</span>
        </div>
      </div>

      {/* Performance Summary */}
      {analysis && data.length > 1 && (
        <div className="benchmark-card__summary">
          <div className="benchmark-card__winner">
            <CheckIcon size={14} />
            <span className="benchmark-card__winner-label">Fastest:</span>
            <span className="benchmark-card__winner-value">
              {formatLabel(analysis.bestLabel)}
            </span>
            <span className="benchmark-card__winner-time">{analysis.bestValue.toFixed(2)}s</span>
          </div>
          {analysis.improvement > 0 && (
            <div className="benchmark-card__improvement">
              <TrendingUpIcon size={12} />
              <span>{analysis.improvement.toFixed(1)}% faster than slowest</span>
            </div>
          )}
        </div>
      )}

      <div className="benchmark-card__stats">
        <div className="benchmark-card__stat">
          <span className="benchmark-card__stat-label">Average</span>
          <span className="benchmark-card__stat-value">
            {analysis ? `${analysis.avgValue.toFixed(2)}s` : '—'}
          </span>
        </div>
        <div className="benchmark-card__stat">
          <span className="benchmark-card__stat-label">Best</span>
          <span className="benchmark-card__stat-value benchmark-card__stat-value--best">
            {analysis ? `${analysis.bestValue.toFixed(2)}s` : '—'}
          </span>
        </div>
        <div className="benchmark-card__stat">
          <span className="benchmark-card__stat-label">Worst</span>
          <span className="benchmark-card__stat-value benchmark-card__stat-value--worst">
            {analysis ? `${analysis.worstValue.toFixed(2)}s` : '—'}
          </span>
        </div>
      </div>
      <div className="benchmark-card__chart">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export const GraphContainer = ({
  labels,
  fifteenHundredViewDataLabels,
  fifteenHundredTextDataLabels,
  fifteenHundredImageDataLabels,
  fiveThousandViewDataLabels,
  fiveThousandTextDataLabels,
  fiveThousandImageDataLabels,
}: GenerateReportProps) => {
  const { theme } = useTheme();

  // Calculate max values for consistent scaling
  const max1500 = Math.ceil(
    Math.max(
      ...fifteenHundredViewDataLabels,
      ...fifteenHundredTextDataLabels,
      ...fifteenHundredImageDataLabels,
      1
    ) * 1.2
  );

  const max5000 = Math.ceil(
    Math.max(
      ...fiveThousandViewDataLabels,
      ...fiveThousandTextDataLabels,
      ...fiveThousandImageDataLabels,
      1
    ) * 1.2
  );

  // Analyze overall performance across all benchmarks
  const allData1500 = [
    ...fifteenHundredViewDataLabels,
    ...fifteenHundredTextDataLabels,
    ...fifteenHundredImageDataLabels,
  ];
  const allData5000 = [
    ...fiveThousandViewDataLabels,
    ...fiveThousandTextDataLabels,
    ...fiveThousandImageDataLabels,
  ];

  // Calculate average per configuration for overall winner
  const getOverallWinner = (
    viewData: number[],
    textData: number[],
    imageData: number[]
  ): { label: string; avgTime: number } | null => {
    if (labels.length === 0) return null;

    const avgTimes = labels.map((label, i) => {
      const avg = (viewData[i] + textData[i] + imageData[i]) / 3;
      return { label, avgTime: avg };
    });

    return avgTimes.reduce((best, current) =>
      current.avgTime < best.avgTime ? current : best
    );
  };

  const overall1500Winner = getOverallWinner(
    fifteenHundredViewDataLabels,
    fifteenHundredTextDataLabels,
    fifteenHundredImageDataLabels
  );

  const overall5000Winner = getOverallWinner(
    fiveThousandViewDataLabels,
    fiveThousandTextDataLabels,
    fiveThousandImageDataLabels
  );

  const benchmarks = [
    {
      title: '1500 Views',
      subtitle: 'View component render time',
      icon: <ViewIcon size={20} />,
      data: fifteenHundredViewDataLabels,
      maxValue: max1500,
      accentColor: '#00d4aa',
    },
    {
      title: '1500 Text',
      subtitle: 'Text component render time',
      icon: <TextIcon size={20} />,
      data: fifteenHundredTextDataLabels,
      maxValue: max1500,
      accentColor: '#6366f1',
    },
    {
      title: '1500 Images',
      subtitle: 'Image component render time',
      icon: <ImageIcon size={20} />,
      data: fifteenHundredImageDataLabels,
      maxValue: max1500,
      accentColor: '#f59e0b',
    },
    {
      title: '5000 Views',
      subtitle: 'View component render time',
      icon: <ViewIcon size={20} />,
      data: fiveThousandViewDataLabels,
      maxValue: max5000,
      accentColor: '#00d4aa',
    },
    {
      title: '5000 Text',
      subtitle: 'Text component render time',
      icon: <TextIcon size={20} />,
      data: fiveThousandTextDataLabels,
      maxValue: max5000,
      accentColor: '#6366f1',
    },
    {
      title: '5000 Images',
      subtitle: 'Image component render time',
      icon: <ImageIcon size={20} />,
      data: fiveThousandImageDataLabels,
      maxValue: max5000,
      accentColor: '#f59e0b',
    },
  ];

  return (
    <div className="graph-container">
      {/* Header */}
      <div className="graph-container__header">
        <div className="graph-container__title-group">
          <h2 className="graph-container__title">Benchmark Results</h2>
          <p className="graph-container__subtitle">
            <TrendingDownIcon size={14} />
            <span>Lower render time is better</span>
          </p>
        </div>
        <div className="graph-container__legend">
          {labels.map((label, index) => (
            <div key={label} className="graph-container__legend-item">
              <span
                className="graph-container__legend-color"
                style={{ backgroundColor: CHART_BORDERS[index % CHART_BORDERS.length] }}
              />
              <span className="graph-container__legend-label">
                {formatLabel(label)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section Headers - 1500 */}
      <div className="graph-container__section">
        <div className="graph-container__section-header">
          <div>
            <h3 className="graph-container__section-title">1500 Components</h3>
            <p className="graph-container__section-desc">Moderate load test with 1500 components</p>
          </div>
          {overall1500Winner && labels.length > 1 && (
            <div className="graph-container__section-winner">
              <CheckIcon size={14} />
              <span>Overall Winner:</span>
              <strong>{formatLabel(overall1500Winner.label)}</strong>
              <span className="graph-container__section-winner-time">
                avg {overall1500Winner.avgTime.toFixed(2)}s
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid - 1500 */}
      <div className="graph-container__grid">
        {benchmarks.slice(0, 3).map((benchmark) => (
          <BenchmarkCard
            key={benchmark.title}
            title={benchmark.title}
            subtitle={benchmark.subtitle}
            icon={benchmark.icon}
            labels={labels}
            data={benchmark.data}
            theme={theme}
            maxValue={benchmark.maxValue}
            accentColor={benchmark.accentColor}
          />
        ))}
      </div>

      {/* Section Headers - 5000 */}
      <div className="graph-container__section">
        <div className="graph-container__section-header">
          <div>
            <h3 className="graph-container__section-title">5000 Components</h3>
            <p className="graph-container__section-desc">Heavy load test with 5000 components</p>
          </div>
          {overall5000Winner && labels.length > 1 && (
            <div className="graph-container__section-winner">
              <CheckIcon size={14} />
              <span>Overall Winner:</span>
              <strong>{formatLabel(overall5000Winner.label)}</strong>
              <span className="graph-container__section-winner-time">
                avg {overall5000Winner.avgTime.toFixed(2)}s
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid - 5000 */}
      <div className="graph-container__grid">
        {benchmarks.slice(3).map((benchmark) => (
          <BenchmarkCard
            key={benchmark.title}
            title={benchmark.title}
            subtitle={benchmark.subtitle}
            icon={benchmark.icon}
            labels={labels}
            data={benchmark.data}
            theme={theme}
            maxValue={benchmark.maxValue}
            accentColor={benchmark.accentColor}
          />
        ))}
      </div>
    </div>
  );
};

export default GraphContainer;
