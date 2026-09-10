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

// Google 登入：只負責驗證 token 並拿回使用者資料。
// 不在這裡寫 localStorage.token——要等 handleSocialLogin 把會員資料
// （createMember）也建立／取得成功之後才設，避免「有 token 但沒有
// userId／userAvatar」的登一半狀態把會員中心弄壞。
export const loginGoogle = async (idToken) => {
    const response = await axios.post("api/auth", { token: idToken });
    return response.data;
};

// Facebook 登入：同上
export const loginFacebook = async (idToken) => {
    const response = await axios.post("api/auth", { token: idToken });
    return response.data;
};
