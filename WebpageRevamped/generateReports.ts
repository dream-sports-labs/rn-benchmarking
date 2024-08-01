const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, './src/Reports');
const versions: { [key: string]: any } = {};

const traverseDirectory = (dir: string, relativePath: string = '') => {
    const files = fs.readdirSync(dir);

    files.forEach((file: string) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            traverseDirectory(filePath, path.join(relativePath, file));
        } else if (file.endsWith('.json')) {
            const key = path.join(relativePath, file.replace('.json', ''));
            versions[key] = `require('./Reports/${key}.json')`;
        }
    });
};

traverseDirectory(baseDir);

const output = `type ReportsType = {
  [key: string]: any
} 
export const Reports: ReportsType = ${JSON.stringify(
    versions,
    null,
    2
).replace(/"require\(([^)]+)\)"/g, 'require($1)')};`;

fs.writeFileSync(path.resolve(__dirname, 'src/Reports.ts'), output);
console.log('Reports.ts file has been generated successfully.');

