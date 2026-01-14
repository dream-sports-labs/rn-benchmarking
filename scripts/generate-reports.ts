#!/usr/bin/env ts-node

/**
 * Script to generate Reports.ts file from the Reports directory structure
 * Supports both old structure (without buildType) and new structure (with debug/release)
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.join(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, 'WebpageRevamped', 'src', 'Reports');
const REPORTS_TS_PATH = path.join(ROOT_DIR, 'WebpageRevamped', 'src', 'Reports.ts');

interface ReportEntry {
  key: string;
  path: string;
}

function getAllReports(): ReportEntry[] {
  const reports: ReportEntry[] = [];
  
  if (!fs.existsSync(REPORTS_DIR)) {
    return reports;
  }
  
  const versions = fs.readdirSync(REPORTS_DIR).filter((item) => {
    const itemPath = path.join(REPORTS_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  for (const version of versions) {
    const versionPath = path.join(REPORTS_DIR, version);
    const platforms = fs.readdirSync(versionPath).filter((item) => {
      const itemPath = path.join(versionPath, item);
      return fs.statSync(itemPath).isDirectory();
    });
    
    for (const platform of platforms) {
      const platformPath = path.join(versionPath, platform);
      const architectures = fs.readdirSync(platformPath).filter((item) => {
        const itemPath = path.join(platformPath, item);
        return fs.statSync(itemPath).isDirectory();
      });
      
      for (const architecture of architectures) {
        const archPath = path.join(platformPath, architecture);
        
        // Check if it's the new structure (has debug/release subdirectories)
        const subdirs = fs.readdirSync(archPath).filter((item) => {
          const itemPath = path.join(archPath, item);
          return fs.statSync(itemPath).isDirectory();
        });
        
        if (subdirs.includes('debug') || subdirs.includes('release')) {
          // New structure: Reports/{version}/{platform}/{architecture}/{buildType}/
          for (const buildType of ['debug', 'release']) {
            const buildTypePath = path.join(archPath, buildType);
            if (fs.existsSync(buildTypePath)) {
              const reportFile = path.join(buildTypePath, `${architecture}.json`);
              if (fs.existsSync(reportFile)) {
                const key = `${version}/${platform}/${architecture}/${buildType}`;
                const relativePath = `./Reports/${version}/${platform}/${architecture}/${buildType}/${architecture}.json`;
                reports.push({ key, path: relativePath });
              }
            }
          }
        } else {
          // Old structure: Reports/{version}/{platform}/{architecture}.json
          const reportFile = path.join(archPath, `${architecture}.json`);
          if (fs.existsSync(reportFile)) {
            const key = `${version}/${platform}/${architecture}`;
            const relativePath = `./Reports/${version}/${platform}/${architecture}.json`;
            reports.push({ key, path: relativePath });
          }
        }
      }
    }
  }
  
  return reports;
}

function generateReportsTS(reports: ReportEntry[]): string {
  const entries = reports
    .map((report) => `  "${report.key}": require("${report.path}"),`)
    .join('\n');
  
  return `type ReportsType = {
  [key: string]: any
} 
export const Reports: ReportsType = {
${entries}
};
`;
}

function main() {
  console.log('📊 Generating Reports.ts...');
  
  const reports = getAllReports();
  console.log(`Found ${reports.length} report files`);
  
  const content = generateReportsTS(reports);
  fs.writeFileSync(REPORTS_TS_PATH, content, 'utf-8');
  
  console.log(`✅ Generated Reports.ts with ${reports.length} entries`);
  console.log(`   Location: ${REPORTS_TS_PATH}`);
}

if (require.main === module) {
  main();
}


