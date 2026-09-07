import axios from './client';

// 部落格管理
export const getJournalAll = async () => {
    const response = await axios.get(`/api/journal`);
    return response.data;
};

export const getJournals = async (id) => {
    const response = await axios.get(`/api/journal/${id}`);
    return response.data;
};

export const getJournalPage = async (page, limit) => {
    const response = await axios.get(`/api/journal?_page=${page}&_limit=${limit}`);
    return response.data;
};

export const createdJournal = async (data) => {
    const response = await axios.post(`/api/journal`, data);
    return response.data;
};

export const updatedJournal = async (id, data) => {
    const response = await axios.put(`/api/journal/${id}`, data);
    return response.data;
};

export const deletedJournal = async (id) => {
    const response = await axios.delete(`/api/journal/${id}`);
    return response.data;
};
