import React, {useEffect, useState} from 'react'
import './Home.css'
import Header from '../header/Header'
import SelectionContainer from '../selection/SelectionContainer'
import GraphContainer from '../graph/GraphContainer'
import {GenerateReportProps} from '../../RnBenchmarkingWebPage.interface'
import {IconButton} from "@mui/material";
// @ts-ignore
import sideNav from '../../assets/icons/sideNave.png'

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

  const isMobile = width <= 768;

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
              <div className="SelectionToggleContainer">
                <IconButton onClick={toggleSelection}>
                  <img src={sideNav} alt={'Dream11 Logo'} width={20} height={20}/>
                </IconButton>
              </div>
          }

          {/* Selection Container */}
          {isMobile ? (
              <div
                  className={`selectionContainerOverlay ${showSelection ? 'show' : ''}`}
                  onClick={handleClose}
              >
                <div className="selectionContainerContent" onClick={(e) => e.stopPropagation()}>
                  <SelectionContainer onGenerateReport={handleGenerateReport} hideSelection={() => setShowSelection(false)}/>
                </div>
              </div>
          ) : (
              <SelectionContainer onGenerateReport={handleGenerateReport} />
          )}

          {/* Graph Container */}
          {showGraph ? <GraphContainer {...graphData} /> : null}
        </div>
      </div>
  );
}

export default Home;
