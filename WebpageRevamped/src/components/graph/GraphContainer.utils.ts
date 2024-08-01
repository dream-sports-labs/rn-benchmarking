import {
  GraphBarColor,
  xAxisLabels,
  yAxisLabels,
} from '../../RnBenchmarkingWebPage.constant'

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

export const options = (title: string, max: number) => ({
  maintainAspectRatio: false,
  plugins: {
    responsive: true,
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: title,
      color: '#333333',
    },
  },
  scales: {
    x: {
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