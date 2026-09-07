import axios from './client';

// 活動管理
export const getActivityAll = async () => {
    const response = await axios.get(`/api/activity`);
    return response.data;
};

export const getActivityPage = async (page, limit) => {
    const response = await axios.get(`/api/activity?_page=${page}&_limit=${limit}`);
    return response.data;
};

export const getActivitys = async (id) => {
    const response = await axios.get(`/api/activity/${id}`);
    return response.data;
};

export const addActivitys = async (data) => {
    const response = await axios.post(`/api/activity`, data);
    return response.data;
};

export const updatedActivitys = async (id, data) => {
    const response = await axios.patch(`/api/activity/${id}`, data);
    return response.data;
};

export const deleteActivitys = async (id) => {
    const response = await axios.delete(`/api/activity/${id}`);
    return response.data;
};
