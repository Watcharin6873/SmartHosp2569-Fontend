import axios from 'axios';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { exchangeToken } from '../../api/Auth';

const Callback = () => {

    const navigate = useNavigate();
    const myParam = useLocation().search;
    const code = new URLSearchParams(myParam).get("code");
    const myState = new URLSearchParams(myParam).get("state");

    console.log('State: ', code)

    useEffect(() => {

        if (code) {
            axios.post(import.meta.env.VITE_APP_API + `/exchangeToken`, { 
                code,
                env: import.meta.env.VITE_ENV
            })
                .then(res => {
                    const data = res.data;

                    // ✅ ทำให้ clone ได้แน่นอน
                    const safeData = JSON.parse(JSON.stringify(data));
                    if (myState === 'login') {
                        navigate('/smarthosp2569/login', { state: safeData })
                    } else if (myState === 'register') {
                        navigate('/smarthosp2569/register', { state: safeData })
                    } else {
                        navigate('/')
                    }
                })
                .catch((err) => {
                    console.error(err);
                    navigate('/');
                });
        }
    }, []);


    return (
        <div className='text-center'>Process OAuth...</div>
    )
}

export default Callback
