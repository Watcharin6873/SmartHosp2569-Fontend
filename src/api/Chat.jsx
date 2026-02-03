import axios from 'axios';

// Get Chat room
export const getMyChatRoom = async (token) =>{
    const url = `${import.meta.env.VITE_APP_API}/getMyChatRoom`;
    return await axios.get(url, {
        headers: {
            Authorization: `Baerer ${token}`
        }
    })
}

// Get messages
export const getMessages = async (token, roomId) => {
    const url = `${import.meta.env.VITE_APP_API}/getMessages/${roomId}`;
    return await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

// Sent messages
export const sendMessages = async (token, data) => {
    const url = `${import.meta.env.VITE_APP_API}/sendMessages`;
    return await axios.post(url, data, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}


// Approve chat
export const getApproveChat = async (token, subQuestionId, hospitalCode) =>{
    const url = `${import.meta.env.VITE_APP_API}/getApproveChat?subQuestionId=${subQuestionId}&hospitalCode=${hospitalCode}`;
    return await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

// Save approve chat
export const saveApproveChat = async (token, chatValues) =>{
    const url = `${import.meta.env.VITE_APP_API}/saveApproveChat`;
    return await axios.post(url, chatValues,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}