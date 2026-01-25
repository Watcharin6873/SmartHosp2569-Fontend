import React, { useEffect } from 'react';
import NavbarForResponder from '../components/navbars/NavbarForResponder';
import { Outlet } from 'react-router';
import useChatStore from '../store/chatStore';
import FloatingChat from '../components/user/Chat/FloatingChat';

const LayoutResponder = () => {

    const pollMessages = useChatStore(s => s.pollMessages);

    useEffect(() => {
        const interval = setInterval(() => {
            pollMessages();
        }, 5000)

        return () => clearInterval(interval);
    }, [])

  return (
    <>
            <div className='container-fluid p-0'>
                {/* Navbar */}
                <NavbarForResponder />

                {/* Main */}
                <main className='container' style={{marginTop: "70px"}}>
                    <Outlet/>
                </main>
                <FloatingChat />
            </div>
        </>
  )
}

export default LayoutResponder