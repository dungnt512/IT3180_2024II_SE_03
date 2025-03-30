// Chakra imports
import { SimpleGrid, Text, useColorModeValue, Button, useDisclosure } from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import React from "react";
import {useEffect, useState } from "react";
import Information from "views/admin/profile/components/Information";
import ChangePassModal from "./ChangePassModal";

// Assets
export default function GeneralInformation(props) {
  const { ...rest } = props;
  const [error, setError] = React.useState('');
  const [mode, setMode] = React.useState('');
  const { isOpen, onOpen, onClose } = useDisclosure(); // Điều khiển modal
    const [newUser, setNewUser] = React.useState({
      name: '',
      password: '',
      role: '',
      fullName: '',
      age: '',
      gender: '',
      phone: '',
      email: '',
      apartmentId: '',
    });
  // Chakra Color Mode

  const [user, setUser] = useState({});

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
        setUser(rawData.resident);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (formData) => {
    try {
          // Lấy token từ local storage
    const token = localStorage.getItem("token");
    if (!token) {
      setError(["No authentication token found"]);
      return;
    }
      // Gửi yêu cầu GET để lấy userId
      const responseGet = await fetch("https://backend-production-de57.up.railway.app/api/user/change-password", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!responseGet.ok) {
        throw new Error("Failed to fetch userId");
      }
      
      const dataGet = await responseGet.json();
      
      // Thêm userId vào formData
      const updatedFormData = { ...formData, userId: dataGet.userId };
      console.log("updatedFormData = ", updatedFormData)
      
      // Gửi yêu cầu POST với formData mới
      const responsePost = await fetch("https://backend-production-de57.up.railway.app/api/user/change-password", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedFormData)
      });
      
      const textPost = await responsePost.text();
      const response = responsePost.json();
      const dataPost = await responseGet.json();

      if (!responsePost.ok) {
        const errorMessages = response.message;
        setError(errorMessages);
        return;
      }
      
      // Xử lý thành công nếu cần
      console.log("Password changed successfully", dataPost);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(["An unexpected error occurred"]);
    }
  };
  



  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "gray.400";
  const cardShadow = useColorModeValue(
    "0px 18px 40px rgba(112, 144, 176, 0.12)",
    "unset"
  );
  return (
    <Card mb={{ base: "0px", "2xl": "20px" }} {...rest}>
      <Text
        color={textColorPrimary}
        fontWeight='bold'
        fontSize='2xl'
        mt='10px'
        mb='4px'>
        Your Information
      </Text>
      <Text color={textColorSecondary} fontSize='md' me='26px' mb='40px'>
        From Tran Quoc Thai and SE_03 Team with love!
      </Text>
      <SimpleGrid columns='2' gap='20px'>
          <Information boxShadow={cardShadow} title='Full Name' value={user.fullName} />
          <Information boxShadow={cardShadow} title='Email' value={user.email} />
          <Information boxShadow={cardShadow} title='Phone' value={user.phone} />
          <Information boxShadow={cardShadow} title='Age' value={user.age} />
      </SimpleGrid>
                <Button
                  variant="darkBrand"
                  color="white"
                  fontSize="sm"
                  fontWeight="500"
                  borderRadius="10px"
                  px="15px"
                  py="5px"
                  onClick={() => {
                    onOpen();
                    setMode('create');
                  }}
                >
                  Change password
                </Button>
              <ChangePassModal
                isOpen={isOpen}
                onClose={onClose}
                userData={newUser}
                mode={mode}
                onSubmit={handleSubmit}
                error={error}
              />
    </Card>
  );
}
