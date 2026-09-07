import { createContext, useContext, useEffect, useState } from "react";
import { getMembers } from '@/frontend/utils/api/member';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [getUsers, setGetUsers] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const user = await getMembers(userId);
        if (user) {
          setGetUsers(user);
        }
      } catch (error) {
        console.error("獲取使用者資料失敗:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ getUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
