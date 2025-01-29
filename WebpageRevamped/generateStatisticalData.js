const fs = require('fs');
const path = require('path');

// Function to recursively get all JSON files in a directory
function getAllJsonFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // Recursively go through folders
      getAllJsonFiles(fullPath, arrayOfFiles);
    } else if (path.extname(file) === '.json') {
      // If it's a JSON file, add to the list
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Function to calculate mean, std deviation, std error, and error rate
function calculateStats(durations) {
    const n = durations.length;
    const mean = durations.reduce((acc, curr) => acc + curr, 0) / n;
    const variance = durations.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);
    const stdError = stdDev / Math.sqrt(n);
    const errorRate = (stdError / mean) * 100;
  
    return { mean, stdDev, stdError, errorRate };
  }
  
  // Function to extract durations and calculate statistics
  function generateStats(data) {
    const result = {};
  
    for (const key in data) {
      const durations = data[key].map(entry => entry.PAINT_END_TIME - entry.PAINT_START_TIME);
      const stats = calculateStats(durations);
  
      result[key] = {
        mean_duration: stats.mean,
        std_deviation: stats.stdDev,
        std_error: stats.stdError,
        error_rate: stats.errorRate
      };
    }
  
    return result;
  }


// Example usage
const folderPath = path.join(__dirname, 'src/Reports'); // Replace with your folder path
const jsonFiles = getAllJsonFiles(folderPath);

function readAndOverwriteJsonFile(filePath, newData) {
    // Read the existing JSON file
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }
      
      console.log('Original file content:', data);
  
      // Overwrite the file with new JSON data
      fs.writeFile(filePath, JSON.stringify(newData, null, 2), (err) => {
        if (err) {
          console.error('Error writing to file:', err);
        } else {
          console.log('File content successfully overwritten with new JSON data.');
        }
      });
    });
  }

// Function to read JSON file
function readJsonFile(filePath) {
    try {
      const jsonData = fs.readFileSync(filePath, 'utf-8');
      const parsedData = JSON.parse(jsonData);
      const statisticalAnalysis = generateStats(parsedData.data);
      const newData = {...parsedData, statisticalAnalysis}
      readAndOverwriteJsonFile(filePath, newData)
      console.log(newData);
    } catch (err) {
      console.error('Error reading the JSON file:', err);
    }
  }
  
  // Call the function
  
jsonFiles.forEach((file) => {
    readJsonFile(file);
})