import React from 'react';
import { Outlet } from "react-router";
import NavbarSurvey from '../components/NavbarSurvey';

const LayoutSurvey = () => {
  return (
    <>
    <div className="container-fluid p-0">
      {/* Navbar */}
      <NavbarSurvey />

      {/* Main */}
      <main className="container" style={{marginTop: "90px"}}>
        <Outlet />
      </main>
    </div>
    </>
  )
}

export default LayoutSurvey
