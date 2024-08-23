import React from 'react';
import {IconButton} from "@mui/material";
import './SelectionToggle.css';
import sideNav from '../../../assets/icons/sideNave.png';

const SelectionToggle = ({toggleSelection}: {toggleSelection: () => void}) => (
    <div className="SelectionToggleContainer">
        <IconButton onClick={toggleSelection}>
            <img src={sideNav} alt={'Dream11 Logo'} width={20} height={20}/>
        </IconButton>
    </div>
);

export default SelectionToggle;
