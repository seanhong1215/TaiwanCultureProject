import axios from 'axios';
import Swal from 'sweetalert2';

// 使用 Vite 的 import.meta.env 而非 process.env：瀏覽器沒有 process，
// 且 API 位址改由環境變數注入，換部署環境不必改程式碼。
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.PROD ? 'https://taiwan-culture-project.onrender.com' : 'http://localhost:3001');

// 自動帶入 token（前台用 token，後台用 admin_token）
axios.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin_token');
  const memberToken = localStorage.getItem('token');
  const token = adminToken || memberToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 後端回 401 代表 token 過期或無效（社群登入的 Firebase ID Token 約 1 小時到期）。
// 清掉本地憑證並導回對應的登入入口，避免使用者卡在「看起來已登入但每個操作都失敗」的狀態。
const MEMBER_KEYS = ['token', 'userId', 'userName', 'userEmail', 'userAvatar', 'userRole'];
const ADMIN_KEYS = ['admin_token', 'admin_userId', 'admin_userName', 'admin_userEmail', 'admin_userAvatar', 'admin_userRole'];

const clearSession = (keys) => keys.forEach((key) => localStorage.removeItem(key));

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminArea = window.location.hash.startsWith('#/admin');
      if (isAdminArea) {
        clearSession(ADMIN_KEYS);
        window.location.hash = '#/admin/login';
      } else {
        clearSession(MEMBER_KEYS);
        window.location.hash = '#/';
      }
    }
    return Promise.reject(error);
  }
);


 // 註冊
export const register = async (data) => {
    const response = await axios.post(`/api/register`, {
        email: data.email,
        password: data.password,
        name: data.name,
        role: "Member",
        avatar: "https://mockmind-api.uifaces.co/content/human/212.jpg"
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

// Google登入
export const loginGoogle = async (idToken) => {
    const response = await axios.post("api/auth", { token: idToken });
    if (idToken) {
        localStorage.setItem('token', idToken); // 存 Token
    }
    return response.data; 
};

// Facebook登入
export const loginFacebook = async (idToken) => {
    const response = await axios.post("api/auth", { token: idToken });
    if (idToken) {
        localStorage.setItem('token', idToken); // 存 Token
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

export const getReviewsActivityId = async (id) => {
    const response = await axios.get(`/api/reviews?activityId=${id}`);
    return response.data;
};

export const getReviewsActivityIdPage = async (id , page = 1, limit = 2) => {
    const response = await axios.get(`/api/reviews?activityId=${id}&_page=${page}&_limit=${limit}`);
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
        // 簽名與上傳都在後端完成，前端只負責送檔案（Token 由 interceptor 自動帶上）
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await axios.post(`/upload-to-cloudinary`, formData);

        if (!data.secure_url) {
            Swal.fire({ title: "無法取得圖片 URL", icon: "warning" });
            return;
        }
        return data.secure_url;
    } catch (error) {
        const message = error.response?.data?.error || error.message;
        Swal.fire({ title: '上傳圖片失敗: ' + message, icon: "error" });
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

export const createMember = async (user) => {
  try {
      // 1. 先用 uuid 查詢用戶是否已存在
      const { data: existingUsers } = await axios.get("api/users", {
        params: { uuid: user.uuid }
      });

      if (existingUsers.length > 0) {
        return existingUsers[0];
      }

      // 2. 用戶不存在，透過 /api/register 建立帳號（取得 json-server JWT）
      const { data: authData } = await axios.post("api/register", {
        email: user.email,
        password: user.password,
      });

      const token = authData.accessToken;
      const userId = authData.user.id;

      // 3. 用回傳的 token 補充 uuid、名稱、頭像等欄位
      await axios.patch(`api/users/${userId}`, {
        uuid: user.uuid,
        name: user.name,
        avatar: user.avatar,
        role: user.role || "Member",
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 4. 回傳完整用戶資料
      const { data: updatedUser } = await axios.get(`api/users/${userId}`);
      return updatedUser;

  } catch (error) {
    console.error("API 發生錯誤", error);
    return null;
  }
};

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