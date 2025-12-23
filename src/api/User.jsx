import axios from 'axios';

// Save register
export const saveRegister = async (values) =>{
    const res = await axios.post(import.meta.env.VITE_APP_API + `/saveRegister`, values)
    return res;
}

// Get list user for check status
export const getListUserForCheck = async (values) =>{
    const res = await axios.post(import.meta.env.VITE_APP_API + `/checkStatusAccount`, values)
    return res;
}

// Get list users
export const getListUsers = async (token) =>{
    const url = `${import.meta.env.VITE_APP_API}/getListUsers`;
    return axios.get(url,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Change user type
export const changeUserType = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/changeUserType`;
    return axios.put(url, values,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Change user role
export const changeUserRole = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/changeUserRole`;
    return axios.put(url, values,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Change user status
export const changeUserStatus = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/changeUserStatus`;
    return axios.put(url, values,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}