import React from 'react';
import NavbarAdmin from '../components/NavbarAdmin';
import { Outlet } from 'react-router';

const LayoutAdmin = () => {
    return (
        <>
            <div className='container-fluid p-0'>
                {/* Navbar */}
                <NavbarAdmin />

                {/* Main */}
                <main className='container' style={{marginTop: "70px"}}>
                    <Outlet/>
                </main>
            </div>
        </>
    )
}

export default LayoutAdmin
