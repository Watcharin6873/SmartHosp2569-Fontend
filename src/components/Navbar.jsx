import React from "react";
import System_logo from "../assets/SmartHospital-Logo2.png";
import {
  Contact,
  LayoutDashboard,
  ListCheck,
  LogIn,
  TableOfContents,
  UserPlus,
} from "lucide-react";
import { NavLink } from "react-router";

const Navbar = () => {
  // ฟังก์ชันปิด offcanvas โดยใช้ Bootstrap API
  const handleClose = () => {
    const offcanvasEl = document.getElementById("offcanvasNavbar");
    const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
    if (bsOffcanvas) {
      bsOffcanvas.hide();
    }
  };

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
                      to={"/smarthosp2569/"}
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
                      to={"/smarthosp2569/register"}
                      className={({ isActive }) =>
                        "nav-link" + (isActive ? " active" : "")
                      }
                      onClick={handleClose}
                    >
                      <UserPlus /> ลงทะเบียนใช้ระบบ
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      to={"/smarthosp2569/login"}
                      className={({ isActive }) =>
                        "nav-link" + (isActive ? " active" : "")
                      }
                      onClick={handleClose}
                    >
                      <LogIn /> ล็อกอินเข้าระบบ
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      to={"/smarthosp2569/user-manual"}
                      className={({ isActive }) =>
                        "nav-link" + (isActive ? " active" : "")
                      }
                      onClick={handleClose}
                    >
                      <TableOfContents /> คู่มือการใช้งาน
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      to={"/smarthosp2569/contact-us"}
                      className={({ isActive }) =>
                        "nav-link" + (isActive ? " active" : "")
                      }
                      onClick={handleClose}
                    >
                      <Contact /> ติดต่อเรา
                    </NavLink>
                  </li>
                  {/* <li className="nav-item">
                    <NavLink
                      to={"/smarthosp2569/survey2"}
                      className={({ isActive }) =>
                        "nav-link" + (isActive ? " active" : "")
                      }
                      onClick={handleClose}
                    >
                      <ListCheck /> แบบประเมินความพึงพอใจ
                    </NavLink>
                  </li> */}
                </ul>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
