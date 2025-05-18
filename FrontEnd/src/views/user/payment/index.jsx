import { Box, SimpleGrid, Select, Text, Flex } from "@chakra-ui/react";
import ColumnsTable from "./ColumnsTable";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { columnsBillDataColumns } from "./columnsData";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Settings() {
  const [apartments, setApartments] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState("");
  const [tableBillData, setTableBillData] = useState([]);
  const [error, setError] = useState("");

  const fetchApartments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication failed: No token found!");
      }

      const response = await axios.get(`${API_BASE_URL}/api/user/home`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const apartmentList = response.data.resident?.apartmentNumbers || [];
      setApartments(apartmentList);
      if (apartmentList.length > 0) {
        setSelectedApartment(apartmentList[0]); // Select first apartment by default
      } else {
        setError("No apartments found for this user.");
      }
    } catch (error) {
      console.error("Error fetching apartments:", error);
      setError("Failed to load apartments. Please try again.");
    }
  }, []);

  const fetchBillData = useCallback(async () => {
    if (!selectedApartment) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication failed: No token found!");
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/user/apartment-detail?apartmentNumber=${selectedApartment}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const apartmentDetails = response.data || {};
      const bills = apartmentDetails.bills || [];
      setTableBillData(bills);
      setError("");
    } catch (error) {
      console.error("Error fetching bills:", error);
      setError("Failed to load bills for the selected apartment.");
    }
  }, [selectedApartment]);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  useEffect(() => {
    fetchBillData();
  }, [fetchBillData]);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Flex mb="20px" align="center" direction="column">
        <Text fontSize="xl" fontWeight="bold" mb="10px">
          Select Your Apartment
        </Text>
        <Select
          placeholder="Choose an apartment"
          value={selectedApartment}
          onChange={(e) => setSelectedApartment(e.target.value)}
          width={{ base: "100%", md: "300px" }}
          mb="20px"
        >
          {apartments.map((apartment) => (
            <option key={apartment} value={apartment}>
              {apartment}
            </option>
          ))}
        </Select>
        {error && (
          <Text color="red.500" mb="10px">
            {error}
          </Text>
        )}
      </Flex>
      <SimpleGrid
        mb="20px"
        columns={{ sm: 1, md: 1 }}
        spacing={{ base: "20px", xl: "20px" }}
      >
        <ColumnsTable
          columnsConfig={columnsBillDataColumns}
          tableData={tableBillData}
          refreshData={fetchBillData}
        />
      </SimpleGrid>
    </Box>
  );
}