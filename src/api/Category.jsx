import axios from "axios";

// Create category
export const createCategory = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/createCategory`;
    return await axios.post(url, values,
        {
            headers:{
                Authorization: `Baerer ${token}`
            }
        }
    );
}

// Get list category
export const getListCategory = async (token) =>{
    const url = `${import.meta.env.VITE_APP_API}/getListCategory`;
    return await axios.get(url,
        {
            headers:{
                Authorization: `Baerer ${token}`
            }
        }
    );
}

// Get category by id
export const getCategoryById = async (token, id) =>{
    const url = `${import.meta.env.VITE_APP_API}/getCategoryById/${id}`;
    return await axios.get(url,
        {
            headers:{
                Authorization: `Baerer ${token}`
            }
        }
    );
}

// Update category
export const updateCategory = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/updateCategory`;
    return await axios.put(url, values,
        {
            headers:{
                Authorization: `Baerer ${token}`
            }
        }
    );
}

// Delete category
export const deleteCategory = async (token, id) =>{
    const url = `${import.meta.env.VITE_APP_API}/deleteCategory/${id}`;
    return await axios.delete(url,
        {
            headers:{
                Authorization: `Baerer ${token}`
            }
        }
    );
}