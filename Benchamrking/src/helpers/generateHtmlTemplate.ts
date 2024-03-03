import {RENDERING_CONSTANTS} from "../Constants"

export type GenerateHtmlTemplate = {
    heading?: string
    "1500View"?: number
    "1500Text"?: number
    "1500Image"?: number
    "5000View"?: number
    "5000Text"?: number
    "5000Image"?: number
    labels?: Array<string>
    dataForLables?: Array<number>
}

export function generateHtmlTemplate(params: GenerateHtmlTemplate) {
    return `<!DOCTYPE html>
    <html>
       <head>
          <style>
             table {
             font-family: arial, sans-serif;
             border-collapse: collapse;
             width: 100%;
             }
             td, th {
             border: 1px solid #dddddd;
             text-align: left;
             padding: 8px;
             }
             tr:nth-child(even) {
             background-color: #dddddd;
             }
             .canvas-container {
             margin: 10px
             }
          </style>
       </head>
       <body>
          <h2>${params.heading || "Table Heading"}</h2>
          <table>
             <tr>
                <th>Name</th>
                <th>Mean (in s)</th>
             </tr>
             <tr>
                <td>${RENDERING_CONSTANTS["1500View"]}</td>
                <td>${params["1500View"] || 0}</td>
             </tr>
             <tr>
                <td>${RENDERING_CONSTANTS["1500Text"]}</td>
                <td>${params["1500Text"] || 0}</td>
             </tr>
             <tr>
                <td>${RENDERING_CONSTANTS["1500Image"]}</td>
                <td>${params["1500Image"] || 0}</td>
             </tr>
             <tr>
                <td>${RENDERING_CONSTANTS["5000View"]}</td>
                <td>${params["5000View"] || 0}</td>
             </tr>
             <tr>
                <td>${RENDERING_CONSTANTS["5000Text"]}</td>
                <td>${params["5000Text"] || 0}</td>
             </tr>
             <tr>
                <td>${RENDERING_CONSTANTS["5000Image"]}</td>
                <td>${params["5000Image"] || 0}</td>
             </tr>
          </table>
          <div class="canvas-container">
             <canvas id="myChart"></canvas>
          </div>
       </body>
       <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
       <script>
          const ctx = document.getElementById('myChart');
          
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ${JSON.stringify(params.labels || [])},
              datasets: [{
                label: ${JSON.stringify(params.heading || "")},
                data: ${JSON.stringify(params.dataForLables || [])},
                borderWidth: 0.5
              }]
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
       </script>
    </html>`
}