import axios from "axios";

// Create Evaluate
export const createEvaluation = async (token, payload) =>{
    const url = `${import.meta.env.VITE_APP_API}/createEvaluation`;
    return await axios.post(url, payload,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Get draft evaluation
export const getDraftEvaluation = async (token, question_id, hcode9) =>{
    const url = `${import.meta.env.VITE_APP_API}/getDraftEvaluation?question_id=${question_id}&hospital_code=${hcode9}`;
    return await axios.get(url,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Get evaluation by cat id 
export const getEvaluationByCatId = async (token, category_id, hcode9) =>{
    const url = `${import.meta.env.VITE_APP_API}/getEvaluationByCatId?category_id=${category_id}&hospital_code=${hcode9}`;
    return await axios.get(url,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Get list hospitals in evaluation
export const getListHospitalsInEvaluation = async (token) =>{
    const url = `${import.meta.env.VITE_APP_API}/getListHospitalsInEvaluation`;
    return await axios.get(url,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Get list hospitals in evaluation
export const getListHospitalsInEvaluation2 = async (token) =>{
    const url = `${import.meta.env.VITE_APP_API}/getListHospitalsInEvaluation2`;
    return await axios.get(url,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Request for edit evaluate
export const requestForEditEvaluation = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/requestForEditEvaluation`;
    return await axios.put(url, values, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}


export const getScoreHospitalForSubQuestion = async (token, hospital_code) =>{
    const url = `${import.meta.env.VITE_APP_API}/getScoreHospitalForSubQuestion?hospital_code=${hospital_code}`;
    return await axios.get(url,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

export const getScoreHospitalForSubQuestion2 = async (token, hospital_code) =>{
    const url = `${import.meta.env.VITE_APP_API}/getScoreHospitalForSubQuestion2?hospital_code=${hospital_code}`;
    return await axios.get(url,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}