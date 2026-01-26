import React from 'react'
import NavbarForZone from '../components/navbars/NavbarForZone';
import { Outlet } from 'react-router';
import FloatingChat from '../components/user/Chat/FloatingChat';

const LayoutZone = () => {
    return (
        <>
            <div className='container-fluid p-0'>
                <NavbarForZone />

                {/* Main */}
                <main className='container' style={{ marginTop: '70px' }}>
                    <Outlet />
                </main>
                <FloatingChat />
            </div>
        </>
    )
}

export default LayoutZone