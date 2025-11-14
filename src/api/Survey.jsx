import axios from "axios";


// Create socre survey
export const createScoreSurvey = async (token,values) =>{
    const url = `${import.meta.env.VITE_APP_API}/createSurveyScore`;
    return await axios.post(url, values,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Get list Score_survey
export const getListScoreSurvey = async () =>{
    const url = `${import.meta.env.VITE_APP_API}/getListSurveyScore`;
    return await axios.get(url);
}

// Save survey form
export const saveSurveyForm = async (values) =>{
    const url = `${import.meta.env.VITE_APP_API}/saveSurveyForm`;
    return await axios.post(url, values);
}

// Save survey comment
export const saveSurveyComment = async (values) =>{
    const url = `${import.meta.env.VITE_APP_API}/saveSurveyComment`;
    return await axios.post(url, values);
}

// Get survey by id
export const getSurveyFormById = async (token, id) =>{
    const url = `${import.meta.env.VITE_APP_API}/getSurveyFormById/${id}`;
    return await axios.get(url,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Update score survey
export const updateScoreSurvey = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/updateScoreSurvey`;
    return await axios.put(url, values,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}