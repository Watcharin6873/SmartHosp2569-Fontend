import React from "react";
import { Outlet } from "react-router";
import NavbarDefault from "../components/navbars/NavbarDefault";
const Layout = () => {
  

  return (
    <>
    <div className="container-fluid p-0">
      {/* Navbar */}
      <NavbarDefault />

      {/* Main */}
      <main className="container" style={{marginTop: "70px"}}>
        <Outlet />
      </main>
    </div>
    </>
  );
};

export default Layout;
