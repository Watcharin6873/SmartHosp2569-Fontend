import { useRef } from 'react';
import logo_moph from '../../assets/logo-MOPH.png'
import { NavLink, useNavigate } from 'react-router';
import useGlobalStore from '../../store/global-store';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';
import { BlocksIcon, FolderOpenIcon, HandPlatter, LayoutDashboard, MonitorCog, UserRoundCheck, UserRoundCog } from 'lucide-react';
import { signout } from '../../api/Auth';

const NavbarForProvince = () => {

    const user = useGlobalStore((state) => state.user);
    const logout = useGlobalStore((state) => state.logout);
    const navigate = useNavigate();

    const modalRef = useRef(null);
    const modalInstanceRef = useRef(null);

    // ฟังก์ชัน ปิดเมนูเมื่อคลิกใน Smart phone
    const closeMenu = () => {
        const menu = document.getElementById("navbarContent");
        if (menu && menu.classList.contains("show")) {
            new Collapse(menu).hide();
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
            <div style={{ fontFamily: 'Sarabun, sans-serif' }}>
                <nav className='navbar navbar-dark bg-success fixed-top navbar-expand-lg'>
                    <div className='container-fluid'>
                        {/* Navbar brand */}
                        <NavLink
                            className='navbar-brand'
                            to='/smarthosp2569/user/prov-approve'
                        >
                            <img src={logo_moph} alt="logo" height={40} /> ระบบประเมินโรงพยาบาลอัจฉริยะ
                        </NavLink>
                        {/* Toggle */}
                        <button
                            className='navbar-toggler'
                            type='button'
                            data-bs-toggle='collapse'
                            data-bs-target='#navbarContent'
                            aria-controls='navbarContent'
                            aria-expanded='false'
                            aria-label='Toggle navigation'
                        >
                            <span className='navbar-toggler-icon'></span>
                        </button>
                        {/* Navbar item */}
                        <div className='collapse navbar-collapse' id='navbarContent'>
                            <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
                                <li className="nav-item">
                                    <NavLink
                                        to={"/smarthosp2569/user/prov-approve"}
                                        end
                                        className={({ isActive }) =>
                                            "nav-link" + (isActive ? " active" : "")
                                        }
                                        onClick={closeMenu}
                                    >
                                        <LayoutDashboard size={20} /> Dashboard
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink
                                        to={"/smarthosp2569/user/prov-approve/user-management"}
                                        end
                                        className={({ isActive }) =>
                                            "nav-link" + (isActive ? " active" : "")
                                        }
                                        onClick={closeMenu}
                                    >
                                        <UserRoundCog size={20} /> จัดการข้อมูลผู้ประเมิน
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink
                                        to={"/smarthosp2569/user/prov-approve/approve-infra"}
                                        end
                                        className={({ isActive }) =>
                                            "nav-link" + (isActive ? " active" : "")
                                        }
                                        onClick={closeMenu}
                                    >
                                        <BlocksIcon size={20} /> อนุมัติด้านโครงสร้าง
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink
                                        to={"/smarthosp2569/user/prov-approve/approve-management"}
                                        end
                                        className={({ isActive }) =>
                                            "nav-link" + (isActive ? " active" : "")
                                        }
                                        onClick={closeMenu}
                                    >
                                        <MonitorCog size={20} /> อนุมัติด้านบริหารจัดการ
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink
                                        to={"/smarthosp2569/user/prov-approve/approve-service"}
                                        end
                                        className={({ isActive }) =>
                                            "nav-link" + (isActive ? " active" : "")
                                        }
                                        onClick={closeMenu}
                                    >
                                        <HandPlatter size={20} /> อนุมัติด้านการบริการ
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink
                                        to={"/smarthosp2569/user/prov-approve/approve-people"}
                                        end
                                        className={({ isActive }) =>
                                            "nav-link" + (isActive ? " active" : "")
                                        }
                                        onClick={closeMenu}
                                    >
                                        <UserRoundCheck size={20} /> อนุมัติด้านบุคคลากร
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink
                                        to={"/smarthosp2569/user/prov-approve/report-prov"}
                                        end
                                        className={({ isActive }) =>
                                            "nav-link" + (isActive ? " active" : "")
                                        }
                                        onClick={closeMenu}
                                    >
                                        <FolderOpenIcon size={20} /> รายงานการประเมิน
                                    </NavLink>
                                </li>
                            </ul>
                            {/* ขยายพื้นที่ว่างให้ Profile ชิดขวา */}
                            <div className="ms-auto d-flex align-items-center">
                                {/* Dropdown Profile */}
                                <div className="dropdown">
                                    <button
                                        className="btn btn-light d-flex align-items-center gap-2 dropdown-toggle border rounded-pill px-3"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                    >
                                        <i className="bi bi-person-circle"></i>
                                        <span className="fw-semibold">{user?.name_th}</span>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end shadow">
                                        <li className="dropdown-header">
                                            <div className="fw-bold text-center">{user?.name_th}</div>
                                            <div className="text-muted small">ตำแหน่ง: {user?.position}</div>
                                            <div className="text-muted small">หน่วยงาน: {user?.hname_th}</div>
                                            <div className="text-muted small">สิทธิ์: {user?.role === 'admin' ? "ผู้ดูแลระบบ" : "ผู้ใช้ทั่วไป"}</div>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>

                                        <li>
                                            <button className="dropdown-item" onClick={handleLogout}>
                                                <i className="bi bi-door-closed"></i> Sign out
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Modal confirm logout */}
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

            </div>
        </>
    )
}

export default NavbarForProvince