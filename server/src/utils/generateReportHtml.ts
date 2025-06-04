interface ReportData {
    residentId: string;
    from: string;
    to: string;
    medication: {
        name: string;
        dose: string;
        schedule: string;
        date: string;
        status: string;
    }[];
    nutrition: string;
    activities: string;  
}

export function generateReportHtml(data: ReportData): string {
    const { residentId, from, to, medication, nutrition, activities } = data;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Report for Resident ${residentId}</title>
        <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .section { margin-bottom: 40px; }
        </style>
    </head>
    <body>
        <h1>Resident Report</h1>
        <p><strong>Resident ID:</strong> ${residentId}</p>
        <p><strong>From:</strong> ${from} <strong>To:</strong> ${to}</p>

        <div class="section">
        <h2>Medication</h2>
        ${
            medication.length > 0
            ? `<table>
                <thead>
                    <tr>
                    <th>Name</th>
                    <th>Dose</th>
                    <th>Schedule</th>
                    <th>Date</th>
                    <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${medication
                    .map(
                        (m) => `
                    <tr>
                        <td>${m.name}</td>
                        <td>${m.dose}</td>
                        <td>${m.schedule}</td>
                        <td>${m.date}</td>
                        <td>${m.status}</td>
                    </tr>`
                    )
                    .join('')}
                </tbody>
                </table>`
            : '<p>No medication records found for this period.</p>'
        }
        </div>

        <div class="section">
        <h2>Nutrition</h2>
        ${
            nutrition
            ? `<p>${nutrition}</p>`
            : '<p>No nutrition records found for this period.</p>'
        }
        </div>

        <div class="section">
        <h2>Activities</h2>
        ${
            activities
            ? `<div>${activities}</div>`
            : '<p>No activities found for this period.</p>'
        }
        </div>

        <footer>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        </footer>
    </body>
    </html>
    `;
}
