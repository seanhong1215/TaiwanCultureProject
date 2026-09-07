import axios from './client';

// 收藏列表
export const getFavoriteAll = async () => {
    const response = await axios.get(`/api/favorites`);
    return response.data;
};

export const getFavorites = async (userId) => {
    const response = await axios.get(`/api/favorites?userId=${userId}`);
    return response.data;
};

export const addFavorites = async (data) => {
    const response = await axios.post(`/api/favorites`, data);
    return response.data;
};

export const deleteFavorites = async (id) => {
    const response = await axios.delete(`/api/favorites/${id}`);
    return response.data;
};
