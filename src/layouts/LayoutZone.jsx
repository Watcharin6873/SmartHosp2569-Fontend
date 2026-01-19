import React from 'react'
import NavbarForZone from '../components/navbars/NavbarForZone';
import { Outlet } from 'react-router';

const LayoutZone = () => {
    return (
        <>
            <div className='container-fluid p-0'>
                <NavbarForZone />

                {/* Main */}
                <main className='container' style={{marginTop: '70px'}}>
                    <Outlet/>
                </main>
            </div>
        </>
    )
}

export default LayoutZone