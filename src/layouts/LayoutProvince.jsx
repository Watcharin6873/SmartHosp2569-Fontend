import { useEffect, useState } from 'react'
import NavbarForProvince from '../components/navbars/NavbarForProvince';
import { Outlet } from 'react-router';
import FloatingChat from '../components/user/Chat/FloatingChat';

const LayoutProvince = () => {


  return (
    <>
        <div className='container-fluid p-0'>
            <NavbarForProvince />

            {/* Main */}
            <main className='container' style={{marginTop: '70px'}}>
                <Outlet />
            </main>
            <FloatingChat />
        </div>
    </>
  )
}

export default LayoutProvince