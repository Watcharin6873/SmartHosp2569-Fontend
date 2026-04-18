import { useEffect, useRef, useState } from 'react';
import System_logo from "../../assets/SmartHospital-Logo2.png";
import logo_moph from "../../assets/logo-MOPH.png";
import { NavLink } from "react-router";
import { Contact, LayoutDashboard, TableOfContents, TableOfContentsIcon, UserPlus } from 'lucide-react';
import { Collapse, Modal } from 'bootstrap';
import Mantanance_SMH from '../../assets/Mantanance_SMH.png';

const NavbarDefault = () => {

    const isDisabled = false; // กำหนดเป็น true เพื่อปิดการใช้งานเมนูประเมินชั่วคราว

    const [modalNotifyInstance, setModalNotifyInstance] = useState(null);
    const modalNotifyRef = useRef(null);

    useEffect(() => {
        if (modalNotifyRef.current) {
            setModalNotifyInstance(new Modal(modalNotifyRef.current));
        }
    }, []);

    const closeMenu = () => {
        const menu = document.getElementById("navbarSupportedContent");
        if (menu && menu.classList.contains("show")) {
            new Collapse(menu).hide();
        }
    };

    const handleClickMenu = (e) => {
        e.preventDefault();
        modalNotifyInstance.show();
    }

    return (
        <>
            <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
                <nav className='navbar navbar-dark bg-success fixed-top navbar-expand-lg'>
                    <div className='container-fluid'>

                        {/* Brand */}
                        <NavLink className='navbar-brand' to='/smarthosp2569/'>
                            <img src={logo_moph} alt="logo" height={40} /> ระบบประเมินโรงพยาบาลอัจฉริยะ
                        </NavLink>

                        {/* Toggler for mobile */}
                        <button
                            className="navbar-toggler"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#navbarSupportedContent"
                            aria-controls="navbarSupportedContent"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        {/* Nav items */}
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                                <li className="nav-item">
                                    <NavLink
                                        to={"/smarthosp2569/"}
                                        end
                                        className={({ isActive }) =>
                                            "nav-link" + (isActive ? " active" : "")
                                        }
                                        onClick={closeMenu}
                                    >
                                        <LayoutDashboard size={20} /> ผลการประเมินปัจจุบัน(คกก.จังหวัดอนุมัติแล้ว)
                                    </NavLink>
                                </li>
                                {/* <li className="nav-item">
                                    <NavLink
                                        to={"/smarthosp2569/dashboard-all-evaluate"}
                                        end
                                        className={({ isActive }) =>
                                            "nav-link" + (isActive ? " active" : "")
                                        }
                                        onClick={closeMenu}
                                    >
                                        <TableOfContentsIcon size={20} /> ผลการประเมินก่อน คกก.จังหวัด อนุมัติ
                                    </NavLink>
                                </li> */}
                                {isDisabled ? (
                                    <>
                                        <li className="nav-item">
                                            <NavLink
                                                to={"/smarthosp2569/page-auth"}
                                                className={({ isActive }) =>
                                                    "nav-link" + (isActive ? " active" : "")
                                                }
                                                onClick={handleClickMenu}
                                            >
                                                <UserPlus size={20} /> ลงทะเบียน / ล็อกอิน
                                            </NavLink>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="nav-item">
                                            <NavLink
                                                to={"/smarthosp2569/page-auth"}
                                                className={({ isActive }) =>
                                                    "nav-link" + (isActive ? " active" : "")
                                                }
                                                onClick={closeMenu}
                                            >
                                                <UserPlus size={20} /> ลงทะเบียน / ล็อกอิน
                                            </NavLink>
                                        </li>
                                    </>
                                )}
                                <li className="nav-item">
                                    <NavLink
                                        to={"/smarthosp2569/user-manual"}
                                        className={({ isActive }) =>
                                            "nav-link" + (isActive ? " active" : "")
                                        }
                                        onClick={closeMenu}
                                    >
                                        <TableOfContents size={20} /> คู่มือการใช้งาน
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink
                                        to={"/smarthosp2569/contact-us"}
                                        className={({ isActive }) =>
                                            "nav-link" + (isActive ? " active" : "")
                                        }
                                        onClick={closeMenu}
                                    >
                                        <Contact size={20} /> ติดต่อเรา
                                    </NavLink>
                                </li>
                            </ul>
                        </div>

                    </div>
                </nav>

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
                                    📢 แจ้งปิดปรับปรุงระบบชั่วคราว 🔔
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
                                     <img src={Mantanance_SMH} style={{ width: '100%' }} alt="Maintenance" />
                                    {/* <p className=''>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;เรียนหน่วยบริการผู้ประเมินโรงพยาบาลอัจฉริยะ ประจำปีงบประมาณ 2569 สำนักสุขภาพดิจิทัลขอแจ้งปิดระบบชั่วคราวในระยะแรก จากวันที่ 1-8
                                        เมษายน 2569 เพื่อให้คณะกรรมการระดับจังหวัดได้ตรวจสอบหลักฐาน เพื่อประกอบการอนุมัติผลการประเมินในระยะแรก และจะเปิดระบบให้หน่วยบริการเข้าทำการประเมินอีกครั้งในวันที่ 9 เมษายน 2569 เวลา 6.00 น. ขอบพระคุณครับ 🙏🙏🙏</p> */}
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

export default NavbarDefault
