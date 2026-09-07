import axios from './client';

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
