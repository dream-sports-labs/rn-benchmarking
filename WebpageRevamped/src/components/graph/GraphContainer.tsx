import './GraphContainer.css'
import {Bar} from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, // for x axis
  LinearScale, // for y axis
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import React from 'react'
import {GenerateReportProps} from '../../RnBenchmarkingWebPage.interface'
import {chartData, options} from './GraphContainer.utils'
import {useIsMobile} from "../../hooks/useIsMobile";
import {useTheme} from "../../contexts/ThemeContext"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const GraphContainer = ({
  labels,
  fifteenHundredViewDataLabels,
  fifteenHundredTextDataLabels,
  fifteenHundredImageDataLabels,
  fiveThousandViewDataLabels,
  fiveThousandTextDataLabels,
  fiveThousandImageDataLabels,
}: GenerateReportProps) => {
  const isMobile = useIsMobile()
  const { theme } = useTheme()
  const performanceTitle = `Performance comparison of ${labels.join(', ')}`
  return (
      <div className={`GraphContainer ${theme}`}>
        {isMobile && <div className={'Info'}>{performanceTitle}</div>}
        <div className={'InnerContainer'}>
          <div className={'BarChartContainer'}>
            <Bar
                data={chartData(labels, fifteenHundredViewDataLabels)}
                options={options('1500 View', 4, theme)}
            />
          </div>
          <div className={'BarChartContainer'}>
            <Bar
                data={chartData(labels, fifteenHundredTextDataLabels)}
                options={options('1500 Text', 4, theme)}
            />
          </div>
          <div className={'BarChartContainerEnd'}>
            <Bar
                data={chartData(labels, fifteenHundredImageDataLabels)}
                options={options('1500 Image', 4, theme)}
            />
          </div>
        </div>
        <div className={'InnerContainer'}>
          <div className={'BarChartContainerBottom'}>
            <Bar
                data={chartData(labels, fiveThousandViewDataLabels)}
                options={options('5000 View', 8, theme)}
            />
          </div>
          <div className={'BarChartContainerBottom'}>
            <Bar
                data={chartData(labels, fiveThousandTextDataLabels)}
                options={options('5000 Text', 8, theme)}
            />
          </div>
          <div className={'BarChartContainerBottomEnd'}>
            <Bar
                data={chartData(labels, fiveThousandImageDataLabels)}
                options={options('5000 Image', 8, theme)}
            />
          </div>
        </div>
      </div>
  )
}

export default GraphContainer
