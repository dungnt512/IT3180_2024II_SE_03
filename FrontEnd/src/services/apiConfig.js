import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL ? process.env.REACT_APP_API_BASE_URL + '/api' : 'http://localhost:9090/api';

// Cấu hình cơ bản cho axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để đính kèm token với mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${token}`);
      
      // Không cần decoded token trong production, chỉ dùng cho debug
      if (process.env.NODE_ENV === 'development') {
        try {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          console.log('Token contains role:', decoded.role);
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }
    } else {
      console.warn('No token found in localStorage!');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý các lỗi phản hồi (như token hết hạn)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      console.error(`API Error: ${status}`, error.response.data);
      
      // Xử lý lỗi 403 - Forbidden
      if (status === 403) {
        console.error('Authentication Error: Access forbidden');
        
        // Kiểm tra token và vai trò nếu cần
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            console.log('Current user role:', decoded.role);
            
            // Thông báo lỗi cụ thể nếu không có quyền admin
            if (!decoded.role || !decoded.role.includes('ROLE_ADMIN')) {
              console.error('Administrative privileges required for this operation');
            }
          } catch (e) {
            console.error('Error processing token:', e);
          }
        }
      } 
      // Xử lý lỗi 401 - Unauthorized
      else if (status === 401) {
        console.error('Authentication Error: Token expired or invalid');
        localStorage.removeItem('token');
        window.location.href = '/auth/sign-in';
      }
      // Xử lý lỗi 500 - Internal Server Error
      else if (status === 500) {
        console.error('Server Error:', error.response.data);
      }
    } else if (error.request) {
      // Yêu cầu đã được tạo nhưng không nhận được phản hồi
      console.error('Network Error: No response received', error.request);
    } else {
      // Lỗi khác
      console.error('Error during request setup:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 
