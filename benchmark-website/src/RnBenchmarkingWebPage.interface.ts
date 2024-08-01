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
  versionName: string[]
  onGenerateReport: (params: GenerateReportProps) => void
  selectedVersion: string[]
  selectedOptions: string[]
  setSelectedOptions: React.Dispatch<React.SetStateAction<string[]>>
}

export type ReportsType = {
  [key: string]: any
}
