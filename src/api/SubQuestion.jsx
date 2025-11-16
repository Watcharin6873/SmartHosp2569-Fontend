import axios from "axios";


// Create
export const createSubQuestion = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/createSubQuestion`;
    return await axios.post(url, values,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Get List
export const getListSubQuestion = async (token) =>{
    const url = `${import.meta.env.VITE_APP_API}/getListSubQuestion`;
    return await axios.get(url,{
        headers:{
            Authorization: `Bearer ${token}`
        }
    });
}

// Get by id
export const getSubQuestionById = async (token, id) =>{
    const url = `${import.meta.env.VITE_APP_API}/getSubQuestionById/${id}`;
    return await axios.get(url,{
        headers:{
            Authorization: `Bearer ${token}`
        }
    });
}

// Update
export const updateSubQuestion = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/updateSubQuestion`;
    return await axios.put(url, values,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Delete
export const deleteSubQuestion = async (token, id) =>{
    const url = `${import.meta.env.VITE_APP_API}/deleteSubQuestion/${id}`;
    return await axios.delete(url,{
        headers:{
            Authorization: `Bearer ${token}`
        }
    });
}