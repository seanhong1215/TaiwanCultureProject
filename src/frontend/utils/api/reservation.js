import axios from './client';

// 預約訂單
export const getReservations = async (id) => {
    const response = await axios.get(`/api/reservations/${id}`);
    return response.data;
};

export const addReservations = async (data) => {
    const response = await axios.post(`/api/reservations`, data);
    return response.data;
};
