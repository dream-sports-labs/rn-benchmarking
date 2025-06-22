import {
  GraphBarColor,
  xAxisLabels,
  yAxisLabels,
} from '../../RnBenchmarkingWebPage.constant'
import { ChartOptions } from 'chart.js';
import { Theme } from '../../contexts/ThemeContext'

export const chartData = (labels: string[], data: number[]) => ({
  labels: labels.map((value: string) => {
    return value
  }),
  datasets: [
    {
      data: data.map((value: number) => {
        return value
      }),
      backgroundColor: GraphBarColor.map((value) => {
        return value
      }),
      label: '',
      barThickness: 16,
      borderRadius: 4,
    },
  ],
})

export const options = (title: string, max: number, theme: Theme): ChartOptions<'bar'> => ({
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: title,
      color: theme === 'dark' ? '#FFFFFF' : '#333333',
      font: {
        size: 14,
        weight: 'bold'
      }
    },
  },
  scales: {
    x: {
      ticks: {
        autoSkip: false,
        font: {
          size: window.innerWidth <= 768 ? 10 : 12
        },
        callback: function (value, index, values) {
          const label = this.getLabelForValue(value as number); // Get the full label
          return label.split('/');
        },
        color: theme === 'dark' ? '#FFFFFF' : '#333333',
      },
      border: {
        dash: [0, 1],
        color: theme === 'dark' ? '#666666' : '#333333',
      },
      grid: {
        color: theme === 'dark' ? '#333333' : '#E5E5E5',
      },
      title: {
        display: false,
        text: xAxisLabels,
      },
    },
    y: {
      border: {
        dash: [4, 4],
        color: 'transparent',
      },
      grid: {
        color: theme === 'dark' ? '#333333' : '#8F8F8F',
      },
      ticks: {
        color: theme === 'dark' ? '#FFFFFF' : '#333333',
      },
      beginAtZero: true,
      max: max,
      title: {
        display: true,
        text: yAxisLabels,
        color: theme === 'dark' ? '#FFFFFF' : '#333333',
      },
    },
  },
})

