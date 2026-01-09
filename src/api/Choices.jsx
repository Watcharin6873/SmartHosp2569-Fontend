import axios from 'axios';

// Create choice
export const createChoice = async (token, values) => {
    const url = `${import.meta.env.VITE_APP_API}/createChoice`;
    return await axios.post(url, values, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Get list of choices
export const getListChoices = async (token) => {
    const url = `${import.meta.env.VITE_APP_API}/getListChoices`;
    return await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Get list choices by category id
export const getListChoicesByCatId = async (token, category_id) => {
    const url = `${import.meta.env.VITE_APP_API}/getListChoicesByCatId?category_id=${category_id}`;
    return await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Get list choices by subquestion id
export const getListChoicesBySubQuestionId = async (token, sub_question_id) => {
    const url = `${import.meta.env.VITE_APP_API}/getListChoicesBySubQuestionId/${sub_question_id}`;
    return await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Get choice by ID
export const getChoiceById = async (token, id) => {
    const url = `${import.meta.env.VITE_APP_API}/getChoiceById/${id}`;
    return await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Update choice
export const updateChoice = async (token, values) => {
    const url = `${import.meta.env.VITE_APP_API}/updateChoice`;
    return await axios.put(url, values, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

// Delete choice
export const deleteChoice = async (token, id) => {
    const url = `${import.meta.env.VITE_APP_API}/deleteChoice/${id}`;
    return await axios.delete(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};