import { BlocksIcon, HandPlatter, MonitorCog, UserRoundCheck } from 'lucide-react';
import React from 'react'

const ProgressEvaluation = ({ filteredListEvaluate, filteredHospitals }) => {

    const filterInfra = filteredListEvaluate.filter(f => f.category_id === 2);
    const filterManage = filteredListEvaluate.filter(f => f.category_id === 3);
    const filterServ = filteredListEvaluate.filter(f => f.category_id === 4);
    const filterPeople = filteredListEvaluate.filter(f => f.category_id === 5);

    const maxValue = filteredHospitals.length || 1; // กันหาร 0
    const progressValue1 = Math.round((filterInfra.length / maxValue) * 100);
    const progressValue2 = Math.round((filterManage.length / maxValue) * 100);
    const progressValue3 = Math.round((filterServ.length / maxValue) * 100);
    const progressValue4 = Math.round((filterPeople.length / maxValue) * 100);

    const done1 = filterInfra.length;
    const done2 = filterManage.length;
    const done3 = filterServ.length;
    const done4 = filterPeople.length

    const pending1 = maxValue - done1;
    const pending2 = maxValue - done2;
    const pending3 = maxValue - done3;
    const pending4 = maxValue - done4;

    const pendingPersent1 = 100 - progressValue1;
    const pendingPersent2 = 100 - progressValue2;
    const pendingPersent3 = 100 - progressValue3;
    const pendingPersent4 = 100 - progressValue4;

    return (
        <div className='row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 mb-3'>
            <div className='col'>
                <div className='p-3 border bg-light rounded-3 shadow h-100'>
                    <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap mb-3">
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
                            ด้านโครงสร้าง <br /> (Infrastructure)
                        </p>
                    </div>

                    <div className="d-flex justify-content-center px-3">
                        <div
                            className="progress w-100"
                            style={{
                                maxWidth: "500px",   // จำกัดความกว้างบนจอใหญ่
                                height: "20px"      // ปรับความสูงให้ดูชัดบนมือถือ
                            }}
                        >
                            <div
                                className='progress-bar bg-warning progress-bar-striped progress-bar-animated'
                                role='progressbar'
                                style={{ width: `${progressValue1}%` }}   // 🔥 ค่า dynamic
                                aria-valuenow={done1}
                                aria-valuemin='0'
                                aria-valuemax={maxValue}
                            >
                                <span className='fw-bold'>{done1}</span>
                            </div>
                            <div
                                className='progress-bar progress-bar-striped progress-bar-animated'
                                role='progressbar'
                                style={{
                                    width: `${pendingPersent1}%`,// 🔥 ค่า dynamic
                                    backgroundColor: "#cfd2d5"   // เทาอ่อน Bootstrap-style
                                }}
                                aria-valuenow={pending1}
                                aria-valuemin='0'
                                aria-valuemax={maxValue}
                            >
                                <span className='fw-bold'>{pending1}</span>
                            </div>
                        </div>
                    </div>
                    <div className='d-flex flex-column'>
                        {/* 🎉 ข้อความแสดงเมื่อครบ */}
                        {pending1 === 0 ? (
                            <small className='text-warning fw-bold'>
                                🎉 ประเมินครบแล้ว!
                            </small>
                        ) : (
                            <div className='d-flex justify-content-between'>
                                <small className='fw-bold text-warning'>ประเมินแล้ว</small>
                                <small className='fw-bold text-secondary'>ยังไม่ประเมิน</small>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <div className='col'>
                <div className='p-3 border bg-light rounded-3 shadow h-100'>
                    <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap mb-3">
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
                            ด้านบริหารจัดการ <br /> (Management)
                        </p>
                    </div>

                    <div className="d-flex justify-content-center px-3">
                        <div
                            className="progress w-100"
                            style={{
                                maxWidth: "500px",   // จำกัดความกว้างบนจอใหญ่
                                height: "20px"      // ปรับความสูงให้ดูชัดบนมือถือ
                            }}
                        >
                            <div
                                className='progress-bar bg-info progress-bar-striped progress-bar-animated'
                                role='progressbar'
                                style={{ width: `${progressValue2}%` }}   // 🔥 ค่า dynamic
                                aria-valuenow={done2}
                                aria-valuemin='0'
                                aria-valuemax={maxValue}
                            >
                                <span className='fw-bold'>{done2}</span>
                            </div>
                            <div
                                className='progress-bar progress-bar-striped progress-bar-animated'
                                role='progressbar'
                                style={{
                                    width: `${pendingPersent2}%`, // 🔥 ค่า dynamic
                                    backgroundColor: "#cfd2d5"   // เทาอ่อน Bootstrap-style
                                }}
                                aria-valuenow={pending2}
                                aria-valuemin='0'
                                aria-valuemax={maxValue}
                            >
                                <span className='fw-bold'>{pending2}</span>
                            </div>
                        </div>
                    </div>
                    <div className='d-flex flex-column'>
                        {/* 🎉 ข้อความแสดงเมื่อครบ */}
                        {pending2 === 0 ? (
                            <small className='text-info fw-bold'>
                                🎉 ประเมินครบแล้ว!
                            </small>
                        ) : (
                            <div className='d-flex justify-content-between'>
                                <small className='fw-bold text-info'>ประเมินแล้ว</small>
                                <small className='fw-bold text-secondary'>ยังไม่ประเมิน</small>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <div className='col'>
                <div className='p-3 border bg-light rounded-3 shadow h-100'>
                    <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap mb-3">
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
                            ด้านการบริการ <br /> (Service)
                        </p>
                    </div>

                    <div className="d-flex justify-content-center px-3">
                        <div
                            className="progress w-100"
                            style={{
                                maxWidth: "500px",   // จำกัดความกว้างบนจอใหญ่
                                height: "20px"      // ปรับความสูงให้ดูชัดบนมือถือ
                            }}
                        >
                            <div
                                className='progress-bar bg-success progress-bar-striped progress-bar-animated'
                                role='progressbar'
                                style={{ width: `${progressValue3}%` }}   // 🔥 ค่า dynamic
                                aria-valuenow={done3}
                                aria-valuemin='0'
                                aria-valuemax={maxValue}
                            >
                                <span className='fw-bold'>{done3}</span>
                            </div>
                            <div
                                className='progress-bar progress-bar-striped progress-bar-animated'
                                role='progressbar'
                                style={{
                                    width: `${pendingPersent3}%`, // 🔥 ค่า dynamic
                                    backgroundColor: "#cfd2d5"   // เทาอ่อน Bootstrap-style
                                }}
                                aria-valuenow={pending3}
                                aria-valuemin='0'
                                aria-valuemax={maxValue}
                            >
                                <span className='fw-bold'>{pending3}</span>
                            </div>
                        </div>
                    </div>
                    <div className='d-flex flex-column'>
                        {/* 🎉 ข้อความแสดงเมื่อครบ */}
                        {pending3 === 0 ? (
                            <small className='text-success fw-bold'>
                                🎉 ประเมินครบแล้ว!
                            </small>
                        ) : (
                            <div className='d-flex justify-content-between'>
                                <small className='fw-bold text-success'>ประเมินแล้ว</small>
                                <small className='fw-bold text-secondary'>ยังไม่ประเมิน</small>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <div className='col'>
                <div className='p-3 border bg-light rounded-3 shadow h-100'>
                    <div className="d-flex align-items-center gap-3 flex-sm-nowrap flex-wrap mb-3">
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
                            ด้านบุคลากร <br /> (People)
                        </p>
                    </div>

                    <div className="d-flex justify-content-center px-3">
                        <div
                            className="progress w-100"
                            style={{
                                maxWidth: "500px",   // จำกัดความกว้างบนจอใหญ่
                                height: "20px"      // ปรับความสูงให้ดูชัดบนมือถือ
                            }}
                        >
                            <div
                                className='progress-bar progress-bar-striped progress-bar-animated'
                                role='progressbar'
                                style={{ width: `${progressValue4}%` }}   // 🔥 ค่า dynamic
                                aria-valuenow={done4}
                                aria-valuemin='0'
                                aria-valuemax={maxValue}
                            >
                                <span className='fw-bold'>{done4}</span>
                            </div>
                            <div
                                className='progress-bar progress-bar-striped progress-bar-animated'
                                role='progressbar'
                                style={{
                                    width: `${pendingPersent4}%`, // 🔥 ค่า dynamic
                                    backgroundColor: "#cfd2d5"   // เทาอ่อน Bootstrap-style
                                }}
                                aria-valuenow={pending4}
                                aria-valuemin='0'
                                aria-valuemax={maxValue}
                            >
                                <span className='fw-bold'>{pending4}</span>
                            </div>
                        </div>
                    </div>
                    <div className='d-flex flex-column'>
                        {/* 🎉 ข้อความแสดงเมื่อครบ */}
                        {pending4 === 0 ? (
                            <small className='text-primary fw-bold'>
                                🎉 ประเมินครบแล้ว!
                            </small>
                        ) : (
                            <div className='d-flex justify-content-between'>
                                <small className='fw-bold text-primary'>ประเมินแล้ว</small>
                                <small className='fw-bold text-secondary'>ยังไม่ประเมิน</small>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ProgressEvaluation
