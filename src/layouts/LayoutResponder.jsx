import React from 'react';
import NavbarForResponder from '../components/navbars/NavbarForResponder';
import { Outlet } from 'react-router';

const LayoutResponder = () => {
  return (
    <>
            <div className='container-fluid p-0'>
                {/* Navbar */}
                <NavbarForResponder />

                {/* Main */}
                <main className='container' style={{marginTop: "70px"}}>
                    <Outlet/>
                </main>
            </div>
        </>
  )
}

export default LayoutResponder