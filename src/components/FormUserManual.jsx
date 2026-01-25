import React from 'react'

const FormUserManual = () => {
    return (
        <div style={{ fontFamily: "Sarabun, sans-serif" }}>
            <div className='d-flex justify-content-center mb-3'>
                <h3 className='p-3 text-success'>คู่มือการใช้งานระบบ และคู่มือเกณฑ์การประเมินโรงพยาบาลอัจฉริยะ 2569</h3>
            </div>

            <div>
                <ul>
                    <li className="mb-3">
                        <a
                            href={`${import.meta.env.VITE_APP_API}/user_manual/User_Manual_System_2569.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h5 text-primary text-decoration-none"
                        >
                            คู่มือการใช้งานระบบประเมินโรงพยาบาลอัจฉริยะ ปีงบประมาณ พ.ศ. 2569
                        </a>
                    </li>
                    <li>
                        <a
                            href={`${import.meta.env.VITE_APP_API}/user_manual/V6User_Manual_Smart Hospitals_2569.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h5 text-primary text-decoration-none"
                        >
                            คู่มือเกณฑ์การระบบประเมินโรงพยาบาลอัจฉริยะ ปีงบประมาณ พ.ศ. 2569
                        </a>
                    </li>
                </ul>
            </div>


        </div>
    )
}

export default FormUserManual