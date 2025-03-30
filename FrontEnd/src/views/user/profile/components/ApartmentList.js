import { Box, Text, VStack, HStack, IconButton, useColorModeValue } from "@chakra-ui/react";
import { MdPeople, MdInfo, MdReceipt } from "react-icons/md";
import Card from "components/card/Card.js";
import { useEffect, useState } from "react";
import UserListModal from './UserListModal';
import BillListModal from './BillListModal';
import AppartmentModal from "./ApartmentDetailModal";
const ApartmentList = () => {
  const [apartmentNumbers, setApartmentNumbers] = useState([]);
  const [residents, setResidents] = useState([]);
  const [isUserListOpen, setUserListOpen] = useState(false);

  const [bills, setBills] = useState([]);
  const [isBillsListOpen, setBillsListOpen] = useState(false);

  const [details, setDetails] = useState({
           apartmentNumber: '', 
           roomNumber: '', 
           floor: '' , 
           area: '', 
           dateCreated: '',
        });
  const [isApartmentOpen, setApartmentOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Đang fetch');
        const token = localStorage.getItem("token");
        const response = await fetch("https://backend-production-de57.up.railway.app/api/user/home", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const rawData = await response.json();
        console.log('rawData = ', rawData);
        setApartmentNumbers(rawData.resident?.apartmentNumbers || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleViewResidents = async (apartmentNumber) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://backend-production-de57.up.railway.app/api/user/apartment-detail?apartmentNumber=${apartmentNumber}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      setResidents(data.residents);
      setUserListOpen(true)
      console.log(`Residents for ${apartmentNumber}:`, data.residents);
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
  };

  const handleViewApartment = async (apartmentNumber) => {
    try {
      console.log("newnew")
      const token = localStorage.getItem("token");
      const response = await fetch(`https://backend-production-de57.up.railway.app/api/user/apartment-detail?apartmentNumber=${apartmentNumber}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      console.log('this' , data.apartment)
      setDetails(data.apartment);
      setApartmentOpen(true)
      console.log(`Residents for ${apartmentNumber}:`, data.apartment);
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
  };

  const handleViewBill = async (apartmentNumber) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://backend-production-de57.up.railway.app/api/user/apartment-detail?apartmentNumber=${apartmentNumber}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      setBills(data.bills);
      setBillsListOpen(true)
      console.log(`Residents for ${apartmentNumber}:`, data.bills);
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
  };

  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "gray.400";
  const bgColor = useColorModeValue("gray.100", "gray.700");

  return (
    <Card mb={{ base: "0px", "2xl": "20px" }}>
      <Text
        color={textColorPrimary}
        fontWeight="bold"
        fontSize="2xl"
        mt="10px"
        mb="4px"
      >
        Your Apartments
      </Text>
      <VStack align="start" spacing={3} width="full">
        {apartmentNumbers.map((number, index) => (
          <Box
            key={index}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            width="full"
            p={3}
            borderRadius="md"
            bg={bgColor}
          >
            <Text color={textColorPrimary} fontSize="md" fontWeight="medium">
              Apartment: {number}
            </Text>
            <HStack spacing={2}>
              <IconButton
                aria-label="View Residents"
                icon={<MdPeople />}
                size="sm"
                colorScheme="blue"
                onClick={() => handleViewResidents(number)}
              />
              <IconButton
                aria-label="View Details"
                icon={<MdInfo />}
                size="sm"
                colorScheme="green"
                onClick={() => handleViewApartment(number)}
              />
              <IconButton
                aria-label="View Bills"
                icon={<MdReceipt />}
                size="sm"
                colorScheme="red"
                onClick={() => handleViewBill(number)}
              />
            </HStack>
          </Box>
        ))}
      </VStack>
            <UserListModal
              isOpen={isUserListOpen}
              onClose={() => setUserListOpen(false)}
              users={residents}
            />
            <BillListModal
              isOpen={isBillsListOpen}
              onClose={() => setBillsListOpen(false)}
              users={bills}
            />
            <AppartmentModal
              isOpen={isApartmentOpen}
              onClose={() => setApartmentOpen(false)}
              userData={details?.apartmentNumber ? details : { apartmentNumber: '', roomNumber: '', floor: '', area: '', dateCreated: '' }}
            />
    </Card>
  );
};

export default ApartmentList;
