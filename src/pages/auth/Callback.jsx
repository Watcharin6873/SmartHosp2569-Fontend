import axios from 'axios';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { exchangeToken } from '../../api/Auth';

const Callback = () => {

    const navigate = useNavigate();
    const myParam = useLocation().search;
    const code = new URLSearchParams(myParam).get("code");
    const scope = new URLSearchParams(myParam).get("scope");
    const myState = new URLSearchParams(myParam).get("state");



    useEffect(() => {

        if (code) {
            sendExchangeToken();
        }

    }, [code]);


    const sendExchangeToken = async () => {
        try {
            const values = {
                code: code,
                env: import.meta.env.VITE_ENV
            }
            const res = await exchangeToken(values);
            const data = res.data;

            // ✅ ทำให้ clone ได้แน่นอน
            const safeData = JSON.parse(JSON.stringify(data));
            if (myState === 'signin') {
                navigate('/smarthosp2569/page-auth', { state: { safeData, myState } })
            } else if (myState === 'register') {
                navigate('/smarthosp2569/page-auth', { state: { safeData, myState } })
            } else {
                navigate('/smarthosp2569/')
            }

            

        } catch (err) {
            console.error(err);
            navigate('/smarthosp2569/');
        }
    }


    return (
        <div className='text-center'>Process OAuth...</div>
    )
}

export default Callback
