import { useEffect, useState, useRef } from 'react';
import useGlobalStore from '../../../store/global-store';
import {
  getCyberLevelByHosp,
  getReportAllCatByHcode9,
  getEvaluationSummary
} from '../../../api/Report';
import { getProvAndZoneApprove } from '../../../api/Approve'
import { Ban, BlocksIcon, HandPlatter, MonitorCog, UsersRound, Star, Medal, UserRoundCheck } from 'lucide-react';
import Blue_gem from '../../../assets/Blue-gem.png';
import Gold from '../../../assets/Gold2.png';
import Silver from '../../../assets/Silver2.png';
import LoadingModal from '../../LoadingModal';
import { Radar } from 'react-chartjs-2';
import 'chart.js/auto';
import { Modal } from 'bootstrap';

const FormHomeResponder = () => {

  const user = useGlobalStore((state) => state.user);
  const token = useGlobalStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [cyberLevel, setCyberLevel] = useState(null);
  const [reportAllCat, setReportAllCat] = useState([]);
  const [listProvZoneApprove, setListProvZoneApprove] = useState([]);
  const [modalNotifyInstance, setModalNotifyInstance] = useState(null);

  const hcode9 = user?.hcode9;
  // const hcode9 = 'EA0011345';

  const modalNotifyRef = useRef(null);

  // useEffect(()=>{
  //   // สร้าง instance ของ Modal จาก ref
  //   if(modalNotifyRef.current){
  //     const modal = new Modal(modalNotifyRef.current);
  //     setModalNotifyInstance(modal);

  //   // แสดง modal ทันทีที่ component โหลด
  //    modal.show();
  //   }
  // }, []);

  useEffect(() => {
    if (!token || !hcode9) return;

    loadReportAllCat(token, hcode9);
    loadCyberLevelByHosp(token, hcode9);
    loadListProvZoneApprove(token);
  }, [token, hcode9]);

  // Get report all category
  const loadReportAllCat = async () => {
    try {
      setIsLoading(true);
      const res = await getEvaluationSummary();
      const filtered = res.data.filter(item => item.hospital_code === hcode9);
      // console.log("Data: ", filtered);
      setReportAllCat(filtered);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get cyber level by hcode9
  const loadCyberLevelByHosp = async () => {
    try {
      setIsLoading(true);
      const res = await getCyberLevelByHosp(token, hcode9);
      setCyberLevel(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  // Get list prov and zone approve
  const loadListProvZoneApprove = async () => {
    try {
      setIsLoading(true);
      const res = await getProvAndZoneApprove(token);
      const data = res.data;
      const filtered = data.filter(item => item.hospital_code === hcode9);
      setListProvZoneApprove(filtered);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  const approveStatus = Object.values(listProvZoneApprove).flat()[0];


  // Category score
  const infraScore = reportAllCat.filter(f => f.category_id === 2);
  const managementScore = reportAllCat.filter(f => f.category_id === 3);
  const serviceScore = reportAllCat.filter(f => f.category_id === 4);
  const peopleScore = reportAllCat.filter(f => f.category_id === 5);

  // Total score
  const totalScoreSum = reportAllCat.reduce((acc, item) => {
    acc.answer_value += item.answer_value || 0;
    acc.answer_required += item.answer_required || 0;
    return acc;
  }, { answer_value: 0, answer_required: 0 }
  );

  // console.log('Data: ', totalScoreSum)

  // Score for radar chart
  const infraN = infraScore.reduce((sum, i) => sum + i.answer_value, 0);
  const infraR = infraScore.reduce((sum, i) => sum + i.answer_required, 0);
  const managementN = managementScore.reduce((sum, i) => sum + i.answer_value, 0);
  const managementR = managementScore.reduce((sum, i) => sum + i.answer_required, 0);
  const serviceN = serviceScore.reduce((sum, i) => sum + i.answer_value, 0);
  const serviceR = serviceScore.reduce((sum, i) => sum + i.answer_required, 0);
  const peopleN = peopleScore.reduce((sum, i) => sum + i.answer_value, 0);


  const data = {
    labels: [
      "ด้านโครงสร้าง",
      "ด้านบริหารจัดการ",
      "ด้านการบริการ",
      "ด้านบุคลากร"
    ],
    datasets: [
      {
        label: "คะแนนที่ได้",
        data: [infraN, managementN, serviceN, peopleN],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        pointBackgroundColor: "rgba(54, 162, 235, 1)",
      },
      {
        label: "คะแนนจำเป็น",
        data: [infraR, managementR, serviceR, 0],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        pointBackgroundColor: "rgba(255, 99, 132, 1)",
      }
    ]
  };

  const options = {
    responsive: true,
    // maintainAspectRatio: false, // ⭐ สำคัญ
    scales: {
      r: {
        beginAtZero: true,
        max: 300,
        pointLabels: {
          font: {
            size: 11,      // 🔼 เพิ่มขนาดตรงนี้
            weight: "bold" // (ไม่บังคับ)
          },
          color: "#1f2937" // (ไม่บังคับ)
        },
        ticks: {
          stepSize: 50
        }
      }
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 13,        // 🔼 ขนาดตัวอักษร
            weight: "bold",  // normal | bold
            family: "Prompt, sans-serif" // ฟอนต์ (ถ้ามี)
          },
          color: "#374151", // สีตัวอักษร
          padding: 20       // ระยะห่าง
        }
      }
    }
  };



  return (
    <>
      {/* KPI Card */}
      <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
        <div className="d-flex justify-content-center">
          <div className="w-100 w-md-33 text-center m-3">
            <p className="h5 h-md-4 text-success fw-bold mb-0">
              📢🔔คะแนนที่แสดงหลังจากเปิดระบบในวันที่ 9 เม.ย.69
              เป็นคะแนนที่ผ่านการอนุมัติของ คกก.ระดับจังหวัดเรียบร้อยแล้ว 📢🔔
            </p>
          </div>
        </div>
        <div className='row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 mb-3'>
          <div className='col'>
            <div className='p-3 border bg-light rounded-3 shadow h-100'>
              <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap">
                <div
                  className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                  style={{
                    width: 'clamp(44px, 6vw, 56px)',
                    height: 'clamp(44px, 6vw, 56px)',
                    backgroundColor: '#f7ecd0',
                    border: '1px solid #05770d',
                  }}
                >
                  <BlocksIcon size={28} color='#05770d' />
                </div>

                <p
                  className="fw-bold mb-0 text-wrap"
                  style={{ color: '#05770d', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
                >
                  ด้านโครงสร้าง (Infrastructure)
                </p>
              </div>

              <div className='d-flex flex-column flex-sm-row justify-content-center align-items-stretch gap-2 my-3'>
                <div
                  className='text-center border rounded-3 p-3 shadow-sm w-100 mx-auto'
                  style={{
                    maxWidth: '180px',
                    minHeight: '140px',
                  }}
                >
                  <p className='fw-bold mb-2'>คะแนนที่ได้</p>
                  {/* Logic show score */}
                  {
                    infraScore.map((item, idx) => (
                      <div key={idx}>
                        <p className='h4 fw-bold text-primary mb-2'>{item.answer_value}/300</p>
                        <p className='fw-bold text-muted'>คิดเป็น {(item.answer_value / 300 * 100).toFixed(2)} %</p>
                      </div>
                    ))
                  }

                </div>
                <div
                  className='text-center border rounded-3 p-3 shadow-sm w-100 mx-auto'
                  style={{
                    maxWidth: '180px',
                    minHeight: '140px',
                  }}
                >
                  <p className='fw-bold mb-2'>คะแนนจำเป็น</p>
                  {/* Logic show score */}
                  {
                    infraScore.map((item, idx) => (
                      <div key={idx}>
                        <p className='h4 fw-bold text-success mb-2'>{item.answer_required}/170</p>
                        <p className='fw-bold text-muted'>คิดเป็น {(item.answer_required / 170 * 100).toFixed(2)} %</p>
                      </div>
                    ))
                  }

                </div>
              </div>

              <div className='d-flex justify-content-between px-2'>
                <p className='h6'>การอนุมัติ(คกก.สสจ.) : </p>
                {
                  approveStatus?.prov_approvedCat1 === 0
                    ? <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
                    : approveStatus?.prov_approvedCat1 === 66
                      ? <p className='h6 text-success'>🎉 อนุมัติครบแล้ว</p>
                      : <p className='h6 text-primary'>อนุมัติแล้ว {
                        approveStatus?.prov_approvedCat1}</p>
                }
              </div>
              <div className='d-flex justify-content-between px-2'>
                <p className='h6'>การอนุมัติ(คกก.เขตฯ.) : </p>
                {
                  approveStatus?.zone_approvedCat1 === 0
                    ? <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
                    : approveStatus?.zone_approvedCat1 === 66
                      ? <p className='h6 text-success'>🎉 อนุมัติครบแล้ว</p>
                      : <p className='h6 text-primary'>อนุมัติแล้ว {approveStatus?.zone_approvedCat1}</p>
                }
              </div>

            </div>
          </div>
          <div className='col'>
            <div className='p-3 border bg-light rounded-3 shadow h-100'>
              <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap">
                <div
                  className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                  style={{
                    width: 'clamp(44px, 6vw, 56px)',
                    height: 'clamp(44px, 6vw, 56px)',
                    backgroundColor: '#f7ecd0',
                    border: '1px solid #05770d',
                  }}
                >
                  <MonitorCog size={28} color='#05770d' />
                </div>

                <p
                  className="fw-bold mb-0 text-wrap"
                  style={{ color: '#05770d', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
                >
                  ด้านบริหารจัดการ (Management)
                </p>
              </div>

              <div className='d-flex flex-column flex-sm-row justify-content-center align-items-stretch gap-2 my-3'>
                <div
                  className='text-center border rounded-3 p-3 shadow-sm w-100 mx-auto'
                  style={{
                    maxWidth: '180px',
                    minHeight: '140px',
                  }}
                >
                  <p className='fw-bold mb-2'>คะแนนที่ได้</p>
                  {/* Logic show score */}
                  {
                    managementScore.map((item, idx) => (
                      <div key={idx}>
                        <p className='h4 fw-bold text-primary mb-2'>{item.answer_value}/300</p>
                        <p className='fw-bold text-muted'>คิดเป็น {(item.answer_value / 300 * 100).toFixed(2)} %</p>
                      </div>
                    ))
                  }

                </div>
                <div
                  className='text-center border rounded-3 p-3 shadow-sm w-100 mx-auto'
                  style={{
                    maxWidth: '180px',
                    minHeight: '140px',
                  }}
                >
                  <p className='fw-bold mb-2'>คะแนนจำเป็น</p>
                  {/* Logic show score */}
                  {
                    managementScore.map((item, idx) => (
                      <div key={idx}>
                        <p className='h4 fw-bold text-success mb-2'>{item.answer_required}/170</p>
                        <p className='fw-bold text-muted'>คิดเป็น {(item.answer_required / 170 * 100).toFixed(2)} %</p>
                      </div>
                    ))
                  }

                </div>
              </div>

              <div className='d-flex justify-content-between px-2'>
                <p className='h6'>การอนุมัติ(คกก.สสจ.) : </p>
                {
                  approveStatus?.prov_approvedCat2 === 0
                    ? <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
                    : approveStatus?.prov_approvedCat2 === 46
                      ? <p className='h6 text-success'>🎉 อนุมัติครบแล้ว</p>
                      : <p className='h6 text-primary'>อนุมัติแล้ว {approveStatus?.prov_approvedCat2}</p>
                }
              </div>
              <div className='d-flex justify-content-between px-2'>
                <p className='h6'>การอนุมัติ(คกก.เขตฯ.) : </p>
                {
                  approveStatus?.zone_approvedCat2 === 0
                    ? <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
                    : approveStatus?.zone_approvedCat2 === 46
                      ? <p className='h6 text-success'>🎉 อนุมัติครบแล้ว</p>
                      : <p className='h6 text-primary'>อนุมัติแล้ว {approveStatus?.zone_approvedCat2}</p>
                }
              </div>

            </div>
          </div>

          <div className='col'>
            <div className='p-3 border bg-light rounded-3 shadow h-100'>
              <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap">
                <div
                  className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                  style={{
                    width: 'clamp(44px, 6vw, 56px)',
                    height: 'clamp(44px, 6vw, 56px)',
                    backgroundColor: '#f7ecd0',
                    border: '1px solid #05770d',
                  }}
                >
                  <HandPlatter size={28} color='#05770d' />
                </div>

                <p
                  className="fw-bold mb-0 text-wrap"
                  style={{ color: '#05770d', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
                >
                  ด้านการบริการ (Service)
                </p>
              </div>

              <div className='d-flex flex-column flex-sm-row justify-content-center align-items-stretch gap-2 my-3'>
                <div
                  className='text-center border rounded-3 p-3 shadow-sm w-100 mx-auto'
                  style={{
                    maxWidth: '180px',
                    minHeight: '140px',
                  }}
                >
                  <p className='fw-bold mb-2'>คะแนนที่ได้</p>
                  {/* Logic show score */}
                  {
                    serviceScore.map((item, idx) => (
                      <div key={idx}>
                        <p className='h4 fw-bold text-primary mb-2'>{item.answer_value}/300</p>
                        <p className='fw-bold text-muted'>คิดเป็น {(item.answer_value / 300 * 100).toFixed(2)} %</p>
                      </div>
                    ))
                  }

                </div>
                <div
                  className='text-center border rounded-3 p-3 shadow-sm w-100 mx-auto'
                  style={{
                    maxWidth: '180px',
                    minHeight: '140px',
                  }}
                >
                  <p className='fw-bold mb-2'>คะแนนจำเป็น</p>
                  {/* Logic show score */}
                  {
                    serviceScore.map((item, idx) => (
                      <div key={idx}>
                        <p className='h4 fw-bold text-success mb-2'>{item.answer_required}/170</p>
                        <p className='fw-bold text-muted'>คิดเป็น {(item.answer_required / 170 * 100).toFixed(2)} %</p>
                      </div>
                    ))
                  }

                </div>
              </div>

              <div className='d-flex justify-content-between px-2'>
                <p className='h6'>การอนุมัติ(คกก.สสจ.) : </p>
                {
                  approveStatus?.prov_approvedCat3 === 0
                    ? <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
                    : approveStatus?.prov_approvedCat3 === 46
                      ? <p className='h6 text-success'>🎉 อนุมัติครบแล้ว</p>
                      : <p className='h6 text-primary'>อนุมัติแล้ว {approveStatus?.prov_approvedCat3}</p>
                }
              </div>
              <div className='d-flex justify-content-between px-2'>
                <p className='h6'>การอนุมัติ(คกก.เขตฯ.) : </p>
                {
                  approveStatus?.zone_approvedCat3 === 0
                    ? <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
                    : approveStatus?.zone_approvedCat3 === 46
                      ? <p className='h6 text-success'>🎉 อนุมัติครบแล้ว</p>
                      : <p className='h6 text-primary'>อนุมัติแล้ว {approveStatus?.zone_approvedCat3}</p>
                }
              </div>

            </div>
          </div>
          <div className='col'>
            <div className='p-3 border bg-light rounded-3 shadow h-100'>
              <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap">
                <div
                  className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                  style={{
                    width: 'clamp(44px, 6vw, 56px)',
                    height: 'clamp(44px, 6vw, 56px)',
                    backgroundColor: '#f7ecd0',
                    border: '1px solid #05770d',
                  }}
                >
                  <UserRoundCheck size={28} color='#05770d' />
                </div>

                <p
                  className="fw-bold mb-0 text-wrap"
                  style={{ color: '#05770d', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
                >
                  ด้านบุคลากร (People)
                </p>
              </div>

              <div className='d-flex flex-column flex-sm-row justify-content-center align-items-stretch gap-2 my-3'>
                <div
                  className='text-center border rounded-3 p-3 shadow-sm w-100 mx-auto'
                  style={{
                    maxWidth: '180px',
                    minHeight: '140px',
                  }}
                >
                  <p className='fw-bold mb-2'>คะแนนที่ได้</p>
                  {/* Logic show score */}
                  {
                    peopleScore.map((item, idx) => (
                      <div key={idx}>
                        <p className='h4 fw-bold text-primary mb-2'>{item.answer_value}/100</p>
                        <p className='fw-bold text-muted'>คิดเป็น {(item.answer_value / 100 * 100).toFixed(2)} %</p>
                      </div>
                    ))
                  }

                </div>
              </div>

              <div className='d-flex justify-content-between px-2'>
                <p className='h6'>การอนุมัติ(คกก.สสจ.) : </p>
                {
                  approveStatus?.prov_approvedCat4 === 0
                    ? <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
                    : approveStatus?.prov_approvedCat4 === 9
                      ? <p className='h6 text-success'>🎉 อนุมัติครบแล้ว</p>
                      : <p className='h6 text-primary'>อนุมัติแล้ว {approveStatus?.prov_approvedCat4}</p>
                }
              </div>
              <div className='d-flex justify-content-between px-2'>
                <p className='h6'>การอนุมัติ(คกก.เขตฯ.) : </p>
                {
                  approveStatus?.zone_approvedCat4 === 0
                    ? <p className='h6 text-danger'>ยังไม่อนุมัติ</p>
                    : approveStatus?.zone_approvedCat4 === 9
                      ? <p className='h6 text-success'>🎉 อนุมัติครบแล้ว</p>
                      : <p className='h6 text-primary'>อนุมัติแล้ว {approveStatus?.zone_approvedCat4}</p>
                }
              </div>

            </div>
          </div>

        </div>

        <div className="row g-3 mb-3">
          {/* Radar Chart */}
          <div className="col-12 col-lg-8 h-100">
            <div className="d-flex flex-column gap-3">
              <div className='p-3 border bg-light rounded-3 shadow'>
                <div
                  className='d-flex justify-content-center'
                  style={{ maxWidth: 480, margin: "0 auto" }}
                >
                  <Radar data={data} options={options} />
                </div>
              </div>
            </div>
          </div>
          {/* Summary */}
          <div className="col-12 col-lg-4 h-100">
            <div className="d-flex flex-column gap-3">
              <div className='p-3 border bg-light rounded-3 shadow'>
                <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap">
                  <div
                    className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                    style={{
                      width: 'clamp(44px, 6vw, 56px)',
                      height: 'clamp(44px, 6vw, 56px)',
                      backgroundColor: '#f7ecd0',
                      border: '1px solid #05770d',
                    }}
                  >
                    <Medal size={28} color='#05770d' />
                  </div>

                  <p
                    className="fw-bold mb-0 text-wrap"
                    style={{ color: '#05770d', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
                  >
                    คะแนนที่ได้อยู่ในระดับ (Level)
                  </p>
                </div>

                <div className='d-flex justify-content-center'>
                  {
                    totalScoreSum.answer_value < 600 && (
                      <div className="d-flex flex-column justify-content-center align-items-center text-center">
                        <p className="fw-bold text-primary fs-4 fs-md-3 fs-lg-2">
                          ไม่ผ่าน
                        </p>
                        <div className="d-flex justify-content-center">
                          <Ban
                            style={{
                              color: "red",
                              width: "clamp(80px, 15vw, 130px)",
                              height: "clamp(80px, 15vw, 130px)"
                            }}
                          />
                        </div>
                      </div>
                    )
                  }
                  {
                    ((totalScoreSum.answer_value >= 600 && totalScoreSum.answer_value < 700) ||
                      (totalScoreSum.answer_value >= 700 && totalScoreSum.answer_value < 800 && totalScoreSum.answer_required !== 510) ||
                      (totalScoreSum.answer_value >= 800 && totalScoreSum.answer_required !== 510)) && (
                      <div className="d-flex flex-column justify-content-center align-items-center text-center">
                        <p className="fw-bold text-primary fs-4 fs-md-3 fs-lg-2">
                          ระดับเงิน
                        </p>
                        <div className="d-flex justify-content-center">
                          <img
                            style={{
                              width: "clamp(80px, 15vw, 130px)",
                              height: "clamp(80px, 15vw, 130px)"
                            }}
                            src={Silver}
                          />
                        </div>
                      </div>
                    )
                  }
                  {
                    ((totalScoreSum.answer_value >= 700 &&
                      totalScoreSum.answer_value < 800 &&
                      totalScoreSum.answer_required === 510) ||
                      (totalScoreSum.answer_value >= 800 &&
                        totalScoreSum.answer_required === 510 &&
                        cyberLevel?.cyber_level !== 'GREEN')) && (
                      <div className="d-flex flex-column justify-content-center align-items-center text-center">
                        <p className="fw-bold text-warning fs-4 fs-md-3 fs-lg-2">
                          ระดับทอง
                        </p>
                        <div className="d-flex justify-content-center">
                          <img
                            style={{
                              width: "clamp(80px, 15vw, 130px)",
                              height: "clamp(80px, 15vw, 130px)"
                            }}
                            src={Gold}
                          />
                        </div>
                      </div>
                    )
                  }
                  {
                    totalScoreSum.answer_value >= 800 &&
                    totalScoreSum.answer_required === 510 &&
                    cyberLevel?.cyber_level === 'GREEN' && (
                      <div className="d-flex flex-column justify-content-center align-items-center text-center">
                        <p className="fw-bold text-primary fs-4 fs-md-3 fs-lg-2">
                          ระดับเพชร
                        </p>
                        <div className="d-flex justify-content-center">
                          <img
                            style={{
                              width: "clamp(80px, 15vw, 130px)",
                              height: "clamp(80px, 15vw, 130px)"
                            }}
                            src={Blue_gem}
                          />
                        </div>
                      </div>
                    )
                  }
                </div>

              </div>

              <div className='p-3 border bg-light rounded-3 shadow'>
                <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap mb-5">
                  <div
                    className='d-flex align-items-center justify-content-center rounded-circle flex-shrink-0'
                    style={{
                      width: 'clamp(44px, 6vw, 56px)',
                      height: 'clamp(44px, 6vw, 56px)',
                      backgroundColor: '#f7ecd0',
                      border: '1px solid #05770d',
                    }}
                  >
                    <Star size={28} color='#05770d' />
                  </div>

                  <p
                    className="fw-bold mb-0 text-wrap"
                    style={{ color: '#05770d', fontSize: 'clamp(16px, 2.5vw, 20px)' }}
                  >
                    คะแนนรวมทุกด้าน (Total Score)
                  </p>
                </div>

                <div className='d-flex justify-content-between px-2'>
                  <div>
                    <p className='text-muted fw-bold'>คะแนนที่ได้รวม</p>
                  </div>
                  <div>
                    {
                      totalScoreSum.answer_value < 600
                        ? <p className='fw-bold text-danger'>{totalScoreSum.answer_value}</p>
                        : totalScoreSum.answer_value >= 600 && totalScoreSum.answer_value < 700
                          ? <p className='fw-bold text-secondary'>{totalScoreSum.answer_value}</p>
                          : totalScoreSum.answer_value >= 800 && totalScoreSum.answer_required !== 510
                            ? <p className='fw-bold text-secondary'>{totalScoreSum.answer_value}</p>
                            : totalScoreSum.answer_value >= 700 && totalScoreSum.answer_value < 800 && totalScoreSum.answer_required === 510
                              ? <p className='fw-bold text-secondary'>{totalScoreSum.answer_value}</p>
                              : totalScoreSum.answer_value >= 700 && totalScoreSum.answer_value < 800 && totalScoreSum.answer_required !== 510
                                ? <p className='fw-bold text-secondary'>{totalScoreSum.answer_value}</p>
                                : totalScoreSum.answer_value >= 800 && totalScoreSum.answer_required === 510 && cyberLevel?.cyber_level === 'GREEN'
                                  ? <p className='fw-bold text-primary'>{totalScoreSum.answer_value}</p>
                                  : totalScoreSum.answer_value >= 800 && totalScoreSum.answer_required === 510 && cyberLevel?.cyber_level !== 'GREEN'
                                    ? <p className='fw-bold text-warning'>{totalScoreSum.answer_value}</p>
                                    : null
                    }
                  </div>
                </div>
                <div className='d-flex justify-content-between px-2'>
                  <div>
                    <p className='text-muted fw-bold'>คะแนนจำเป็นรวม</p>
                  </div>
                  <div>
                    {
                      totalScoreSum.answer_required < 510
                        ? <p className='fw-bold text-danger'>{totalScoreSum.answer_required}</p>
                        : <p className='fw-bold text-success'>{totalScoreSum.answer_required}</p>
                    }
                  </div>
                </div>
                <div className='d-flex justify-content-between px-2'>
                  <div>
                    <p className='text-muted fw-bold'>ระดับเกณฑ์ CTAM+ ของ ศทส.</p>
                  </div>
                  <div>
                    {
                      cyberLevel?.cyber_level === 'GREEN'
                        ? <p className='fw-bold text-success'>{cyberLevel?.cyber_levelname}</p>
                        : cyberLevel?.cyber_level === 'YELLOW'
                          ? <p className='fw-bold text-warning'>{cyberLevel?.cyber_levelname}</p>
                          : cyberLevel?.cyber_level === 'RED'
                            ? <p className='fw-bold text-danger'>{cyberLevel?.cyber_levelname}</p>
                            : <p className='fw-bold'>-</p>
                    }
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

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
          <div className='modal-dialog modal-lg' style={{ marginTop: "70px" }}>
            <div className='modal-content shadow-lg border-0'>
              <div className='modal-header bg-success text-white'>
                <h5 className='modal-title' id='modalNotifyLabel'>
                  📢 แจ้งปิดระบบสำหรับสิทธิ์ผู้ประเมินหน่วยบริการชั่วคราว 🔔
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
                  <p className=''>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;เรียนหน่วยบริการผู้ประเมินโรงพยาบาลอัจฉริยะ ประจำปีงบประมาณ 2569 สำนักสุขภาพดิจิทัลขอแจ้งปิดระบบชั่วคราวในระยะแรก จากวันที่ 1-8
                    เมษายน 2569 เพื่อให้คณะกรรมการระดับจังหวัดได้ตรวจสอบหลักฐาน เพื่อประกอบการอนุมัติผลการประเมินในระยะแรก และจะเปิดระบบให้หน่วยบริการเข้าทำการประเมินอีกครั้งในวันที่ 9 เมษายน 2569 เวลา 6.00 น. ขอบพระคุณครับ 🙏🙏🙏</p>
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

export default FormHomeResponder