import { Box, SimpleGrid } from "@chakra-ui/react";
import NotiTable from "./NotiTable";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { columnsNoti } from "./ComlumnsData";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Settings() {
  const [tableComplaintData, setTableComplaintData] = useState([]);
  const pollingIntervalRef = useRef(null); // lưu interval để clear sau này

  const fetchComplaintData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not found");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/notifications/manual`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTableComplaintData(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  }, []);

  useEffect(() => {
    // fetch ngay khi load
    fetchComplaintData();

    // Bắt đầu polling mỗi 10 giây
    pollingIntervalRef.current = setInterval(() => {
      fetchComplaintData();
    }, 1000000); // 2 giây

    // Clear interval khi component unmount
    return () => {
      clearInterval(pollingIntervalRef.current);
    };
  }, [fetchComplaintData]);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        mb="20px"
        columns={{ sm: 1, md: 1 }}
        spacing={{ base: "20px", xl: "20px" }}
      >
        <NotiTable
          columnsConfig={columnsNoti}
          tableData={tableComplaintData}
          refreshData={fetchComplaintData}
        />
      </SimpleGrid>
    </Box>
  );
}
