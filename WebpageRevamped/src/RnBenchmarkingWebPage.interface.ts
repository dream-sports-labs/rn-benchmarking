import React from 'react'

export type GenerateReportProps = {
  labels: string[]
  fifteenHundredViewDataLabels: number[]
  fifteenHundredTextDataLabels: number[]
  fifteenHundredImageDataLabels: number[]
  fiveThousandViewDataLabels: number[]
  fiveThousandTextDataLabels: number[]
  fiveThousandImageDataLabels: number[]
}

export type SelectionProps = {
  versionName: string[];
  onGenerateReport: (params: GenerateReportProps) => void;
  selectedVersion: string[];
  selectedOptions: string[];
  setSelectedOptions: (options: string[]) => void;
  hideSelection?: () => void;  // New prop to handle hiding the selection container on mobile
};


export type ReportsType = {
  [key: string]: any
}
