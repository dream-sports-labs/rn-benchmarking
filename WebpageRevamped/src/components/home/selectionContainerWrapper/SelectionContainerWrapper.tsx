import React from 'react';
import './SelectionContainerWrapper.css';
import SelectionContainer from '../../selection/SelectionContainer';
import {GenerateReportProps} from '../../../RnBenchmarkingWebPage.interface';

const SelectionContainerWrapper = ({isMobile, showSelection, onGenerateReport, handleClose}: {
    isMobile: boolean;
    showSelection: boolean;
    onGenerateReport: (data: GenerateReportProps) => void;
    handleClose: () => void;
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
                    />
                </div>
            </div>
        ) : (
            <SelectionContainer onGenerateReport={onGenerateReport} />
        )}
    </>
);

export default SelectionContainerWrapper;
