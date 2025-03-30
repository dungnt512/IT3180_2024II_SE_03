import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token || isTokenExpired(token)) {
        toast({
          title: "Your login session is outdated!",
          description: "Please login again!",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        navigate("/auth/sign-in", { replace: true });
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 60000); // Kiểm tra mỗi phút
    return () => clearInterval(interval); // Cleanup khi unmount
  }, [navigate, toast]);

  return children;
};

export default AuthGuard;

// 🔹 Hàm kiểm tra token hết hạn
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Giải mã payload từ JWT
    return payload.exp * 1000 < Date.now(); // So sánh thời gian hết hạn với thời gian hiện tại
  } catch (e) {
    return true; // Token không hợp lệ => coi như hết hạn
  }
};
