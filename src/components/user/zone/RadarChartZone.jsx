import React from 'react';
import SummaryZoneBox from './SummaryZoneBox';
import useGlobalStore from '../../../store/global-store';
import { Radar, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const RadarChartZone = ({ withLevel }) => {

    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);

    const title = 'สรุประดับ';

    const levelCount = {
        ระดับเพชร: 0,
        ระดับทอง: 0,
        ระดับเงิน: 0,
        ไม่ผ่าน: 0
    };

    withLevel.forEach(item => {
        if (levelCount[item.score_level] !== undefined) {
            levelCount[item.score_level]++;
        }
    });

    const radarData = {
        labels: ["ระดับเพชร", "ระดับทอง", "ระดับเงิน", "ไม่ผ่าน"],
        datasets: [
            {
                label: "จำนวนโรงพยาบาล",
                data: [
                    levelCount.ระดับเพชร,
                    levelCount.ระดับทอง,
                    levelCount.ระดับเงิน,
                    levelCount.ไม่ผ่าน
                ],
                // เส้นรอบ
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 2,

                // สีพื้นที่
                backgroundColor: "rgba(54, 162, 235, 0.15)",

                // สีจุดแต่ละระดับ
                pointBackgroundColor: [
                    "#0088FE", // เพชร
                    "#ffc107", // ทอง
                    "#adb5bd", // เงิน
                    "#dc3545"  // ไม่ผ่าน
                ],
                pointBorderColor: [
                    "#0088FE",
                    "#ffc107",
                    "#adb5bd",
                    "#dc3545"
                ],
                pointRadius: 5,
                pointHoverRadius: 7
            }
        ]
    };

    const labelColors = {
        "ระดับเพชร": "#0088FE",
        "ระดับทอง": "#ffc107",
        "ระดับเงิน": "#adb5bd",
        "ไม่ผ่าน": "#dc3545"
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    precision: 0
                },
                pointLabels: {
                    display: true,
                    font: {
                        size: 12,
                        weight: "bold",
                        family: "Sarabun"
                    },
                    color: (context) => {
                        const label = context.label;
                        return labelColors[label] || "#000";
                    }
                },
                suggestedMax: Math.max(
                    levelCount.ระดับเพชร,
                    levelCount.ระดับทอง,
                    levelCount.ระดับเงิน,
                    levelCount.ไม่ผ่าน
                ) + 1
            }
        },
        plugins: {
            legend: {
                position: "top",
                labels: {
                    font: {
                        size: 14,
                        weight: "bold",
                        family: "Sarabun"
                    }
                }
            }
        }
    };

    return (
        <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
            <div className="w-100">
                <div
                    className="position-relative w-100"
                    style={{
                        height: "clamp(300px, 60vw, 420px)"
                    }}
                >
                    {/* 📊 Radar Chart */}
                    <Radar data={radarData} options={radarOptions} />

                    {/* 🖥 Desktop Summary (Overlay) */}
                    <div
                        className="d-none d-md-block bg-light shadow-sm rounded-3 p-3"
                        style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            minWidth: "170px",
                            fontFamily: "Sarabun",
                            zIndex: 10
                        }}
                    >
                        <SummaryZoneBox levelCount={levelCount} title={title} />
                    </div>
                </div>
                {/* 📱 Mobile Summary (Below Chart) */}
                <div className="d-block d-md-none mt-3">
                    <div className="bg-light shadow-sm rounded-3 p-3">
                        <SummaryZoneBox levelCount={levelCount} title={title} />
                    </div>
                </div>
            </div>

        </div>
    )
}

export default RadarChartZone