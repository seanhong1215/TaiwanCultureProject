import axios from 'axios';
import Swal from 'sweetalert2';

axios.defaults.baseURL = process.env.NODE_ENV === 'production'
 ? 'https://taiwan-culture-project.onrender.com'
 : 'http://localhost:3002'


 // 註冊
export const register = async (data) => {
    const response = await axios.post(`/api/register`, {
        email: data.email,
        password: data.password,
        name: data.name,
        role: "Member",
        avatar: "https://mighty.tools/mockmind-api/content/human/119.jpg"
    });
    
    return response.data; 
};

// 登入
export const login = async (data) => {
const response = await axios.post(`/api/signin`, data);
if (response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken); // 存 Token
    // localStorage.setItem('user', JSON.stringify(response.data.user)); // 存 User
}
return response.data; 
};


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


// 部落格管理

export const getJournalAll = async () => {
    const response = await axios.get(`/api/journal`);
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


export const deleteFavorites  = async (id) => {
    const response = await axios.delete(`/api/favorites/${id}`);
    return response.data;
};


// 評價管理
export const getReviewAll = async () => {
    const response = await axios.get(`/api/reviews`);
    return response.data; 
};

export const getReviewPage = async (page, limit) => {
    const response = await axios.get(`/api/reviews?_page=${page}&_limit=${limit}`);
    return response.data; 
};

export const getReviews = async (id) => {
    const response = await axios.get(`/api/reviews/${id}`);
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
    const response = await axios.patch (`/api/reservations/${id}`, order);
    return response.data;
};

export const deleteReservations = async (id) => {
    const response = await axios.delete(`/api/reservations/${id}`);
    return response.data;
};


// 獲取所有訂單
export const getOrderAll = async () => {
    const response = await axios.get(`/api/orders`);
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
        // timeSlot: timeSlot
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

// 圖片上傳
export const uploadImageToCloudinary = async(file) => {
    try {

        // 1. 獲取 Cloudinary 簽名
        const signResponse = await axios.get(`/get-signature`);
        const { signature, timestamp, apiKey } = signResponse.data;

        // 2. 準備 FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        formData.append('api_key', apiKey);
        formData.append('upload_preset', 'bennyhong');
        formData.append('folder', 'uploads');  // 設定 asset_folder 為 'uploads'

        // 3. 上傳到 Cloudinary
        const cloudinaryResponse = await axios.post(`/upload-to-cloudinary`, formData);

        const imageData = cloudinaryResponse.data;
        const imageUrl = imageData.secure_url;

        if (!imageUrl) {
            Swal.fire({ title: "無法取得圖片 URL", icon: "warning" });
            console.log('無法取得圖片 URL');
        return;
        }
        return imageUrl
    } catch (error) {
        Swal.fire({ title: '上傳圖片失敗: ' + error.message, icon: "error" });
    }
}


// 取得用戶簽到資料
export const getUserStats = async (userId) => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`api/userStats?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data[0]; // 取第一筆
    } catch (error) {
        console.error('獲取簽到數據失敗', error);
        throw error;
    }
};


// 執行簽到
export const signIn = async (userId, data) => {
    try {
        const token = localStorage.getItem('token');
        const today = new Date().toISOString().split('T')[0]; // 取得今天日期 (YYYY-MM-DD)
        
        // 先檢查今天是否已簽到
        const checkRes = await axios.get(`api/signIns?userId=${userId}&date=${today}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (checkRes.data.length > 0) {
            throw new Error('今天已簽到');
        }

        // 更新簽到資料到 localStorage
        checkRes.data.push({
            userId: userId,
            date: today,
            signInTime: new Date().toISOString()
        });

        // 儲存簽到資料到 localStorage
        localStorage.setItem('signInData', JSON.stringify(checkRes.data));

        return { success: true, message: '簽到成功' };

    } catch (error) {
        console.error('簽到失敗', error);
        throw error;
    }
};

// 票券
export const getVouchers = async () => {
    const response = await axios.get(`/api/vouchers`);
    return response.data; 
};

// 更新票券
export const updatedVouchers = async (ticket) => {
    const response = await axios.put(`/api/vouchers/${ticket.id}`, ticket);
    return response.data; 
};

// 獎勵
export const getRewards = async () => {
    const response = await axios.get(`/api/rewards`);
    return response.data; 
};

// 更新票獎勵
export const updatedRewards = async (data) => {
    const response = await axios.put(`/api/rewards`, data);
    return response.data; 
};





//用戶管理
export const getMemberAll = async () => {
    const response = await axios.get(`/api/users`);
    return response.data; 
};

export const getMemberPage = async (page, limit) => {
    const response = await axios.get(`/api/users?_page=${page}&_limit=${limit}`);
    return response.data; 
};

export const getMembers = async (id) => {
    const response = await axios.get(`/api/users/${id}`);
    return response.data; 
};

export const updatedMembers = async (id, data) => {
    const response = await axios.patch(`/api/users/${id}`, data);
    return response.data; 
};

