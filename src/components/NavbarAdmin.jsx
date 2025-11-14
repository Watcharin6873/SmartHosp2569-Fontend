import React, { useRef } from 'react';
import System_logo from "../assets/SmartHospital-Logo2.png";
import {
    FileQuestion,
    LayoutDashboard,
    ListPlus,
    ListTodo,
    LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import useGlobalStore from '../store/global-store';
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import { toast } from 'react-toastify';
import { signout } from '../api/Auth';

const NavbarAdmin = () => {

    const user = useGlobalStore((state) => state.user);
    const logout = useGlobalStore((state) => state.logout);
    const navigate = useNavigate();

    const modalRef = useRef(null);
    const modalInstanceRef = useRef(null);

    // ฟังก์ชันปิด offcanvas โดยใช้ Bootstrap API
    const handleClose = () => {
        const offcanvasEl = document.getElementById("offcanvasNavbar");
        const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (bsOffcanvas) {
            bsOffcanvas.hide();
        }
    };

    const handleLogout = () => {
        // สร้าง instance ของ Modal จาก ref
        if (modalRef.current) {
            modalInstanceRef.current = new Modal(modalRef.current);
            modalInstanceRef.current.show();
        }
    }

    const handleConfirm = async () => {
        await signout(user)

        logout()

        if (modalInstanceRef.current) {
            modalInstanceRef.current.hide();
        }

        Swal.fire({
            title: "📢 Logout success!",
            text: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
            icon: "success",
            showConfirmButton: false,
            timer: 2000
        });
        setTimeout(() => navigate('/smarthosp2569/'), 2000);
    }

    return (
        <>
            <div style={{ fontFamily: "Sarabun, sans-serif" }}>
                <nav className="navbar navbar-dark bg-success fixed-top">
                    <div className="container-fluid">
                        <NavLink className="navbar-brand" to="/smarthosp2569/">
                            <img src={System_logo} alt="logo" height={40} />
                        </NavLink>
                        <button
                            className="navbar-toggler"
                            type="button"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#offcanvasNavbar"
                            aria-controls="offcanvasNavbar"
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div
                            className={`offcanvas offcanvas-start bg-success`}
                            tabIndex="-1"
                            id="offcanvasNavbar"
                            aria-labelledby="offcanvasNavbarLabel"
                        >
                            <div className="offcanvas-header">
                                <div
                                    className="offcanvas-title d-flex justify-content-center w-100"
                                    id="offcanvasNavbarLabel"
                                >
                                    <img src={System_logo} alt="logo" width={250} height={60} />
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="offcanvas"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="offcanvas-body">
                                <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                                    <li className="nav-item">
                                        <NavLink
                                            to={"/smarthosp2569/admin"}
                                            end
                                            className={({ isActive }) =>
                                                "nav-link" + (isActive ? " active" : "")
                                            }
                                            onClick={handleClose}
                                        >
                                            <LayoutDashboard /> Dashboard
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink
                                            to={"/smarthosp2569/admin/create-topic"}
                                            end
                                            className={({ isActive }) =>
                                                "nav-link" + (isActive ? " active" : "")
                                            }
                                            onClick={handleClose}
                                        >
                                            <ListPlus /> เพิ่มหัวข้อแบบประเมิน
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink
                                            to={"/smarthosp2569/admin/create-category"}
                                            end
                                            className={({ isActive }) =>
                                                "nav-link" + (isActive ? " active" : "")
                                            }
                                            onClick={handleClose}
                                        >
                                            <ListPlus /> เพิ่มกลุ่มคำถามแบบประเมิน
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink
                                            to={"/smarthosp2569/admin/create-question"}
                                            end
                                            className={({ isActive }) =>
                                                "nav-link" + (isActive ? " active" : "")
                                            }
                                            onClick={handleClose}
                                        >
                                            <FileQuestion /> เพิ่มคำถามในแบบประเมิน
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink
                                            to={"/smarthosp2569/admin/create-choice"}
                                            end
                                            className={({ isActive }) =>
                                                "nav-link" + (isActive ? " active" : "")
                                            }
                                            onClick={handleClose}
                                        >
                                            <ListTodo /> เพิ่มคำตอบ Smart Hospital
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink
                                            to={"/smarthosp2569/admin/create-score-survey"}
                                            end
                                            className={({ isActive }) =>
                                                "nav-link" + (isActive ? " active" : "")
                                            }
                                            onClick={handleClose}
                                        >
                                            <ListTodo /> เพิ่มคำตอบ After service
                                        </NavLink>
                                    </li>
                                </ul>

                                {/* 🔻 ปุ่ม Logout ด้านล่าง */}
                                <div className="offcanvas-footer border-top pt-3">
                                    <button
                                        className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2"
                                        onClick={handleLogout}
                                        data-bs-dismiss="offcanvas"
                                    >
                                        <LogOut /> ออกจากระบบ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Modal ListHosp */}
                <div
                    className="modal fade"
                    id="confirmModal"
                    tabIndex="-1"
                    aria-labelledby="confitmModalLabel"
                    aria-hidden="true"
                    ref={modalRef}
                >
                    <div className="modal-dialog" style={{ marginTop: '100px' }}>
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title" id="confitmModalLabel">
                                    ⚠️ ยืนยันการออกจากระบบ
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body d-flex justify-content-center">
                                คุณต้องการออกจากระบบหรือไม่?
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleConfirm}
                                >
                                    ⏻ ออกจากระบบ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* End Modal ListHosp */}
            </div>


        </>
    )
}

export default NavbarAdmin
