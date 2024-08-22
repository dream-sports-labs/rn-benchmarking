import {
  GraphBarColor,
  xAxisLabels,
  yAxisLabels,
} from '../../RnBenchmarkingWebPage.constant'
import { ChartOptions } from 'chart.js';

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

export const options = (title: string, max: number): ChartOptions<'bar'> => ({
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: title,
      color: '#333333',
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return context.label || '';
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        autoSkip: false,
        font:{
          size: window.innerWidth <= 768 ? 10 : 12
        },
        callback: function (value, index, values) {
          const label = this.getLabelForValue(value as number); // Get the full label
          return label.split('/');
        },
        color: '#333333',
      },
      border: {
        dash: [0, 1],
        color: 'black',
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
        color: '#8F8F8F',
      },
      beginAtZero: true,
      max: max,
      title: {
        display: true,
        text: yAxisLabels,
      },
    },
  },
})

