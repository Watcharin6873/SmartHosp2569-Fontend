import axios from 'axios'

// Uplaod evidence file
export const uploadEvidenceFile = async (token, formData) =>{
    const url = `${import.meta.env.VITE_APP_API}/uploadEvidenceFile`;
    return await axios.post(url, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": "Bearer " + token
        }
    });
}

// Get list evidence 
export const getListEvidence = async (token) =>{
    const url = `${import.meta.env.VITE_APP_API}/getListEvidence`;
    return await axios.get(url,
        {
            headers:{
                "Authorization": `Bearer ${token}`
            }
        }
    );
}

// Get evidences file 
export const getEvidenceFiles = async (token, hcode9, category_id) =>{
    const url = `${import.meta.env.VITE_APP_API}/getEvidenceFiles?hcode9=${hcode9}&category_id=${category_id}`;
    return await axios.get(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
}

// Remove evidence file by id
export const removeEvidenceFileById = async (token, id) =>{
    const url = `${import.meta.env.VITE_APP_API}/removeEvidenceFile/${id}`;
    return await axios.delete(url, {
        headers:{
            "Authorization": `Bearer ${token}`
        }
    });
}

// Upload evidence_sub_id file
export const uploadEvidenceBySubId = async (token, formData) =>{
    const url = `${import.meta.env.VITE_APP_API}/uploadEvidenceBySubId`;
    return await axios.post(url,formData, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
}

// Get evidence_sub_id file by hcode 
export const getListEvidenceByHcode9 = async (token, hcode9) => {
    const url = `${import.meta.env.VITE_APP_API}/getListEvidenceByHcode9?hcode9=${hcode9}`;
    return await axios.get(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
}

// Remove evidence_sub_id file by
export const removeEvidenceSubIdById = async (token, id) => {
    const url = `${import.meta.env.VITE_APP_API}/removeEvidenceSubIdById/${id}`;
    return await axios.delete(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
}