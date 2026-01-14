import React from 'react';
import './TabContainer.css';

interface TabContainerProps {
  children: React.ReactNode;
}

const TabContainer: React.FC<TabContainerProps> = ({ children }) => {
  return (
    <div className="tab-container">
      {children}
    </div>
  );
};

export default TabContainer;
