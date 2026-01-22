import React from 'react'
import { Bar } from 'react-chartjs-2';

const BarchartForDashboard = ({ resultFobar }) => {

    const labels = resultFobar.map(z => `เขต ${Number(z.zone)}`);

    const data = {
        labels,
        datasets: [
            {
                label: "ระดับเพชร",
                data: resultFobar.map(z => z.ระดับเพชร),
                backgroundColor: "#1290fd"
            },
            {
                label: "ระดับทอง",
                data: resultFobar.map(z => z.ระดับทอง),
                backgroundColor: "#fcc31a"
            },
            {
                label: "ระดับเงิน",
                data: resultFobar.map(z => z.ระดับเงิน),
                backgroundColor: "#d1cfcf"
            },
            {
                label: "ไม่ผ่าน",
                data: resultFobar.map(z => z.ไม่ผ่าน),
                backgroundColor: "#fc5151"
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top"
            },
            tooltip: {
                mode: "index",
                intersect: false
            },
            datalabels: {              // 🔥 ต้องอยู่ตรงนี้
                color: "#fff",
                font: {
                    weight: "bold",
                    size: 12
                },
                anchor: "center",
                align: "center",
                formatter: (value) => value
            }
        },
        scales: {
            x: {
                stacked: true
            },
            y: {
                stacked: true,
                beginAtZero: true,
                title: {
                    display: true,
                    text: "จำนวนโรงพยาบาล"
                }
            }
        }
    };


    return (
        <div style={{ height: "400px" }}>
            <Bar data={data} options={options} />
        </div>
    )
}

export default BarchartForDashboard