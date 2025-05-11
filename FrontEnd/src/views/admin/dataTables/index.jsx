/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: http://www.horizon-ui.com/
* Copyright 2023 Horizon UI (http://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// Chakra imports
import { Box, SimpleGrid } from "@chakra-ui/react";
import ColumnsTable from "views/admin/dataTables/components/ColumnsTable";
import AppartmentTable from "views/admin/dataTables/components/AppartmentTable";
import BillTable from "views/admin/dataTables/components/BillTable";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  columnsDataColumns,
  columnsAppartmentDataColumns,
  columnsBillDataColumns,
} from "views/admin/dataTables/variables/columnsData";
import React from "react";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export default function Settings() {
  // Chakra Color Mode
  const [tableDataColumns, setTableDataColumns] = useState([]);
  const [tableApartmentDataColumns, setApartmentTableDataColumns] = useState([]);
  const [tableBillDataColumns, setBillTableDataColumns] = useState([]);

    // Hàm fetch data
    const fetchData = useCallback(async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Không tìm thấy token");
          return;
        }
  
        const response = await axios.get(`${API_BASE_URL}/admin/home`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setTableDataColumns(response.data.data || response.data);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    }, []);
  
    useEffect(() => {
      fetchData();
    }, [fetchData]);

    const fetchApartmentData = useCallback(async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Không tìm thấy token");
          return;
        }
  
        const response = await axios.get(`${API_BASE_URL}/api/admin/apartment-list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setApartmentTableDataColumns(response.data.data || response.data);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    }, []);
  
    useEffect(() => {
      fetchApartmentData();
    }, [fetchApartmentData]);

    const fetchBillData = useCallback(async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Không tìm thấy token");
          return;
        }
  
        const response = await axios.get(`${API_BASE_URL}/api/admin/bills`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setBillTableDataColumns(response.data.data || response.data);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    }, []);
  
    useEffect(() => {
      fetchBillData();
    }, [fetchBillData]);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        mb='20px'
        columns={{ sm: 1, md: 1 }}
        spacing={{ base: "20px", xl: "20px" }}>
        <ColumnsTable
          columnsConfig={columnsDataColumns}
          tableData={tableDataColumns}
          refreshData={fetchData}
        />
        <AppartmentTable
          columnsConfig={columnsAppartmentDataColumns}
          tableData={tableApartmentDataColumns}
          refreshData={fetchApartmentData}
        />
        <BillTable
          columnsConfig={columnsBillDataColumns}
          tableData={tableBillDataColumns}
          refreshData={fetchBillData}
        />
      </SimpleGrid>
    </Box>
  );
}