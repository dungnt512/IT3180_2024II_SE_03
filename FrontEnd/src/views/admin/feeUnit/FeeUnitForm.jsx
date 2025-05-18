import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Text,
  useColorModeValue,
  useToast,
  Card,
  Spinner,
  InputGroup,
  InputRightAddon,
  ButtonGroup,
} from '@chakra-ui/react';
import api from 'services/apiConfig';
import { MdSave, MdRefresh } from 'react-icons/md';

const FeeUnitForm = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feeUnit, setFeeUnit] = useState({
    apartmentPricePerM2: 0,
    serviceFeePerM2: 0,
    motorbikeParkingFeeByMonth: 0,
    motorbikeParkingFeeByHour: 0,
    carParkingFeeByMonth: 0,
    carParkingFeeByHour: 0,
    waterFeePerM3: 0,
    electricityFeePerKWh: 0
  });

  useEffect(() => {
    fetchFeeUnit();
  }, []);

  const fetchFeeUnit = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/fee-units');
      console.log("API Response:", response.data); // Log response để debug
      
      // Đảm bảo feeUnit được set đúng cách, bất kể response có dạng gì
      if (response.data) {
        setFeeUnit(response.data);
      }
    } catch (error) {
      console.error("Error fetching fee unit:", error);
      toast({
        title: 'Error',
        description: 'Unable to fetch fee unit settings',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFeeUnit({
      ...feeUnit,
      [field]: Number(value) || 0
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.post('/fee-units', feeUnit);
      toast({
        title: 'Success',
        description: 'Fee unit settings saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setFeeUnit(response.data);
    } catch (error) {
      let errorMsg = 'Unable to save fee unit settings';
      if (error.response && error.response.data && error.response.data.message) {
        errorMsg = error.response.data.message;
      }
      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    fetchFeeUnit();
  };

  // console.log(feeUnit);
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header */}
      <Flex mb='20px' justify='space-between' align='center'>
        <Text color={textColor} fontSize='2xl' fontWeight='700'>
          Fee Unit Settings
        </Text>
        
        <ButtonGroup>
          <Button
            leftIcon={<MdRefresh />}
            variant='outline'
            onClick={handleReset}
            isLoading={isLoading}
          >
            Reset
          </Button>
          <Button
            leftIcon={<MdSave />}
            colorScheme='blue'
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </ButtonGroup>
      </Flex>
      
      {isLoading ? (
        <Flex justify='center' align='center' height='400px'>
          <Spinner size='xl' color='blue.500' />
        </Flex>
      ) : (
        <Card>
          <Box p={5}>
            <Text color={textColor} fontSize='xl' fontWeight='600' mb={4} bg="blue.50" p={2} borderRadius="md">
              Apartment Fee Settings
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing='20px' mb={6}>
              <FormControl>
                <FormLabel>Apartment Price (VND/m²)</FormLabel>
                <NumberInput
                        min={0}
                        value={feeUnit.apartmentPricePerM2}
                        onChange={(valueStr, valueNum) => handleInputChange('apartmentPricePerM2', valueNum)}
                    >
                    <InputGroup>
                    <NumberInputField />
                    <InputRightAddon>VND/m²</InputRightAddon>
                    </InputGroup>
                </NumberInput>

                {/* <NumberInput min={0}>
                  <InputGroup>
                    <NumberInputField
                      value={feeUnit.apartmentPricePerM2.toString()}
                      onChange={(e) => handleInputChange('apartmentPricePerM2', e.target.value)}
                    />
                    <InputRightAddon>VND/m²</InputRightAddon>
                  </InputGroup>
                </NumberInput> */}
              </FormControl>
              
              <FormControl>
                <FormLabel>Service Fee (VND/m²/month)</FormLabel>
                <NumberInput
                        min={0}
                        value={feeUnit.serviceFeePerM2}
                        onChange={(valueStr, valueNum) => handleInputChange('serviceFeePerM2', valueNum)}
                    >
                    <InputGroup>
                      <NumberInputField />
                      <InputRightAddon>VND/m²/month</InputRightAddon>
                    </InputGroup>
                </NumberInput>
              </FormControl>
            </SimpleGrid>

            <Text color={textColor} fontSize='xl' fontWeight='600' mb={4} bg="blue.50" p={2} borderRadius="md">
              Parking Fee Settings
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing='20px' mb={6}>
              <FormControl>
                <FormLabel>Motorbike Monthly Fee (VND/month)</FormLabel>
                <NumberInput
                    min={0}
                    value={feeUnit.motorbikeParkingFeeByMonth}
                    onChange={(valueStr, valueNum) => handleInputChange('motorbikeParkingFeeByMonth', valueNum)}
                >
                    <InputGroup>
                    <NumberInputField />
                    <InputRightAddon>VND/month</InputRightAddon>
                  </InputGroup>
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Motorbike Hourly Fee (VND/hour)</FormLabel>
                <NumberInput
                    min={0}
                    value={feeUnit.motorbikeParkingFeeByHour}
                    onChange={(valueStr, valueNum) => handleInputChange('motorbikeParkingFeeByHour', valueNum)}
                >
                    <InputGroup>
                    <NumberInputField />
                    <InputRightAddon>VND/hour</InputRightAddon>
                  </InputGroup>
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Car Monthly Fee (VND/month)</FormLabel>
                <NumberInput
                    min={0}
                    value={feeUnit.carParkingFeeByMonth}
                    onChange={(valueStr, valueNum) => handleInputChange('carParkingFeeByMonth', valueNum)}
                >
                    <InputGroup>
                    <NumberInputField />
                    <InputRightAddon>VND/month</InputRightAddon>
                  </InputGroup>
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Car Hourly Fee (VND/hour)</FormLabel>
                <NumberInput
                    min={0}
                    value={feeUnit.carParkingFeeByHour}
                    onChange={(valueStr, valueNum) => handleInputChange('carParkingFeeByHour', valueNum)}
                >
                    <InputGroup>
                    <NumberInputField />
                    <InputRightAddon>VND/hour</InputRightAddon>
                  </InputGroup>
                </NumberInput>
              </FormControl>
            </SimpleGrid>

            <Text color={textColor} fontSize='xl' fontWeight='600' mb={4} bg="blue.50" p={2} borderRadius="md">
              Utility Fee Settings
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing='20px' mb={6}>
              <FormControl>
                <FormLabel>Water Price (VND/m³)</FormLabel>
                <NumberInput
                    min={0}
                    value={feeUnit.waterFeePerM3}
                    onChange={(valueStr, valueNum) => handleInputChange('waterFeePerM3', valueNum)}
                >
                    <InputGroup>
                    <NumberInputField />
                    <InputRightAddon>VND/m³</InputRightAddon>
                  </InputGroup>
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Electricity Price (VND/kWh)</FormLabel>
                <NumberInput
                    min={0}
                    value={feeUnit.electricityFeePerKWh}
                    onChange={(valueStr, valueNum) => handleInputChange('electricityFeePerKWh', valueNum)}
                >
                    <InputGroup>
                    <NumberInputField />
                    <InputRightAddon>VND/kWh</InputRightAddon>
                  </InputGroup>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
            
            <Flex justify="flex-end" mt={4}>
              <ButtonGroup>
                <Button
                  variant='outline'
                  onClick={handleReset}
                  isLoading={isLoading}
                >
                  Reset
                </Button>
                <Button
                  colorScheme='blue'
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  Save Changes
                </Button>
              </ButtonGroup>
            </Flex>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default FeeUnitForm; 