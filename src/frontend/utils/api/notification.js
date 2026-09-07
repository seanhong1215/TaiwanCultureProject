import axios from './client';

// 通知管理
export const getNotifications = async () => {
    const response = await axios.get("/api/notifications");
    return response.data;
};

// 原本誤用 axios.get 送 body，通知其實從未被建立
export const addNotifications = async (data) => {
    const response = await axios.post("/api/notifications", data);
    return response.data;
};
