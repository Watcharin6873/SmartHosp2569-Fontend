import React from "react";
import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
const Layout = () => {
  

  return (
    <>
    <div className="container-fluid p-0">
      {/* Navbar */}
      <Navbar />

      {/* Main */}
      <main className="container" style={{marginTop: "70px"}}>
        <Outlet />
      </main>
    </div>
    </>
  );
};

export default Layout;
