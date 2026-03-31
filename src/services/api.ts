import axios from 'axios';

// Create an instance of Axios
const api = axios.create({
  baseURL: 'https://api.krushilink.com/v1', // Replace with actual API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here from async storage or state
    // const token = await getAuthToken();
    // if (token) {
    //   config.headers.Authorization = \`Bearer \${token}\`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle global errors, e.g. token expiration, network error
    if (error.response?.status === 401) {
      // Trigger logout or token refresh
    }
    return Promise.reject(error);
  }
);

export default api;
