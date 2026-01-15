import React from 'react'
import NavbarForProvince from '../components/navbars/NavbarForProvince';
import { Outlet } from 'react-router';

const LayoutProvince = () => {
  return (
    <>
        <div className='container-fluid p-0'>
            <NavbarForProvince />

            {/* Main */}
            <main className='container' style={{marginTop: '70px'}}>
                <Outlet />
            </main>
        </div>
    </>
  )
}

export default LayoutProvince