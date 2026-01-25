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