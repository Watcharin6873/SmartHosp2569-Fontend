import React from 'react'
import { Doughnut } from "react-chartjs-2";

const DoughnutChart = ({ latestLevel, totalHospital }) => {

    const labels = ["ระดับเพชร", "ระดับทอง", "ระดับเงิน", "ไม่ผ่าน"];

    const values = labels.map(label => latestLevel[label] || 0);

    const data = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: [
                    "#1290fd", // เพชร
                    "#fcc31a", // ทอง
                    "#d1cfcf", // เงิน
                    "#fc5151"  // ไม่ผ่าน
                ],
                borderWidth: 2
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    font: {
                        family: "Sarabun",
                        size: 14
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw;
                        return `จำนวนโรงพยาบาล: ${value} แห่ง`;
                    }
                }
            },
            datalabels: {
                color: "#fff",
                font: {
                    weight: "bold",
                    size: 14
                },
                formatter: (value) => {
                    if (!value) return "";
                    const percent = ((value / totalHospital) * 100).toFixed(1);
                    return `${percent}%`;
                }
            }
        }
    };


    return (
        <div
            className=""
            style={{ height: "320px" }}
        >
            <div className="fw-bold text-center mb-2">
                สัดส่วนระดับโรงพยาบาลทั้งประเทศ
            </div>

            <Doughnut data={data} options={options} />
        </div>
    )
}

export default DoughnutChart