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