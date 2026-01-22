import axios from 'axios';

// Report all category for home dashboard
export const getResultScoreAllCat = async () => {
    const url = `${import.meta.env.VITE_APP_API}/getResultScoreAllCat`;
    return axios.get(url, {
        headers: {
            "Content-Type": "application/json"
        }
    });
};

// Get all result of evaluation report
export const getReportAllCat = async (token) => {
    const url = `${import.meta.env.VITE_APP_API}/getReportAllCat`;
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Get all result of evaluation by hcode9
export const getReportAllCatByHcode9 = async (token, hcode9) => {
    const url = `${import.meta.env.VITE_APP_API}/getReportAllCatByHcode9?hcode9=${hcode9}`;
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Get cyber level for dashboard
export const getCyberLevelForDashboard = async () =>{
    const url = `${import.meta.env.VITE_APP_API}/getCyberLevelForDashboard`;
    return axios.get(url, {
        headers: {
            "Content-Type": "application/json"
        }
    });
};

// Get cyber level
export const getCyberLevel = async (token) =>{
    const url = `${import.meta.env.VITE_APP_API}/getCyberLevel`;
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Get cyber level by hcode9
export const getCyberLevelByHosp = async (token, hcode9) => {
    const url = `${import.meta.env.VITE_APP_API}/getCyberLevelByHosp?hcode9=${hcode9}`;
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};