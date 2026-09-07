import axios from './client';

// 個人資料管理
export const getUserDetail = async (userId) => {
    const response = await axios.get(`/api/profiles`, {
        params: { userId: `${userId}` , _expand: "user" }, // 透過 params 傳遞 _expand
    });
    return response.data.length ? response.data[0] : null; // 取第一筆資料
};

export const userProfiles = async (data) => {
    const response = await axios.post(`/api/profiles`, data);
    return response.data;
};

export const updateUsers = async (id, data) => {
    const response = await axios.put(`/api/profiles/${id}`, data);
    return response.data;
};

export const modifyUsers = async (id, data) => {
    const response = await axios.patch(`/api/profiles/${id}`, data);
    return response.data;
};
