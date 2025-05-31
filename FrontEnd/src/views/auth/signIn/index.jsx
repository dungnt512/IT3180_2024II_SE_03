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

import React, { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Add this import
import { jwtDecode } from "jwt-decode";
import { WarningIcon } from "@chakra-ui/icons"; // Import icon from Chakra UI
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
} from "@chakra-ui/react";
// Custom components
import { HSeparator } from "components/separator/Separator";
import DefaultAuth from "layouts/auth/Default";
// Assets
import illustration from "assets/img/auth/auth.png";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";

// 🔹 Function to check if token is expired
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode payload from JWT
    return payload.exp * 1000 < Date.now(); // Compare expiration time with current time
  } catch (e) {
    return true; // Invalid token => consider as expired
  }
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function SignIn() {
  // Chakra color mode
  const navigate = useNavigate(); // 🔹 Must declare useNavigate() here
  const toast = useToast(); // 🔹 Hook to display notifications
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const googleBg = useColorModeValue("secondaryGray.300", "whiteAlpha.200");
  const googleText = useColorModeValue("navy.700", "white");
  const googleHover = useColorModeValue(
    { bg: "gray.200" },
    { bg: "whiteAlpha.300" }
  );
  const googleActive = useColorModeValue(
    { bg: "secondaryGray.300" },
    { bg: "whiteAlpha.200" }
  );
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isTokenExpired(token)) {
      try {
        const tokenPayload = jwtDecode(token);

        toast({
          title: "You are logged in before!",
          description: "You will be redirected shortly...",
          status: "info",
          duration: 2000,
          isClosable: true,
        });

        // 🔹 Navigate based on user role
        setTimeout(() => {
          if (tokenPayload.role === "ROLE_ADMIN") {
            navigate("/admin/data-tables");
          } else if (tokenPayload.role === "ROLE_USER") {
            navigate("/user/profile");
          }
        }, 2000);
      } catch (error) {
        console.error("Token decoding error:", error);
        localStorage.removeItem("token"); // Remove token if error
      }
    }
  }, [navigate, toast]);


  const handleLogin = async () => {
    setError("");

    // Check if name and password have values
    if (!name.trim() || !password.trim()) {
      setError("Username and password must not be empty.");
      return;
    }

    const requestBody = { name, password };

    console.log("Sending JSON to backend:", JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      // Get raw text from server
      const rawData = await response.text();
      console.log("Raw response:", rawData);

      // Check if server response is JSON
      let data;
      try {
        data = JSON.parse(rawData);
      } catch (jsonError) {
        // If error when parsing JSON, server may return just a token string
        data = { token: rawData };
      }

      console.log("Parsed Data:", data);

      if (!response.ok) {
        throw new Error(data.message || "You provided wrong information!");
      }

      if (!data.token) {
        throw new Error("Token does not exist in server response");
      }

      localStorage.setItem("token", data.token);

      try {
        const tokenPayload = jwtDecode(data.token);
        console.log("Decoded Token:", tokenPayload);
        // 🔹 Hiển thị thông báo thành công
        toast({
          title: "Login succesful!",
          description: "You will be redirected shortly...",
          status: "success",
          duration: 2000, // 2 giây
          isClosable: true,
        });
        setTimeout(() => {
          if (tokenPayload.role === "ROLE_ADMIN") {
            navigate("/admin/data-tables");
          } else if (tokenPayload.role === "ROLE_USER") {
            navigate("/user/profile");
          } else {
            setError("Invalid role");
          }
        }, 2000);
      } catch (decodeError) {
        setError("Token decoding error. Token may be invalid.");
        console.error("Decode Error:", decodeError);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error("Fetch Error:", err);
    }
  };

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: "100%", md: "max-content" }}
        w='100%'
        mx={{ base: "auto", lg: "0px" }}
        me='auto'
        h='100%'
        alignItems='start'
        justifyContent='center'
        mb={{ base: "30px", md: "60px" }}
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "40px", md: "14vh" }}
        flexDirection='column'>
        <Box me='auto'>
          <Heading color={textColor} fontSize='36px' mb='10px'>
            Sign In
          </Heading>
          <Text
            mb='36px'
            ms='4px'
            color={textColorSecondary}
            fontWeight='400'
            fontSize='md'>
            Enter your username and password to sign in!
          </Text>
        </Box>
        <Flex
          zIndex='2'
          direction='column'
          w={{ base: "100%", md: "420px" }}
          maxW='100%'
          background='transparent'
          borderRadius='15px'
          mx={{ base: "auto", lg: "unset" }}
          me='auto'
          mb={{ base: "20px", md: "auto" }}>
          <Button
            fontSize='sm'
            me='0px'
            mb='26px'
            py='15px'
            h='50px'
            borderRadius='16px'
            bg={googleBg}
            color={googleText}
            fontWeight='500'
            _hover={googleHover}
            _active={googleActive}
            _focus={googleActive}>
            <Icon as={FcGoogle} w='20px' h='20px' me='10px' />
            Sign in with Google
          </Button>
          <Flex align='center' mb='25px'>
            <HSeparator />
            <Text color='gray.400' mx='14px'>
              or
            </Text>
            <HSeparator />
          </Flex>
          <FormControl>
            <FormLabel
              display='flex'
              ms='4px'
              fontSize='sm'
              fontWeight='500'
              color={textColor}
              mb='8px'>
              Username<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              isRequired={true}
              variant='auth'
              fontSize='sm'
              ms={{ base: "0px", md: "0px" }}
              type='email'
              placeholder='mail@simmmple.com'
              mb='24px'
              fontWeight='500'
              size='lg'
              value={name} // Thêm dòng này để liên kết state với input
              onChange={(e) => setName(e.target.value)}
            />
            <FormLabel
              ms='4px'
              fontSize='sm'
              fontWeight='500'
              color={textColor}
              display='flex'>
              Password<Text color={brandStars}>*</Text>
            </FormLabel>
            <InputGroup size='md'>
              <Input
                isRequired={true}
                fontSize='sm'
                placeholder='Min. 8 characters'
                mb='24px'
                size='lg'
                type={show ? "text" : "password"}
                variant='auth'
                value={password} // Thêm dòng này để liên kết state với input
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement display='flex' alignItems='center' mt='4px'>
                <Icon
                  color={textColorSecondary}
                  _hover={{ cursor: "pointer" }}
                  as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  onClick={handleClick}
                />
              </InputRightElement>
            </InputGroup>
            <Flex justifyContent='space-between' align='center' mb='24px'>
              <FormControl display='flex' alignItems='center'>
                <Checkbox
                  id='remember-login'
                  colorScheme='brandScheme'
                  me='10px'
                />
                <FormLabel
                  htmlFor='remember-login'
                  mb='0'
                  fontWeight='normal'
                  color={textColor}
                  fontSize='sm'>
                  Keep me logged in
                </FormLabel>
              </FormControl>
              <NavLink to='/auth/forgot-password'>
                <Text
                  color={textColorBrand}
                  fontSize='sm'
                  w='124px'
                  fontWeight='500'>
                  Forgot password?
                </Text>
              </NavLink>
            </Flex>
            <Button
              fontSize='sm'
              variant='brand'
              fontWeight='500'
              w='100%'
              h='50'
              mb='24px'
              onClick={handleLogin}>
              Sign In
            </Button>
          </FormControl>
          <Flex
            flexDirection='column'
            justifyContent='center'
            alignItems='start'
            maxW='100%'
            mt='0px'>
            <Text color={textColorDetails} fontWeight='400' fontSize='14px'>
              Not registered yet?
              <NavLink to='/auth/sign-up'>
                <Text
                  color={textColorBrand}
                  as='span'
                  ms='5px'
                  fontWeight='500'>
                  Create an Account
                </Text>
              </NavLink>
            </Text>
          </Flex>
          {error && (
            <Text color='red.500' mt='10px' fontSize='md' fontWeight='bold'>
              <WarningIcon boxSize={4} color="red.500" mr={2} /> {/* Icon cảnh báo */}
              {error}
            </Text>
          )}
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
