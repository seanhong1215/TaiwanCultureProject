import axios from './client';

// 獲取所有訂單
export const getOrderAll = async () => {
    const response = await axios.get(`/api/orders`);
    return response.data;
};

// 獲取指定用戶的訂單（避免撈全部再 client 過濾）
export const getOrdersByUser = async (userId) => {
    const response = await axios.get(`/api/orders?userId=${userId}`);
    return response.data;
};

export const getOrderPage = async (page, limit) => {
    const response = await axios.get(`/api/orders?_page=${page}&_limit=${limit}`);
    return response.data;
};

// 獲取單筆訂單
export const getOrders = async (orderId) => {
    const response = await axios.get(`/api/orders/${orderId}`);
    return response.data;
};

// 獲取單筆訂單
export const getOrderDetail = async (orderId) => {
    const response = await axios.get(`/api/orders/${orderId}`, {
        params: { _expand: "user" }, // 透過 params 傳遞 _expand
    });
    return response.data;
};

// 創建新訂單
export const createOrder = async (orderData) => {
    try {
        const now = new Date();
        // 生成訂單編號
        const response = await axios.get(`/api/orders?_sort=id&_order=desc&_limit=1`);
        const lastOrder = response.data[0];
        const lastSequence = lastOrder ? parseInt(lastOrder.id.slice(-4)) : 0;
        const newSequence = (lastSequence + 1).toString().padStart(4, '0');
        const dateString = now.getFullYear().toString().slice(-4) +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');

        const orderId = `ORD${dateString}${newSequence}`;
        const newOrder = {
        ...orderData,
        id: orderId,
        orderId: orderId,
        createdAt: now.toISOString().replace('T', ' ').substring(0, 19),
        };
        const createResponse = await axios.post(`/api/orders`, newOrder);
        return createResponse.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export const updateOrder = async (id, order) => {
    const response = await axios.patch(`/api/orders/${id}`, order);
    return response.data;
};

// 刪除新訂單
export const deleteOrder = async (orderId) => {
    const response = await axios.delete(`/api/orders/${orderId}`);
    return response.data;
};

// 獲取訂單相關票券
export const getTickets = async (id) => {
    const response = await axios.get(`/api/orders/${id}/tickets`);
    return response.data;
};

// 獲取訂單相關付款記錄
export const getPayments = async (id) => {
    const response = await axios.get(`/api/orders/${id}/payments`);
    return response.data;
};
