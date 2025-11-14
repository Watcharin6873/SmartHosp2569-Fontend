import React, { useEffect, useState } from 'react';
import useGlobalStore from '../store/global-store';
import LoadingToRedirect from './LoadingToRedirect';
import { currentUser } from '../api/Auth';

const ProtectRouteUser = ({element}) => {

    const user = useGlobalStore((state) => state.user);
    const token = useGlobalStore((state) => state.token);
    const [ok, setOk] = useState(false);

    useEffect(()=>{
        if(user && token){
            //Send to back
            currentUser(token)
                .then(res =>{
                    setOk(true);
                })
                .catch(err=>{
                    console.log(err)
                    setOk(false);
                })
        }
    }, []);


  return ok ? element : <LoadingToRedirect />
}

export default ProtectRouteUser
