import React, { useEffect } from 'react';
import System_logo from "../../assets/SmartHospital-Logo2.png";
import logo_moph from "../../assets/logo-MOPH.png";
import { NavLink } from "react-router";
import { Contact, LayoutDashboard, TableOfContents, UserPlus } from 'lucide-react';
import { Collapse } from 'bootstrap';

const NavbarDefault = () => {

    const closeMenu = () => {
        const menu = document.getElementById("navbarSupportedContent");
        if (menu && menu.classList.contains("show")) {
            new Collapse(menu).hide();
        }
    };

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
                                        <LayoutDashboard size={20} /> Dashboard
                                    </NavLink>
                                </li>
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
            </div>
        </>
    )
}

export default NavbarDefault
