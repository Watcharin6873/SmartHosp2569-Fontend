import React from 'react';
import NavbarAdmin from '../components/navbars/NavbarAdmin';
import NavbarForAdmin from '../components/navbars/NavbarForAdmin';
import { Outlet } from 'react-router';

const LayoutAdmin = () => {
    return (
        <>
            <div className='container-fluid p-0'>
                {/* Navbar */}
                <NavbarForAdmin />

                {/* Main */}
                <main className='container' style={{marginTop: "70px"}}>
                    <Outlet/>
                </main>
            </div>
        </>
    )
}

export default LayoutAdmin
