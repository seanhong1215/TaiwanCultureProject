import { createContext } from 'react';

// 獨立成檔案：react-refresh 要求一個檔案只匯出元件，
// context 物件跟 AdminLayout 元件放在一起會讓 Fast Refresh 失效。
export const AdminContext = createContext();
