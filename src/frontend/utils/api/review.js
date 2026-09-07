import axios from './client';

// 評價管理
export const getReviewAll = async () => {
    const response = await axios.get(`/api/reviews`);
    return response.data;
};

export const getReviewPage = async (page, limit) => {
    const response = await axios.get(`/api/reviews?_page=${page}&_limit=${limit}`);
    return response.data;
};

export const addReviews = async (data) => {
    const response = await axios.post(`/api/reviews`, data);
    return response.data;
};

export const updateReviews = async (id, data) => {
    const response = await axios.put(`/api/reviews/${id}`, data);
    return response.data;
};

export const deleteReviews = async (id) => {
    const response = await axios.delete(`/api/reviews/${id}`);
    return response.data;
};

export const getReviewsActivityId = async (id) => {
    const response = await axios.get(`/api/reviews?activityId=${id}`);
    return response.data;
};

export const getReviewsActivityIdPage = async (id, page = 1, limit = 2) => {
    const response = await axios.get(`/api/reviews?activityId=${id}&_page=${page}&_limit=${limit}`);
    return response.data;
};
