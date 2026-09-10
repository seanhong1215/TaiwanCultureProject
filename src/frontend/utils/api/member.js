import axios from './client';

// 用戶管理
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
      //（後端 /api/auth 在這之前已經做過帳號連結：同 email 的舊帳號會被
      //  更新成當前 provider 的 uuid，所以這裡通常查得到。）
      const { data: existingUsers } = await axios.get("api/users", {
        params: { uuid: user.uuid }
      });

      if (existingUsers.length > 0) {
        return existingUsers[0];
      }

      // 1b. uuid 查不到，但 email 可能已經有帳號（例如 FB 沒給 email、
      //     使用者手動輸入了一個已註冊的 email）。直接沿用該帳號登入，
      //     不要往下走註冊撞 400。
      if (user.email) {
        const { data: byEmail } = await axios.get("api/users", {
          params: { email: user.email }
        });
        if (byEmail.length > 0) {
          return byEmail[0];
        }
      }

      // 2. 用戶不存在，透過 /api/register 建立帳號（取得 JWT）
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
