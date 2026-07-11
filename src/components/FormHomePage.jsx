import { useEffect, useMemo, useState, useRef } from 'react'
import { getListHospForDashboard } from '../api/Hospitals';
import { getCyberLevelForDashboard, getEvaluationSummary } from '../api/Report';
import Blue_gem from '../assets/Blue-gem.png';
import Gold from '../assets/Gold2.png'
import Silver from '../assets/Silver2.png';
import Hosp from '../assets/Hospital.png';
import MantananceSMH from '../assets/End-evaluate.png';
import { Ban } from 'lucide-react';
import TableForHomeDashBoard from './TableForHomeDashBoard';
import BarchartForDashboard from './BarchartForDashboard';
import DoughnutChart from './DoughnutChart';
import BarChartProvinceForDash from './BarChartProvinceForDash';
import LoadingModal from './LoadingModal';
import { Modal } from 'bootstrap';

const FormHomePage = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState([]);
    const [listHospForAll, setListHospForAll] = useState([]);
    const [listResultScoreForAll, setListResultScoreForAll] = useState([]);
    const [listCyberLevel, setListCyberLevel] = useState([]);
    const [selectedZone, setSelectedZone] = useState("");
    const [modalNotifyInstance, setModalNotifyInstance] = useState(null);

    const isUAT = import.meta.env.VITE_IS_UAT === 'true';
    const modalNotifyRef = useRef(null);

    useEffect(() => {
        loadListHospitals();
        loadResultScoreAllCat();
        loadListCyberLevel();

        if (modalNotifyRef.current) {
            const modal = new Modal(modalNotifyRef.current);
            setModalNotifyInstance(modal);
            modal.show();
        }
    }, []);

    const loadListHospitals = async () => {
        try {
            setIsLoading(true);

            const res = await getListHospForDashboard()
            const data = res.data;
            const filtered = isUAT ? data : data.filter(f => f.dept_type !== 'หน่วยงานทดสอบ');

            setListHospForAll(filtered);
            setSearchQuery(filtered)

        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const loadResultScoreAllCat = async () => {
        try {
            setIsLoading(true);

            const res = await getEvaluationSummary();
            const data = res.data;
            const filtered = isUAT ? data : data.filter(f => f.hospital_code !== 'IA0043790');

            setListResultScoreForAll(filtered);

        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    const loadListCyberLevel = async () => {
        try {

            const res = await getCyberLevelForDashboard();
            const data = res.data;

            setListCyberLevel(data);

        } catch (err) {
            console.log(err);
        }
    }

    const zoneOption = Array.from({ length: 12 }, (_, i) => {
        const num = i + 1;
        return {
            value: num.toString().padStart(2, "0"),
            label: `เขตสุขภาพที่ ${num}`
        };
    });

    const handleSelectZone = (e) => {
        setSelectedZone(e.target.value)
        if (e.target.value) {
            setSearchQuery(listHospForAll.filter(f => f.zone === e.target.value))
        } else {
            setSearchQuery(listHospForAll)
        }

    }


    const originalData = searchQuery
        .sort((a, b) => Number(a.zone) - Number(b.zone))
        .flatMap((item1) => {
            return listResultScoreForAll
                .filter(item2 => item2.hospital_code === item1.hcode9)
                .map(item2 => {
                    const cyber = listCyberLevel.find(
                        item3 => item3.hcode9 === item2.hospital_code
                    );

                    return {
                        zone: item1.zone,
                        zone_name: item1.zone_name,
                        province: item1.province,
                        hospital_code: item2.hospital_code,
                        hospital_name: item2.hospital_name,
                        hospital_type: item1.dept_type,
                        category_id: item2.category_id,
                        answer_value: item2.answer_value,
                        answer_required: item2.answer_required,
                        cyber_level: cyber?.cyber_level || null,
                        cyber_levelname: cyber?.cyber_levelname || null
                    };
                });
        });


    const groupedData = originalData.reduce((acc, item) => {
        const key = [
            item.zone,
            item.zone_name,
            item.province,
            item.hospital_code,
            item.hospital_name,
            item.hospital_type,
            item.cyber_level
        ].join("|");

        if (!acc[key]) {
            acc[key] = {
                zone: item.zone,
                zone_name: item.zone_name,
                province: item.province,
                hospital_code: item.hospital_code,
                hospital_name: item.hospital_name,
                hospital_type: item.hospital_type,
                cyber_level: item.cyber_level,
                cyber_levelname: item.cyber_levelname,
                total_answer_value: 0,
                total_answer_required: 0
            };
        }

        acc[key].total_answer_value += Number(item.answer_value || 0);
        acc[key].total_answer_required += Number(item.answer_required || 0);

        return acc;
    }, {});

    // แปลง Object → Array
    const resultGroupData = Object.values(groupedData);

    const withLevel = resultGroupData.map(item => {
        let level = "";

        if (item.total_answer_value < 600) level = "ไม่ผ่าน";
        else if ((item.total_answer_value >= 600 && item.total_answer_value < 700) ||
            (item.total_answer_value >= 700 && item.total_answer_value < 800 && item.total_answer_required < 510) ||
            (item.total_answer_value >= 800 && item.total_answer_required < 510)) level = "ระดับเงิน";
        else if ((item.total_answer_value >= 700 && item.total_answer_value < 800 && item.total_answer_required === 510) ||
            (item.total_answer_value >= 800 && item.total_answer_required === 510 && item.cyber_level !== 'GREEN')) level = "ระดับทอง";
        else if (item.total_answer_value >= 800 && item.total_answer_required === 510 && item.cyber_level === 'GREEN') level = "ระดับเพชร";

        return {
            ...item,
            score_level: level
        };
    });

    const allLevelCount = (data) => {
        const result = {
            "ระดับเพชร": 0,
            "ระดับทอง": 0,
            "ระดับเงิน": 0,
            "ไม่ผ่าน": 0
        };

        data.forEach(item => {
            const level = item.score_level || "ไม่ผ่าน";

            if (result[level] !== undefined) {
                result[level] += 1;
            } else {
                result["ไม่ผ่าน"] += 1;
            }
        });

        return result;
    };


    const latestLevel = useMemo(() => {
        return allLevelCount(withLevel);
    }, [withLevel]);


    const totalHospital = searchQuery.length;
    // const totalHospital = 902

    const zoneInitailsData = Array.from({ length: 12 }, (_, i) => {
        const num = i + 1;
        return {
            zone: num.toString().padStart(2, "0"),
            zone_name: `เขตสุขภาพที่ ${num}`
        };
    });

    const countLevelByZone = (data) => {
        const map = {};

        data.forEach(item => {
            const zone = item.zone || "ไม่ระบุ";
            const level = item.score_level || "ไม่ผ่าน";

            if (!map[zone]) {
                map[zone] = {
                    zone,
                    "ระดับเพชร": 0,
                    "ระดับทอง": 0,
                    "ระดับเงิน": 0,
                    "ไม่ผ่าน": 0
                };
            }

            map[zone][level] += 1;
        });

        return Object.values(map);
    };


    const levelByZone = useMemo(() => {
        return countLevelByZone(withLevel);
    }, [withLevel]);

    const leftJoinByZone = (array1, array2) => {
        const zoneMap = new Map(
            array2.map(item => [String(item.zone), item])
        );

        return array1.map(item => {
            const match = zoneMap.get(String(item.zone));

            return {
                ...item,
                // ถ้ามีข้อมูลใน array2 → merge
                ...(match || {
                    "ระดับเพชร": 0,
                    "ระดับทอง": 0,
                    "ระดับเงิน": 0,
                    "ไม่ผ่าน": 0
                })
            };
        });
    };

    const resultFobar = leftJoinByZone(
        zoneInitailsData,          // array1
        levelByZone // array2 (จาก withLevel)
    );


    const percentEvaluation = (resultGroupData.length / totalHospital) * 100;

    const gemPer = (latestLevel["ระดับเพชร"] / totalHospital) * 100;
    const goldPer = (latestLevel["ระดับทอง"] / totalHospital) * 100;
    const silverPer = (latestLevel["ระดับเงิน"] / totalHospital) * 100;
    const notPassPer = (latestLevel["ไม่ผ่าน"] / totalHospital) * 100;


    return (
        <>
            <div className='' style={{ fontFamily: "Sarabun, sans-serif" }}>

                <div className="d-flex flex-column flex-md-row align-items-center mb-4 gap-2">

                    {/* LEFT */}
                    <div className="w-100 w-md-33 text-start">
                        <div style={{ maxWidth: "240px" }}>
                            <select
                                className="form-select"
                                value={selectedZone}
                                onChange={handleSelectZone}
                            >
                                <option value="">--- ข้อมูลทั้งประเทศ ---</option>
                                {zoneOption
                                    .sort((a, b) => a.value - b.value)
                                    .map((item, idx) => (
                                        <option key={idx} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* CENTER */}
                    <div className="w-100 w-md-33 text-center">
                        <p className="h5 h-md-4 text-success fw-bold mb-0">
                            คะแนนที่แสดงหลังจากเปิดระบบในวันที่ 9 เม.ย.69
                            เป็นคะแนนที่ผ่านการอนุมัติของ คกก.ระดับจังหวัดเรียบร้อยแล้ว
                        </p>
                    </div>

                    {/* RIGHT */}
                    <div className="w-100 w-md-33 text-md-end text-center">
                        {selectedZone === "" ? (
                            <p className="h5 h-md-4 text-success fw-bold mb-0">
                                ผลการประเมินทั้งหมด
                            </p>
                        ) : (
                            <p className="h5 h-md-4 text-success fw-bold mb-0">
                                ผลการประเมินของเขตสุขภาพที่ {Number(selectedZone)}
                            </p>
                        )}
                    </div>

                </div>

                {/* Card show level */}
                <div className='row row-cols-1 row-cols-sm-2 row-cols-lg-5 g-3 mb-3'>
                    <div className='col'>
                        <div className='p-3 border bg-light rounded-3 shadow h-100'>
                            <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap mb-1">
                                <div
                                    className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                                    style={{
                                        width: 'clamp(44px, 6vw, 56px)',
                                        height: 'clamp(44px, 6vw, 56px)',
                                        backgroundColor: '#f7ecd0',
                                        border: '1px solid #05770d',
                                    }}
                                >
                                    <img src={Hosp} style={{ width: '40px' }} alt="Hosp" />
                                </div>

                                <p
                                    className="fw-bold mb-0 text-wrap"
                                    style={{ color: '#05770d', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
                                >
                                    โรงพยาบาล
                                </p>
                            </div>
                            <div className="d-flex flex-column gap-1">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">โรงพยาบาลทั้งหมด</span>
                                    <span className="fw-bold">{totalHospital} แห่ง</span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">ส่งแบบประเมินแล้ว</span>
                                    <span className="fw-bold text-success">
                                        {resultGroupData.length} แห่ง
                                    </span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted small">คิดเป็น</span>
                                    <span className="fw-bold text-primary">
                                        {percentEvaluation.toFixed(1)} %
                                    </span>
                                </div>
                            </div>



                        </div>
                    </div>
                    <div className='col'>
                        <div className='p-3 border bg-light rounded-3 shadow h-100'>
                            <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap mb-1">
                                <div
                                    className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                                    style={{
                                        width: 'clamp(44px, 6vw, 56px)',
                                        height: 'clamp(44px, 6vw, 56px)',
                                        backgroundColor: '#f7ecd0',
                                        border: '1px solid #05770d',
                                    }}
                                >
                                    <img src={Blue_gem} style={{ width: '45px' }} alt="Blue_gem" />
                                </div>

                                <p
                                    className="fw-bold mb-0 text-wrap text-primary"
                                    style={{ fontSize: 'clamp(16px, 2.5vw, 20px)' }}
                                >
                                    ระดับเพชร
                                </p>
                            </div>
                            <div className='d-flex justify-content-center'>
                                <h2 className="fw-bold text-primary">
                                    {latestLevel["ระดับเพชร"] || 0}
                                </h2>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted small">คิดเป็น</span>
                                <span className="fw-bold text-primary">
                                    {gemPer.toFixed(1)} %
                                </span>
                            </div>

                        </div>
                    </div>
                    <div className='col'>
                        <div className='p-3 border bg-light rounded-3 shadow h-100'>
                            <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap mb-1">
                                <div
                                    className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                                    style={{
                                        width: 'clamp(44px, 6vw, 56px)',
                                        height: 'clamp(44px, 6vw, 56px)',
                                        backgroundColor: '#f7ecd0',
                                        border: '1px solid #05770d',
                                    }}
                                >
                                    <img src={Gold} style={{ width: '50px' }} alt="Gold" />
                                </div>

                                <p
                                    className="fw-bold mb-0 text-wrap"
                                    style={{ color: '#ffc107', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
                                >
                                    ระดับทอง
                                </p>
                            </div>
                            <div className='d-flex justify-content-center'>
                                <h2 className="fw-bold" style={{ color: '#ffc107' }}>
                                    {latestLevel["ระดับทอง"] || 0}
                                </h2>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted small">คิดเป็น</span>
                                <span className="fw-bold" style={{ color: '#ffc107' }}>
                                    {goldPer.toFixed(1)} %
                                </span>
                            </div>

                        </div>
                    </div>
                    <div className='col'>
                        <div className='p-3 border bg-light rounded-3 shadow h-100'>
                            <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap mb-1">
                                <div
                                    className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                                    style={{
                                        width: 'clamp(44px, 6vw, 56px)',
                                        height: 'clamp(44px, 6vw, 56px)',
                                        backgroundColor: '#f7ecd0',
                                        border: '1px solid #05770d',
                                    }}
                                >
                                    <img src={Silver} style={{ width: '50px' }} alt="Silver" />
                                </div>

                                <p
                                    className="fw-bold mb-0 text-wrap"
                                    style={{ color: '#adb5bd', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
                                >
                                    ระดับเงิน
                                </p>
                            </div>
                            <div className='d-flex justify-content-center'>
                                <h2 className="fw-bold" style={{ color: '#adb5bd' }}>
                                    {latestLevel["ระดับเงิน"] || 0}
                                </h2>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted small">คิดเป็น</span>
                                <span className="fw-bold" style={{ color: '#adb5bd' }}>
                                    {silverPer.toFixed(1)} %
                                </span>
                            </div>

                        </div>
                    </div>
                    <div className='col'>
                        <div className='p-3 border bg-light rounded-3 shadow h-100'>
                            <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap mb-1">
                                <div
                                    className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                                    style={{
                                        width: 'clamp(44px, 6vw, 56px)',
                                        height: 'clamp(44px, 6vw, 56px)',
                                        backgroundColor: '#f7ecd0',
                                        border: '1px solid #05770d',
                                    }}
                                >
                                    <Ban size={40} className='text-danger' />
                                </div>

                                <p
                                    className="fw-bold mb-0 text-wrap text-danger"
                                    style={{ fontSize: 'clamp(16px, 2.5vw, 20px)' }}
                                >
                                    ไม่ผ่าน
                                </p>
                            </div>
                            <div className='d-flex justify-content-center'>
                                <h2 className="fw-bold text-danger">
                                    {latestLevel["ไม่ผ่าน"] || 0}
                                </h2>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted small">คิดเป็น</span>
                                <span className="fw-bold text-danger">
                                    {notPassPer.toFixed(1)} %
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className='row row-cols-1 row-cols-sm-2 row-cols-lg-2 g-3 mb-3'>
                    <div className='col'>
                        <div className='p-3 border bg-light rounded-3 shadow h-100'>
                            {
                                selectedZone === '' ? (
                                    <BarchartForDashboard
                                        resultFobar={resultFobar}
                                    />
                                ) : (
                                    <BarChartProvinceForDash
                                        selectedZone={selectedZone}
                                        withLevel={withLevel}
                                    />
                                )
                            }
                        </div>
                    </div>
                    <div className='col'>
                        <div className='p-3 border bg-light rounded-3 shadow h-100'>
                            <DoughnutChart latestLevel={latestLevel} totalHospital={totalHospital} />
                        </div>
                    </div>
                </div>

                {/* ตารางข้อมูล */}
                <TableForHomeDashBoard originalData={originalData} withLevel={withLevel} />

                {/* <LoadingModal show={isLoading} /> */}

                {/* Modal Show Evidence Files */}

                <div
                    className='modal fade'
                    id='modalNotify'
                    tabIndex='-1'
                    aria-labelledby='modalNotifyLabel'
                    aria-hidden='true'
                    ref={modalNotifyRef}
                >
                    <div className='modal-dialog' style={{ marginTop: "70px" }}>
                        <div className='modal-content shadow-lg border-0'>
                            <div className='modal-header bg-success text-white'>
                                <h5 className='modal-title' id='modalNotifyLabel'>
                                    📢 แจ้งวันสิ้นสุดการประเมินโรงพยาบาลอัจฉริยะ ปีงบฯ 69 🔔
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className='modal-body'>
                                <div>
                                    <img src={MantananceSMH} style={{ width: '100%' }} alt="Maintenance" />
                                    {/* <p className=''>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;เรียนหน่วยบริการผู้ประเมินโรงพยาบาลอัจฉริยะ ประจำปีงบประมาณ 2569 สำนักสุขภาพดิจิทัลขอแจ้งปิดปรับปรุงระบบชั่วคราวในรวันที่ 1
                                        กรกฎาคม 2569 ตั้งแต่เวลา 15.00 - 17.00 น. เพื่อเพิ่มประสิทธิภาพในการใช้งานระบบ ขอบพระคุณครับ 🙏🙏🙏</p> */}
                                </div>

                                <div className='modal-footer'>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-dismiss="modal"
                                    >
                                        ปิด
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default FormHomePage
