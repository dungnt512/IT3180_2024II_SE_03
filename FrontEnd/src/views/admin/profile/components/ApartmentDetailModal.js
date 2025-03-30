import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Flex,
    Box,
    Text,
    useColorModeValue,
  } from '@chakra-ui/react';
  import { useState, useEffect } from 'react';
  
  const AppartmentModal = ({ isOpen, onClose, userData}) => {
    console.log("log : ", userData)
    const brandStars = useColorModeValue('brand.500', 'brand.400');
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const [formData, setFormData] = useState({
       apartmentNumber: '', 
       roomNumber: '', 
       floor: '' , 
       area: '', 
       dateCreated: '',
    });
    useEffect(() => {
      console.log("userData in useEffect:", userData); // Kiểm tra dữ liệu truyền vào
        setFormData(userData);
    }, [userData]);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
               'Your Apartment Detail'
  
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="row" w="100%" gap="20px">
              <Box flex="1">
                <FormControl>
                      <FormLabel
                        display="flex"
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        mb="8px"
                      >
                        Apartment Number<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <Input
                        type="text"
                        name="apartmentNumber"
                        isRequired={true}
                        variant="auth"
                        fontSize="sm"
                        ms={{ base: '0px', md: '0px' }}
                        mb="24px"
                        fontWeight="500"
                        size="lg"
                        value={formData.apartmentNumber}
                        onChange={handleChange}
                        isReadOnly={true}
                      />
  
                      <FormLabel
                        display="flex"
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        mb="8px"
                      >
                        Room Number<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <Input
                        name="roomNumber"
                        isRequired={true}
                        variant="auth"
                        fontSize="sm"
                        ms={{ base: '0px', md: '0px' }}
                        mb="24px"
                        fontWeight="500"
                        size="lg"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        isReadOnly={true}
                      />
  
                </FormControl>
              </Box>
  
              <Box flex="1">
                <FormControl>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Floor<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    name="floor"
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                    value={formData.floor}
                    onChange={handleChange}
                    isReadOnly={true}
                  />
  
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Area (m²)<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    name="area"
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                    value={formData.area}
                    onChange={handleChange}
                    isReadOnly={true}
                  />

<FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Date Created<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    name="dateCreated"
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                    value={formData.area}
                    onChange={handleChange}
                    isReadOnly={true}
                  />

                </FormControl>
              </Box>
            </Flex>
          </ModalBody>
  
          <ModalFooter>
            <Button
              variant="whiteBrand"
              color="dark"
              fontSize="sm"
              fontWeight="500"
              borderRadius="10px"
              px="15px"
              py="5px"
              onClick={onClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default AppartmentModal;
  