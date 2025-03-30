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
    Select,
    useColorModeValue,
  } from '@chakra-ui/react';
  import { useState, useEffect } from 'react';
  import { WarningIcon } from '@chakra-ui/icons'; 
  
  const BillModal = ({ isOpen, onClose, mode, userData, onSubmit, error }) => {
    const brandStars = useColorModeValue('brand.500', 'brand.400');
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const [formData, setFormData] = useState({
      ...(mode !== 'non' ? { apartmentNumber: '' } : {}), 
      ...(mode !== 'non' ? { billType: 'FIXED_COST' } : {}), 
      ...(mode !== 'non' ? { description: '' } : {}), 
      ...(mode !== 'non' ? { amount: '' } : {}), 
      ...(mode !== 'non' ? { dueDate: '' } : {}), 
    });
    useEffect(() => {
      console.log("userData in useEffect:", userData); // Kiểm tra dữ liệu truyền vào
      if (mode === 'edit' || mode === 'view') {
        setFormData(userData);
      } else {
        setFormData({
            ...(mode !== 'non' ? { apartmentNumber: '' } : {}), 
            ...(mode !== 'non' ? { billType: 'FIXED_COST' } : {}), 
            ...(mode !== 'non' ? { description: '  ' } : {}), 
            ...(mode !== 'non' ? { amount: '' } : {}), 
            ...(mode !== 'non' ? { dueDate: '' } : {}), 
        });
      }
    }, [mode, userData]);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {mode === 'create'
              ? 'Create Bill'
              : mode === 'edit'
                ? 'Edit Bill'
                : 'Bill Details'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="row" w="100%" gap="20px">
              <Box flex="1">
                <FormControl>
                  {mode !== 'non' && (
                    <>
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
                        isReadOnly={mode === 'view'}
                      />
                    </>
                  )}
  
                  {mode !== 'view' && (
                    <>
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                      mb="8px"
                    >
                      Bill Type<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Select
                      name="billType"
                      isRequired={true}
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: '0px', md: '0px' }}
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                      value={formData.billType}
                      onChange={handleChange}
                      isReadOnly={mode === 'view'}
                    >
                      <option value="FIXED_COST">FIXED_COST</option>
                      <option value="SERVICE_COST">SERVICE_COST</option>
                    </Select>
                    </>
                  )}

{mode === 'view' && (
                    <>
                    <FormLabel
                        display="flex"
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        mb="8px"
                      >
                        Bill Type<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <Input
                        name="billType"
                        isRequired={true}
                        variant="auth"
                        fontSize="sm"
                        ms={{ base: '0px', md: '0px' }}
                        mb="24px"
                        fontWeight="500"
                        size="lg"
                        value={formData.billType}
                        onChange={handleChange}
                        isReadOnly={mode === 'view'}
                      />
                    </>
                  )}

                     {mode !== 'non' && (
                    <>
                      <FormLabel
                        display="flex"
                        ms="4px"
                        fontSize="sm"
                        fontWeight="500"
                        color={textColor}
                        mb="8px"
                      >
                        Due Date (YYYY-MM-DD)<Text color={brandStars}>*</Text>
                      </FormLabel>
                      <Input
                        name="dueDate"
                        isRequired={true}
                        variant="auth"
                        fontSize="sm"
                        ms={{ base: '0px', md: '0px' }}
                        mb="24px"
                        fontWeight="500"
                        size="lg"
                        value={formData.dueDate}
                        onChange={handleChange}
                        isReadOnly={mode === 'view'}
                      />
                    </>
                  )}
  
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
                    Description<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    name="description"
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                    value={formData.description}
                    onChange={handleChange}
                    isReadOnly={mode === 'view'}
                  />
  
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Amount (USD)<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    name="amount"
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                    value={formData.amount}
                    onChange={handleChange}
                    isReadOnly={mode === 'view'}
                  />

                  {error && (
                    <Box ms="4px" mb="8px">
                      {error.map((errMsg, index) => (
                        <Text
                          key={index}
                          fontSize="sm"
                          fontWeight="bold"
                          color="red.500"
                          display="flex"
                          alignItems="center"
                        >
                          <WarningIcon boxSize={4} color="red.500" mr={2} />{' '}
                          {/* Icon cảnh báo */}
                          {errMsg}
                        </Text>
                      ))}
                    </Box>
                  )}
                </FormControl>
              </Box>
            </Flex>
          </ModalBody>
  
          <ModalFooter>
            {mode !== 'view' && (
              <Button
                variant="darkBrand"
                color="white"
                fontSize="sm"
                fontWeight="500"
                borderRadius="10px"
                px="15px"
                py="5px"
                onClick={() => onSubmit(formData)}
              >
                Save
              </Button>
            )}
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
  
  export default BillModal;
  