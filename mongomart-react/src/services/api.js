import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // For FormData, Content-Type is set automatically by the browser
    if (!(config.data instanceof FormData) && config.headers) {
        config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // console.error('API Error:', error.response || error.message);
    const errorMessage = error.response?.data?.detail || error.message || 'An unknown API error occurred.';
    // The notification will be handled by the component calling the API
    return Promise.reject({ ...error, message: errorMessage });
  }
);


export const loginUser = async (email, password) => {
  const response = await apiClient.post('/login', { email, password });
  return response.data; // Expected: { access_token: "...", token_type: "bearer" }
};

export const signupUser = async (email, password) => {
  const response = await apiClient.post('/signup', { email, password });
  return response.data;
};

export const getAllItems = async () => {
  const response = await apiClient.get('/items/');
  return response.data;
};

export const getUserItems = async () => {
  const response = await apiClient.get('/user/items');
  return response.data;
};

export const getItemById = async (itemId) => {
  const response = await apiClient.get(`/items/${itemId}`);
  return response.data;
};

export const createItem = async (itemData) => {
  // itemData is expected to be FormData
  const response = await apiClient.post('/items', itemData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteItem = async (itemId) => {
  const response = await apiClient.delete(`/items/${itemId}`);
  return response.data; // Or handle 204 No Content
};

// Function to get image URL
export const getFileUrl = (fileId) => {
  return `${API_BASE_URL}/file/${fileId}`;
};

export default apiClient;