import axios from './client';

// 預約訂單
export const getReservationAll = async () => {
    const response = await axios.get(`/api/reservations`);
    return response.data;
};

export const getReservations = async (id) => {
    const response = await axios.get(`/api/reservations/${id}`);
    return response.data;
};

export const addReservations = async (data) => {
    const response = await axios.post(`/api/reservations`, data);
    return response.data;
};

export const updateReservations = async (id, order) => {
    const response = await axios.patch(`/api/reservations/${id}`, order);
    return response.data;
};

export const deleteReservations = async (id) => {
    const response = await axios.delete(`/api/reservations/${id}`);
    return response.data;
};
