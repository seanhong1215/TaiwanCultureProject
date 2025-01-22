import axios from 'axios'

// axios.interceptors.request.use(config => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//         console.log("使用者資料:", response.data);
//     }
//     return config;
// });

export const getActivity = async () => {
    try {
        const response = await axios.get(`/api/activity`);
        return response.data; 
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error; // 如果發生錯誤，拋出錯誤
    }
};

export const getJournal = async () => {
    try {
        const response = await axios.get(`/api/journal`);
        return response.data; 
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error; // 如果發生錯誤，拋出錯誤
    }
};

export const getReviews = async () => {
    try {
        const response = await axios.get(`/api/reviews`);
        return response.data; 
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error; // 如果發生錯誤，拋出錯誤
    }
};

export const register = async (userData) => {
    try {
        const response = await axios.post(`/api/register`, {
            email: userData.email,
            password: userData.password,
        });
        return response.data; 
    } catch (error) {
        if (error.response) {
            console.error('伺服器回應錯誤:', error.response.status, error.message);
        } else {
            console.error('請求錯誤:', error);
        }
        throw error;
    }
};

export const login = async (userData) => {

    try {
        const response = await axios.post(`/api/signin`, userData);
        console.log(response);
        // 登入成功後，可以儲存 token
        if (response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);
        }
        return response.data; 
    } catch (error) {
        if (error.response) {
            console.error('伺服器回應錯誤:', error.response.status, error.message);
        } else {
            console.error('請求錯誤:', error);
        }
        throw error;
    }
};

