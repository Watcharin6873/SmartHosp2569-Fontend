import { useEffect, useMemo, useState } from 'react'
import { getListHospForDashboard } from '../api/Hospitals';
import { Bar } from 'react-chartjs-2';

const BarChartProvinceForDash = ({ selectedZone, withLevel }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [listHospitals, setListHospitals] = useState([]);

    const isUAT = import.meta.env.VITE_IS_UAT === 'true';

    useEffect(() => {
        loadListHospitals(selectedZone);
    }, [selectedZone]);

    const loadListHospitals = async (selectedZone) => {
        try {
            setIsLoading(true);

            const res = await getListHospForDashboard();
            const data = res.data;
            const filtered = isUAT
                ? data.filter(f => f.zone === selectedZone)
                : data.filter(f => f.zone === selectedZone && f.dept_type !== 'หน่วยงานทดสอบ')

            setListHospitals(filtered)

        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    // Distinct zone + province
    const distinctZoneProvince = Array.from(
        new Map(
            listHospitals.map(item => [
                `${item.zone}-${item.province}`,
                { zone: item.zone, province: item.province }
            ])
        ).values()
    );


    // Count level by province
    const countLevelByProvince = (data) => {
        const map = {};

        data.forEach(item => {
            const province = item.province || 'ไม่ระบุ';
            const level = item.score_level || 'ไม่ผ่าน';

            if (!map[province]) {
                map[province] = {
                    province,
                    "ระดับเพชร": 0,
                    "ระดับทอง": 0,
                    "ระดับเงิน": 0,
                    "ไม่ผ่าน": 0
                }
            }
            map[province][level] += 1;
        });
        return Object.values(map);
    }

    const levelByProvince = useMemo(() => {
        return countLevelByProvince(withLevel)
    }, [withLevel])

    const leftJoinByProvince = (array1, array2) => {
        const provMap = new Map(
            array2.map(item => [String(item.province), item])
        );

        return array1.map(item => {
            const match = provMap.get(String(item.province));

            return {
                ...item,
                ...(match || {
                    "ระดับเพชร": 0,
                    "ระดับทอง": 0,
                    "ระดับเงิน": 0,
                    "ไม่ผ่าน": 0
                })
            }
        });
    }

    const levelProvince = leftJoinByProvince(
        distinctZoneProvince,
        levelByProvince
    );

    // console.log('Level: ', levelProvince)

    const labels = levelProvince.map(z => `${z.province}`);

    const data = {
        labels,
        datasets: [
            {
                label: "ระดับเพชร",
                data: levelProvince.map(z => z.ระดับเพชร),
                backgroundColor: "#1290fd"
            },
            {
                label: "ระดับทอง",
                data: levelProvince.map(z => z.ระดับทอง),
                backgroundColor: "#fcc31a"
            },
            {
                label: "ระดับเงิน",
                data: levelProvince.map(z => z.ระดับเงิน),
                backgroundColor: "#d1cfcf"
            },
            {
                label: "ไม่ผ่าน",
                data: levelProvince.map(z => z.ไม่ผ่าน),
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

export default BarChartProvinceForDash