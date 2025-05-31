import { Box, SimpleGrid, Button, useDisclosure } from "@chakra-ui/react";
import ApartmentTable from "./ApartmentTable";
import ApartmentFilterModal from "./FilterModal"; // Import modal filter
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { columnsAppartmentDataColumns } from "./ColumnsData";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Settings() {
  const [tableComplaintData, setTableComplaintData] = useState([]);
  const pollingIntervalRef = useRef(null);
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();

  const fetchComplaintData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not found");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/apartments/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response = ", response)

      setTableComplaintData(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching apartments:", error);
    }
  }, []);

  const handleFilterSuccess = (newData) => {
    setTableComplaintData(newData);
  };

  useEffect(() => {
    fetchComplaintData();

    pollingIntervalRef.current = setInterval(() => {
      fetchComplaintData();
    }, 1000000);

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
        <ApartmentTable
          columnsConfig={columnsAppartmentDataColumns}
          tableData={tableComplaintData}
          refreshData={fetchComplaintData}
        />
      </SimpleGrid>
      <ApartmentFilterModal
        isOpen={isFilterOpen}
        onClose={onFilterClose}
        onFilterSuccess={handleFilterSuccess}
      />
    </Box>
  );
}