import axios from 'axios';

export const getListHospitals = async (token) =>{
    const url = `${import.meta.env.VITE_APP_API}/getListHospitals`;
    return await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export const getListHospForDashboard = async () =>{
    const url = `${import.meta.env.VITE_APP_API}/getListHospForDashboard`;
    return await axios.get(url, {
        headers: {
            "Content-Type": "application/json"
        }
    });
}