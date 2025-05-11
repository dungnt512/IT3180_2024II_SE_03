import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import UserLayout from './layouts/user';
import RTLLayout from './layouts/rtl';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState, useEffect } from 'react';
import AuthGuard from "./authguard/AuthGuard"; // Import AuthGuard

import { useLocation } from 'react-router-dom';

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Giải mã JWT
        setRole(decodedToken.role); // Lấy giá trị role từ token
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
        setRole(null);
      }
    } else {
      setRole(null);
    }
  }, []);

  return (
    <ChakraProvider theme={currentTheme}>
      <Routes>
        <Route path="auth/*" element={<AuthLayout />} />

        {/* Bọc admin và user bằng AuthGuard đúng cách */}
        <Route key={location.pathname}
          path="admin/*"
          element={
            <AuthGuard>
              <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
            </AuthGuard>
          }
        />
        <Route 
          path="user/*"
          element={
            <AuthGuard>
              <UserLayout theme={currentTheme} setTheme={setCurrentTheme} />
            </AuthGuard>
          }
        />

        <Route 
          path="rtl/*"
          element={<RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />}
        />

        <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
      </Routes>
    </ChakraProvider>
  );
}
