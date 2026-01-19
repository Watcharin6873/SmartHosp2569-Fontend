import axios from 'axios';


// Get approve evaluation
export const getProvApproveEvaluation = async (token) =>{
    const url = `${import.meta.env.VITE_APP_API}/getProvApproveEvaluation`;
    return await axios.get(url, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    })
}

// Get prov and zone approve
export const getProvAndZoneApprove = async (token) =>{
    const url = `${import.meta.env.VITE_APP_API}/getProvAndZoneApprove`;
    return await axios.get(url, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    })
}


// Prov approve evaluation
export const provAproveEvaluation = async (token, payload) =>{
    const url = `${import.meta.env.VITE_APP_API}/provApproveEvaluation`;
    return await axios.post(url, payload, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    })
}

// Prov update approve evaluation
export const provUpdateApproveEvaluation = async (token, payload) =>{
    const url = `${import.meta.env.VITE_APP_API}/provUpdateApproveEvaluation`;
    return await axios.post(url, payload, {
        headers : {
            Authorization: `Bearer ${token}`
        }
    })
}