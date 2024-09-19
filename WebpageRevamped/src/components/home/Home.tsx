import React, {useEffect, useState} from 'react'
import './Home.css'
import Header from '../header/Header'
import GraphContainer from '../graph/GraphContainer'
import {GenerateReportProps} from '../../RnBenchmarkingWebPage.interface'
import SelectionToggle from "./selectionToggle/SelectionToggle";
import SelectionContainerWrapper from "../home/selectionContainerWrapper/SelectionContainerWrapper";
import {useIsMobile} from "../../hooks/useIsMobile";
import { useSearchParams } from 'react-router-dom';

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
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  useEffect(() => {
    // Set the selected options from URL params if available
    const filters = searchParams.get('filters');
    if (filters) {
      setSelectedOptions(decodeURIComponent(filters).split(','));
    }
  }, [searchParams]);

  useEffect(() => {
    // Update URL whenever selectedOptions change
    if (selectedOptions.length > 0) {
      setSearchParams({ filters: encodeURIComponent(selectedOptions.join(',')) });
    } else {
      setSearchParams({});
    }
  }, [selectedOptions, setSearchParams]);

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  const handleGenerateReport = (data: GenerateReportProps) => {
    setGraphData(data);
    setShowGraph(true);
    setShowSelection(false); // Hide the selection container after generating the report
  };

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
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
          />

          {/* Graph Container */}
          {showGraph ? <GraphContainer {...graphData} /> : null}
        </div>
      </div>
  );
}

export default Home;
