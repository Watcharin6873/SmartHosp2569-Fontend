import React from 'react'
import { useLocation } from 'react-router';
import ProviderId from '../../assets/Provider-id.png';
import Logo_moph from '../../assets/Logo_MOPH.png';
import Register from './Register';
import Login from './Login';


const PageAuth = () => {
    const scope = [
        "cid",
        "title_th",
        "title_eng",
        "name_th",
        "name_eng",
        "mobile_number",
        "email",
        "organization",
        "ial",
        "idp_permission",
        "offline_access"
    ].join(" ");


    const redirectURL = import.meta.env.VITE_REDIRECT_URL;
    const clientId = import.meta.env.VITE_CLIENT_ID;

    // รับข้อมูล Provider profile
    const location = useLocation();
    const callbackData = location.state;
    // console.log('service:', callbackData)

    // URL register
    const urlRegister = () => {
        window.location.href = `https://provider.id.th/v1/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectURL}&scope=${encodeURIComponent(scope)}&state=register`
    }

    // URL Signin
    const urlAdminSignin = () => {
        window.location.href = `https://provider.id.th/v1/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectURL}&scope=${encodeURIComponent(scope)}&state=signin`
    }
    return (
        <>
            <div style={{ fontFamily: "Sarabun, sans-serif" }}>
                <div className="d-flex justify-content-center p-3">
                    <div className="card border-success border-0 col-12 col-md-10 col-lg-6 p-0 rounded-5">

                        <div className="card-body bg-success rounded-5 p-4">

                            {/* Logo + Title */}
                            <div className="d-flex flex-column justify-content-center align-items-center mb-4 text-center">
                                <img src={Logo_moph} alt="moph" width={140} className="img-fluid" />
                                <h3 className="mt-3 text-white fw-semibold">
                                    ระบบประเมินโรงพยาบาลอัจฉริยะ <br />(Smart hospital)
                                </h3>
                            </div>

                            {/* Inner Card */}
                            <div className="card shadow-lg border-success border-0 rounded-5 mx-auto" style={{ maxWidth: "450px" }}>
                                <div className="card-body p-4">

                                    {/* Provider Image */}
                                    <div className="d-flex justify-content-center">
                                        <img src={ProviderId} alt="Pro" className="img-fluid" style={{ maxWidth: "230px" }} />
                                    </div>

                                    {/* Button Login */}
                                    <div className="d-flex justify-content-center mt-4">
                                        <button
                                            className="btn btn-lg rounded-5 border-1 border-success w-75 text-success bg-white"
                                            onClick={urlAdminSignin}
                                        >
                                            ลงชื่อเข้าใช้
                                        </button>
                                    </div>

                                    <div className="d-flex align-items-center my-3">
                                        <hr className="flex-grow-1" />
                                        <span className="mx-2 text-muted">หรือ</span>
                                        <hr className="flex-grow-1" />
                                    </div>

                                    <div className="d-flex flex-column justify-content-center align-items-center">
                                        <p className='text-success mb-3'>หากยังไม่ได้ลงทะเบียน</p>
                                        <button
                                            className="btn btn-success btn-lg rounded-5 border-1 w-75"
                                            onClick={urlRegister}
                                        >
                                            ลงทะเบียน
                                        </button>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {
                    callbackData?.myState === "register" ? (
                        <Register callbackData={callbackData?.safeData} />
                    ) : callbackData?.myState === "signin" ? (
                        <Login callbackData={callbackData?.safeData} />
                    ) : (null)
                }

            </div>
        </>
    )
}

export default PageAuth
