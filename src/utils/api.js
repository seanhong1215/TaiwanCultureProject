import axios from 'axios'

const API_BASE_URL = '/api';

export const getUsers = async () => {
    try {
      const response = await axios.get(`/api/spaces`);
      return response.data; 
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error; // 如果發生錯誤，拋出錯誤
    }
  };

