import { createContext, useContext, useEffect, useState } from "react";
import { getMemberAll } from '@/frontend/utils/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [getUsers, setGetUsers] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const loggedInEmail = localStorage.getItem("userEmail")|| ""; 
        if (!loggedInEmail.trim()) {
          console.warn("本地儲存中沒有 userEmail");
          return;
      }

        const users = await getMemberAll();
        const user = users.find(user => user.email === loggedInEmail);
        if (user) {
          setGetUsers(user);
        } else {
          console.warn("找不到對應的使用者");
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
