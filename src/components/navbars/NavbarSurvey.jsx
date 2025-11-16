import React from 'react';
import { NavLink } from "react-router";
import Moph_logo from '../../assets/logo-MOPH.png';



const NavbarSurvey = () => {

    return (
        <>
            <div style={{ fontFamily: "Sarabun, sans-serif" }}>
                <nav className="navbar navbar-dark bg-success fixed-top">
                    <div className="container-fluid d-flex justify-content-center align-items-center">
                        <span
                            className="navbar-brand text-center text-wrap fw-bold"
                            style={{
                                fontSize: "clamp(18px, 3vw, 32px)", // ปรับอัตโนมัติตามขนาดจอ
                                maxWidth: "90%", // ป้องกันข้อความล้นจอ
                                whiteSpace: "normal",
                                lineHeight: 1.2,
                            }}
                        >
                            แบบประเมินความพึงพอใจหลังเข้ารับบริการ
                        </span>
                    </div>
                </nav>
            </div>
        </>
    )
}

export default NavbarSurvey
