import React from 'react';
import './TabContainer.css';
import {GenerateReportProps} from '../../RnBenchmarkingWebPage.interface';
import SelectionToggle from "../home/selectionToggle/SelectionToggle";
import SelectionContainerWrapper from "../home/selectionContainerWrapper/SelectionContainerWrapper";
import GraphContainer from '../graph/GraphContainer';
import OtherBenchmarks from '../otherBenchmarks/OtherBenchmarks';

interface TabContainerProps {
  activeTab: 'rn-benchmarks' | 'other-benchmarks';
  setActiveTab: (tab: 'rn-benchmarks' | 'other-benchmarks') => void;
  isMobile: boolean;
  showGraph: boolean;
  showSelection: boolean;
  graphData: GenerateReportProps;
  onGenerateReport: (data: GenerateReportProps) => void;
  toggleSelection: () => void;
  handleClose: () => void;
}

const TabContainer: React.FC<TabContainerProps> = ({
  activeTab,
  setActiveTab,
  isMobile,
  showGraph,
  showSelection,
  graphData,
  onGenerateReport,
  toggleSelection,
  handleClose
}) => {
  return (
    <div className="tab-container">
      {/* Tab Content - No headers needed, they're in navbar now */}
      <div className="tab-content">
        {activeTab === 'rn-benchmarks' ? (
          <div className={'HomeContainer'}>
            {/* Icon for mobile view */}
            {isMobile &&
                <SelectionToggle toggleSelection={toggleSelection}/>
            }

            {/* Selection Container */}
            <SelectionContainerWrapper
                isMobile={isMobile}
                showSelection={showSelection}
                onGenerateReport={onGenerateReport}
                handleClose={handleClose}
            />

            {/* Graph Container */}
            {showGraph ? <GraphContainer {...graphData} /> : null}
          </div>
        ) : (
          <OtherBenchmarks />
        )}
      </div>
    </div>
  );
};

export default TabContainer; 