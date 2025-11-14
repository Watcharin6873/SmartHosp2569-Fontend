import axios from "axios";

// Create topic
export const createTopic = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/createTopic`;
    return await axios.post(url, values, 
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Get list topic
export const getListTopic = async (token) =>{
    const url = `${import.meta.env.VITE_APP_API}/getListTopic`;
    return await axios.get(url,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Get topic by id
export const getTopicById = async (token, id) =>{
    const url = `${import.meta.env.VITE_APP_API}/getTopicById/${id}`;
    return await axios.get(url,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Update topic
export const updateTopic = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/updateTopic`;
    return await axios.put(url, values,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Update topic
export const changeStatusTopic = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/changeStatusTopic`;
    return await axios.put(url, values,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}

// Delete topic
export const deleteTopic = async (token, id) =>{
    const url = `${import.meta.env.VITE_APP_API}/deleteTopic/${id}`;
    return await axios.delete(url,
        {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }
    );
}