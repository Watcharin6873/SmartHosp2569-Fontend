import axios from 'axios';

// Exchange
export const exchangeToken = async (values) => {
    const url = `${import.meta.env.VITE_APP_API}/exchangeToken`
    return await axios.post(url, { values });
}
// Login system
export const loginSmartHosp = async (values) => {
    const res = await axios.post(import.meta.env.VITE_APP_API + `/loginSmartHosp`, values)
    return res;
}

// Current user
export const currentUser = async (token) => {
    return await axios.post(import.meta.env.VITE_APP_API + `/currentUser`,
        {},
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        }
    );
}

// Current admin
export const currentAdmin = async (token) => {
    return await axios.post(import.meta.env.VITE_APP_API + `/currentAdmin`,
        {},
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        }
    );
}

// Signout 
export const signout = async (values) => {
    const url = `${import.meta.env.VITE_APP_API}/signout`;
    return await axios.post(url, values);
}