import axios from './client';

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
