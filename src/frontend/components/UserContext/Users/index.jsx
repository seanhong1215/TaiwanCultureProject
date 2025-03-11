// ApiContext
import { createContext, useState, useEffect } from "react";
import { getMemberAll } from '@/frontend/utils/api';

// 建立 Context
const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
    const fetchData = async () => {
        try {
        const response = await getMemberAll();
        setData(response);
        } catch (err) {
        setError(err);
        } finally {
        setLoading(false);
        }
    };

    fetchData();
    }, []);

    return (
    <ApiContext.Provider value={{ data, loading, error }}>
        {children}
    </ApiContext.Provider>
    );
};

export default ApiContext;


