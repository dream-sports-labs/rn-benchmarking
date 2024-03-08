
fetchSupportedVersions().then((data) => {
    const versionsContainer = document.getElementById('version-container')

    let htmlContent = ''

    data.versions.forEach((version) => {
        htmlContent += `<div class="card">
        <div class="card-body">
          <h5 class="card-title">${version}</h5>
          <div class="checkbox-container">
            <h4>Android</h4>
            <div>
                <input type="checkbox" value="${version}/android/oldarch" name="${version}/android/oldarch"/>
                <label>Old Architecture</label>
            </div>
            <div>
                <input type="checkbox" value="${version}/android/newarch" name="${version}/android/newarch"/>
                <label>New Architecture</label>
            </div>
          </div>
          <div class="checkbox-container">
            <h4>iOS</h4>
            <div>
                <input type="checkbox" value="${version}/ios/oldarch" name="${version}/ios/oldarch"/>
                <label>Old Architecture</label>
            </div>
            <div>
                <input type="checkbox" value="${version}/ios/newarch" name="${version}/ios/newarch"/>
                <label>New Architecture</label>
            </div>
          </div>
        </div>
      </div>`
    })

    versionsContainer.innerHTML = htmlContent

})

function fetchSupportedVersions() {
    return fetch("./supportedVersions.json")
    .then((response) => response.json())
}

function fetchBenchmarkingData(value, url) {
    return fetch(url)
    .then((response) => response.json())
    .then((data) => ({
        value,
        data
    })).catch(() => ({
            value: '',
            data: {}  
    }))
}

function injectDataViews(id, heading, labels, dataLabels, chartsContainer) {
    const canvas = document.createElement("canvas")
    canvas.id = id
    canvas.style = "width:100%;max-width:500px;max-height:500px;"

    chartsContainer.append(canvas)

    const script = document.createElement("script")

    script.textContent = `var ${id} = document.getElementById('${id}'); new Chart('${id}', {
        type: 'bar',
        data: {
                  labels: ${JSON.stringify(labels || [])},
                  datasets: [{
                    label: '${heading} (in seconds)',
                    data: ${JSON.stringify(dataLabels || [])},
                    borderWidth: 0.1,
                  }]
                },
                options: {
                  scales: {
                    y: {
                      beginAtZero: true
                }
            }
        }
    })`

    document.body.appendChild(script)

}

function generateReport() {
    const promises = []
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach((checkbox) => promises.push(fetchBenchmarkingData(checkbox.value, `../../Reports/${checkbox.value}.json`)))

    const charts = document.getElementById("charts-container")

    charts.innerHTML = ''

    Promise.all(promises)
    .then((response) => {
        console.log(response)

        const labels = []
        
        const fifteenHundredViewDataLabels = []
        const fifteenHundredTextDataLabels = []
        const fifteenHundredImageDataLabels = []
        const fiveThousandViewDataLabels = []
        const fiveThousandTextDataLabels = []
        const fiveThousandImageDataLabels = []

        response.forEach((res) => {
            
            labels.push(`${res.value}`)

            if (res?.data?.means && Object.entries(res.data.means).length) {
                for (const key in res.data.means) {
                    
                    switch(key) {
                        case "1500View":
                            fifteenHundredViewDataLabels.push(res.data.means[key])
                            break
                        case "1500Text":
                            fifteenHundredTextDataLabels.push(res.data.means[key])
                            break
                        case "1500Image":
                            fifteenHundredImageDataLabels.push(res.data.means[key])
                            break
                        case "5000View":
                            fiveThousandViewDataLabels.push(res.data.means[key])
                            break
                        case "5000Text":
                            fiveThousandTextDataLabels.push(res.data.means[key])
                            break
                        case "5000Image":
                            fiveThousandImageDataLabels.push(res.data.means[key])
                            break
                        default:
                            break
                    }
                }
            }
        })

        injectDataViews("fifteenHundredView", "1500View", labels, fifteenHundredViewDataLabels, charts)
        injectDataViews("fifteenHundredText", "1500Text", labels, fifteenHundredTextDataLabels, charts)
        injectDataViews("fifteenHundredImage", "1500Image", labels, fifteenHundredImageDataLabels, charts)

        injectDataViews("fiveThousandView", "5000View", labels, fiveThousandViewDataLabels, charts)
        injectDataViews("fiveThousandText", "5000Text", labels, fiveThousandTextDataLabels, charts)
        injectDataViews("fiveThousandImage", "5000Image", labels, fiveThousandImageDataLabels, charts)

    })
}