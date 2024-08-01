import React, {useState} from 'react'
import './Home.css'
import Header from '../header/Header'
import SelectionContainer from '../selection/SelectionContainer'
import GraphContainer from '../graph/GraphContainer'
import {GenerateReportProps} from '../../RnBenchmarkingWebPage.interface'

const Home = () => {
  const [showGraph, setShowGraph] = useState<boolean>(false)
  const [graphData, setGraphData] = useState<GenerateReportProps>({
    labels: [],
    fifteenHundredViewDataLabels: [],
    fifteenHundredTextDataLabels: [],
    fifteenHundredImageDataLabels: [],
    fiveThousandViewDataLabels: [],
    fiveThousandTextDataLabels: [],
    fiveThousandImageDataLabels: [],
  })

  const handleGenerateReport = ({
    labels,
    fifteenHundredViewDataLabels,
    fifteenHundredTextDataLabels,
    fifteenHundredImageDataLabels,
    fiveThousandViewDataLabels,
    fiveThousandTextDataLabels,
    fiveThousandImageDataLabels,
  }: GenerateReportProps) => {
    setGraphData({
      labels,
      fifteenHundredViewDataLabels,
      fifteenHundredTextDataLabels,
      fifteenHundredImageDataLabels,
      fiveThousandViewDataLabels,
      fiveThousandTextDataLabels,
      fiveThousandImageDataLabels,
    })
    setShowGraph(true)
  }

  return (
    <div className={'MainContainer'}>
      <Header />
      <div className={'HomeContainer'}>
        <SelectionContainer onGenerateReport={handleGenerateReport} />
        {showGraph ? <GraphContainer {...graphData} /> : null}
      </div>
    </div>
  )
}

export default Home
