import React, { useEffect, useState } from 'react';
import useGlobalStore from '../store/global-store';
import LoadingToRedirect from './LoadingToRedirect';
import { currentUser } from '../api/Auth';

const ProtectRouteUser = ({ element }) => {
  const token = useGlobalStore((state) => state.token);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!token) {
      setOk(false);
      return;
    }

    currentUser(token)
      .then(res => {
        // backend ผ่าน auth + enabled + role แล้ว
        if (res.data?.user?.role === 'user') {
          setOk(true);
        } else {
          setOk(false);
        }
      })
      .catch(err => {
        console.log(err);
        setOk(false);
      });
  }, [token]);

  return ok ? element : <LoadingToRedirect />;
};

export default ProtectRouteUser;

