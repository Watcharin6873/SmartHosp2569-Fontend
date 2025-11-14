import axios from "axios";

// Create question
export const createQuestion = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/createQuestion`;
    return await axios.post(url,values,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Get list question
export const getListQuestion = async () =>{
    const url = `${import.meta.env.VITE_APP_API}/getListQuestion`;
    return await axios.get(url);
}

// Get question by id
export const getQuestionById = async (token, id) =>{
    const url = `${import.meta.env.VITE_APP_API}/getQuestionById/${id}`;
    return await axios.get(url,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Update question
export const updateQuestion = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/updateQuestion`;
    return await axios.put(url, values,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Delete question
export const deleteQuestion = async (token, id) =>{
    const url = `${import.meta.env.VITE_APP_API}/deleteQuestion/${id}`;
    return await axios.get(url,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}