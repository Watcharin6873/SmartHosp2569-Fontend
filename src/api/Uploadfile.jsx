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

// Get evidences file 
export const getEvidenceFiles = async (token, values) =>{
    const url = `${import.meta.env.VITE_APP_API}/getEvidenceFiles`;
    return await axios.post(url, values, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });
}