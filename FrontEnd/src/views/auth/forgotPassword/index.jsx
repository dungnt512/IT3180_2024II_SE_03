/* eslint-disable */
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

import React, { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Thêm import này
import { jwtDecode } from 'jwt-decode';
import { WarningIcon } from '@chakra-ui/icons'; // Nhúng icon từ Chakra UI
// Chakra imports
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
// Custom components
import { HSeparator } from 'components/separator/Separator';
import DefaultAuth from 'layouts/auth/Default';
// Assets
import illustration from 'assets/img/auth/auth.png';
import { FcGoogle } from 'react-icons/fc';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
// 🔹 Hàm kiểm tra token hết hạn
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Giải mã payload từ JWT
    return payload.exp * 1000 < Date.now(); // So sánh thời gian hết hạn với thời gian hiện tại
  } catch (e) {
    return true; // Token không hợp lệ => coi như hết hạn
  }
};

function SignIn() {
  // Chakra color mode
  const navigate = useNavigate(); // 🔹 Phải khai báo useNavigate() ở đây
  const toast = useToast(); // 🔹 Hook để hiển thị thông báo
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const textColorDetails = useColorModeValue('navy.700', 'secondaryGray.600');
  const textColorBrand = useColorModeValue('brand.500', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const googleBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.200');
  const googleText = useColorModeValue('navy.700', 'white');
  const googleHover = useColorModeValue(
    { bg: 'gray.200' },
    { bg: 'whiteAlpha.300' },
  );
  const googleActive = useColorModeValue(
    { bg: 'secondaryGray.300' },
    { bg: 'whiteAlpha.200' },
  );
  const [show, setShow] = React.useState(false);
  const [OTP, setOTP] = useState('');
  const [error, setError] = useState('');

  const handleSend = async () => {
    const requestBody = { username: OTP }; // Create a JSON object containing the OTP
  
    console.log('Data sent to backend:', JSON.stringify(requestBody, null, 2)); // ✅ Log the sent data
  
    try {
      const resendResponse = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure session is sent
        body: JSON.stringify(requestBody), // ✅ Send OTP to the server
      });
  
      const resendData = await resendResponse.json();
      console.log("resendData = ", resendData)
      
      if (resendData.message === 'OTP sent successfully') {
        toast({
          title: 'Username Verification Successful!',
          description: 'Sending OTP code to your email',
          status: 'success',
          duration: 1000,
          isClosable: true,
        });
  
        localStorage.setItem('username', OTP);
        setTimeout(() => {
          navigate('/auth/verify-forgot-password');
        }, 2000);
      }else if (resendData.message === 'Phiên đăng ký đã hết hạn!') {
        toast({
            title: 'Verification Failed!',
            description: 'Session is outdated',
            status: 'error',
            duration: 2000,
            isClosable: true,
          });
  
        localStorage.clear();
        setTimeout(() => {
          navigate('/auth/sign-up');
        }, 2000);
      }
      else if (resendData.message === 'OTP không đúng. Vui lòng thử lại!!') {
        toast({
            title: 'Verification Failed!',
            description: 'OTP is wrong. Please try again!',
            status: 'error',
            duration: 2000,
            isClosable: true,
          });
  
      }
       else {
        toast({
          title: 'Verification Failed!',
          description: 'Session is outdated',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });

          
        localStorage.clear();
        setTimeout(() => {
          navigate('/auth/sign-up');
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'Connection Error!',
        description: 'Please try again later.',
        status: 'error',
        duration: 2000,
        isClosable: true,

      });
    }
  };

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: '100%', md: 'max-content' }}
        w="100%"
        mx={{ base: 'auto', lg: '0px' }}
        me="auto"
        h="100%"
        alignItems="start"
        justifyContent="center"
        mb={{ base: '30px', md: '60px' }}
        px={{ base: '25px', md: '0px' }}
        mt={{ base: '40px', md: '14vh' }}
        flexDirection="column"
      >
        <Box me="auto">
          <Heading color={textColor} fontSize="36px" mb="10px">
            Change Password
          </Heading>
          <Text
            mb="36px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
          >
            Enter your usename to change your password
          </Text>
        </Box>
        <Flex
          zIndex="2"
          direction="column"
          w={{ base: '100%', md: '420px' }}
          maxW="100%"
          background="transparent"
          borderRadius="15px"
          mx={{ base: 'auto', lg: 'unset' }}
          me="auto"
          mb={{ base: '20px', md: 'auto' }}
        >
          <Button
            fontSize="sm"
            me="0px"
            mb="26px"
            py="15px"
            h="50px"
            borderRadius="16px"
            bg={googleBg}
            color={googleText}
            fontWeight="500"
            _hover={googleHover}
            _active={googleActive}
            _focus={googleActive}
          >
            <Icon as={FcGoogle} w="20px" h="20px" me="10px" />
            Sign in with Google
          </Button>
          <Flex align="center" mb="25px">
            <HSeparator />
            <Text color="gray.400" mx="14px">
              or
            </Text>
            <HSeparator />
          </Flex>
          <FormControl>
            <FormLabel
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              display="flex"
            >
              Username<Text color={brandStars}>*</Text>
            </FormLabel>
            <InputGroup size="md">
              <Input
                isRequired={true}
                type = "text"
                fontSize="sm"
                placeholder="nguyenvana123"
                mb="24px"
                size="lg"
                variant="auth"
                value={OTP} // Thêm dòng này để liên kết state với input
                onChange={(e) => setOTP(e.target.value)}
              />
            </InputGroup>
            <Flex justifyContent="space-between" align="center" mb="24px">
              <FormControl display="flex" alignItems="center">
              </FormControl>
            </Flex>
            <Button
              fontSize="sm"
              variant="brand"
              fontWeight="500"
              w="100%"
              h="50"
              mb="24px"
              onClick={handleSend}
            >
              Submit
            </Button>
          </FormControl>
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="start"
            maxW="100%"
            mt="0px"
          >
            <Text color={textColorDetails} fontWeight="400" fontSize="14px">
              Not registered yet?
              <NavLink to="/auth/sign-up">
                <Text
                  color={textColorBrand}
                  as="span"
                  ms="5px"
                  fontWeight="500"
                >
                  Create an Account
                </Text>
              </NavLink>
            </Text>
          </Flex>
          {error && (
            <Text color="red.500" mt="10px" fontSize="md" fontWeight="bold">
              <WarningIcon boxSize={4} color="red.500" mr={2} />{' '}
              {/* Icon cảnh báo */}
              {error}
            </Text>
          )}
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
