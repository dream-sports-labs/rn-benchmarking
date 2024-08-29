import React from 'react';
import './SelectionContainerWrapper.css';
import SelectionContainer from '../../selection/SelectionContainer';
import { GenerateReportProps } from '../../../RnBenchmarkingWebPage.interface';

const SelectionContainerWrapper = ({isMobile, showSelection, onGenerateReport, handleClose, selectedOptions,  setSelectedOptions}: {
    isMobile: boolean;
    showSelection: boolean;
    onGenerateReport: (data: GenerateReportProps) => void;
    handleClose: () => void;
    selectedOptions: string[];
    setSelectedOptions:React.Dispatch<React.SetStateAction<string[]>>;
}) => (
    <>
        {isMobile ? (
            <div
                className={`selectionContainerOverlay ${showSelection ? 'show' : ''}`}
                onClick={handleClose}
            >
                <div className="selectionContainerContent" onClick={(e) => e.stopPropagation()}>
                    <SelectionContainer
                        onGenerateReport={onGenerateReport}
                        hideSelection={handleClose}
                        selectedOptions={selectedOptions}
                        setSelectedOptions={setSelectedOptions}
                    />
                </div>
            </div>
        ) : (
            <SelectionContainer
                onGenerateReport={onGenerateReport}
                selectedOptions={selectedOptions}
                setSelectedOptions={setSelectedOptions}
            />
        )}
    </>
);

export default SelectionContainerWrapper;
