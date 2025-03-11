import { createContext, useContext, useEffect, useState } from "react";
import { getUserDetail } from '@/frontend/utils/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const userId = Number(localStorage.getItem("userId")); // 取得 userId

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserDetail(userId);
        setUserData(response);
      } catch (error) {
        console.error("獲取使用者資料失敗:", error);
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
