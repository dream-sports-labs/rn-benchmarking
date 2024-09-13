import React, {useEffect, useState} from 'react'
import './Home.css'
import Header from '../header/Header'
import SelectionContainer from '../selection/SelectionContainer'
import GraphContainer from '../graph/GraphContainer'
import {GenerateReportProps} from '../../RnBenchmarkingWebPage.interface'
import {mobileWidth} from "../../RnBenchmarkingWebPage.constant";
import SelectionToggle from "./selectionToggle/SelectionToggle";
import SelectionContainerWrapper from "../home/selectionContainerWrapper/SelectionContainerWrapper";

const Home = () => {
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const [showSelection, setShowSelection] = useState<boolean>(false);
  const [graphData, setGraphData] = useState<GenerateReportProps>({
    labels: [],
    fifteenHundredViewDataLabels: [],
    fifteenHundredTextDataLabels: [],
    fifteenHundredImageDataLabels: [],
    fiveThousandViewDataLabels: [],
    fiveThousandTextDataLabels: [],
    fiveThousandImageDataLabels: [],
  });

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
    });
    setShowGraph(true);
    setShowSelection(false); // Hide the selection container after generating the report
  };

  const [width, setWidth] = useState<number>(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  const isMobile = width <= mobileWidth;

  const toggleSelection = () => {
    setShowSelection(!showSelection); // Toggle the visibility of the selection container
  };

  const handleClose = () => {
    setShowSelection(false); // Close the selection container
  };

  return (
      <div className={'MainContainer'}>
        <Header/>
        <div className={'HomeContainer'}>
          {/* Icon for mobile view */}
          {isMobile &&
              <SelectionToggle toggleSelection={toggleSelection}/>
          }

          {/* Selection Container */}
          <SelectionContainerWrapper
              isMobile={isMobile}
              showSelection={showSelection}
              onGenerateReport={handleGenerateReport}
              handleClose={handleClose}
          />

          {/* Graph Container */}
          {showGraph ? <GraphContainer {...graphData} /> : null}
        </div>
      </div>
  );
}

export default Home;