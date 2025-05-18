import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  Card,
  Spinner,
  NumberInput,
  NumberInputField,
  Stack,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  IconButton,
  Tooltip,
  HStack,
} from '@chakra-ui/react';
import api from 'services/apiConfig';
import { MdAdd, MdSave, MdRefresh, MdSearch, MdWaterDrop, MdElectricBolt, MdFilterAlt, MdCalculate } from 'react-icons/md';

const UtilityBillsCreation = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [availableFloors, setAvailableFloors] = useState([]);
  const [utilityRates, setUtilityRates] = useState({
    waterFeePerM3: 0,
    electricityFeePerKWh: 0
  });
  const [selectedApartments, setSelectedApartments] = useState([]);
  const [formData, setFormData] = useState({
    dueDate: '',
    readings: {}
  });
  const [filterParams, setFilterParams] = useState({
    floor: '',
    status: 'All',
    apartmentNumber: '',
    residentName: '',
  });
  const [success, setSuccess] = useState(false);
  const [filteredApartments, setFilteredApartments] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [totals, setTotals] = useState({
    waterTotal: 0,
    electricityTotal: 0,
    grandTotal: 0
  });

  useEffect(() => {
    fetchInitialData();
    fetchAvailableFloors();
  }, []);

  // Apply filters whenever filter parameters change
  useEffect(() => {
    filterApartmentsList();
  }, [apartments, filterParams]);
  
  // Calculate totals whenever readings change
  useEffect(() => {
    calculateTotals();
  }, [formData.readings, utilityRates]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch utility bills data from API
      const utilityDataResponse = await api.get('/utility-bills');
      
      if (utilityDataResponse.data) {
        const { apartments: apartmentsData, waterFeePerM3, electricityFeePerKWh, defaultDueDate } = utilityDataResponse.data;
        
        setApartments(apartmentsData || []);
        setUtilityRates({
          waterFeePerM3: waterFeePerM3 || 0,
          electricityFeePerKWh: electricityFeePerKWh || 0
        });
        
        // Set default due date if available
        if (defaultDueDate) {
          setFormData(prev => ({
            ...prev,
            dueDate: defaultDueDate
          }));
        }
      }
      
      // Fetch all apartments from apartment API
      const apartmentsResponse = await api.get('/apartments/list');
      if (Array.isArray(apartmentsResponse.data)) {
        setApartments(apartmentsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: 'Error',
        description: 'Unable to load initial data. Please check if the server is running.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setApartments([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchAvailableFloors = async () => {
    try {
      const response = await api.get('/apartments/floors');
      if (Array.isArray(response.data)) {
        setAvailableFloors(response.data);
      }
    } catch (error) {
      console.error("Error fetching floors:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleReadingChange = (apartmentNumber, type, value) => {
    setFormData({
      ...formData,
      readings: {
        ...formData.readings,
        [`${type}_${apartmentNumber}`]: value
      }
    });
  };

  const calculateTotals = () => {
    let waterTotal = 0;
    let electricityTotal = 0;
    
    Object.keys(formData.readings).forEach(key => {
      const value = parseFloat(formData.readings[key]) || 0;
      
      if (key.startsWith('water_')) {
        waterTotal += value * utilityRates.waterFeePerM3;
      } else if (key.startsWith('electricity_')) {
        electricityTotal += value * utilityRates.electricityFeePerKWh;
      }
    });
    
    setTotals({
      waterTotal,
      electricityTotal,
      grandTotal: waterTotal + electricityTotal
    });
  };

  const filterApartmentsList = async () => {
    setIsLoading(true);
    try {
      // Build filter parameters for API call
      let apiFilterParams = {};
      
      if (filterParams.floor) {
        apiFilterParams.floors = filterParams.floor;
      }
      
      if (filterParams.apartmentNumber) {
        apiFilterParams.apartmentNumber = filterParams.apartmentNumber;
      }
      
      if (filterParams.status && filterParams.status !== 'All') {
        apiFilterParams.status = filterParams.status;
      }
      
      // Call apartments filter API
      const response = await api.get('/apartments/filter', { params: apiFilterParams });
      
      if (Array.isArray(response.data)) {
        // Add resident name filtering if needed (since it might not be part of apartment data)
        const filtered = response.data.filter(apartment => {
          // Filter apartments without residents
          if (!apartment.residentName || apartment.residentName.trim() === '') {
            return false;
          }
          
          if (filterParams.residentName && 
              !apartment.residentName.toLowerCase().includes(filterParams.residentName.toLowerCase())) {
            return false;
          }
          return true;
        });
        
        setFilteredApartments(filtered);
      } else {
        setFilteredApartments([]);
      }
    } catch (error) {
      console.error("Error filtering apartments:", error);
      // Fall back to client-side filtering if API call fails
      const filtered = apartments.filter(apartment => {
        // Filter apartments without residents
        if (!apartment.residentName || apartment.residentName.trim() === '') {
          return false;
        }
        
        // Filter by floor
        if (filterParams.floor && !apartment.apartmentNumber.startsWith(filterParams.floor)) {
          return false;
        }
        
        // Filter by apartment number
        if (filterParams.apartmentNumber && 
            !apartment.apartmentNumber.toLowerCase().includes(filterParams.apartmentNumber.toLowerCase())) {
          return false;
        }
        
        // Filter by resident name
        if (filterParams.residentName && 
            !apartment.residentName.toLowerCase().includes(filterParams.residentName.toLowerCase())) {
          return false;
        }
        
        // Filter by status
        if (filterParams.status !== 'All') {
          if (filterParams.status === 'OCCUPIED' && apartment.status !== 'OCCUPIED') {
            return false;
          } else if (filterParams.status === 'VACANT' && apartment.status !== 'VACANT') {
            return false;
          }
        }
        
        return true;
      });
      
      setFilteredApartments(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectApartment = (apartmentNumber) => {
    if (selectedApartments.includes(apartmentNumber)) {
      setSelectedApartments(selectedApartments.filter(num => num !== apartmentNumber));
    } else {
      setSelectedApartments([...selectedApartments, apartmentNumber]);
    }
  };

  const handleSelectAllApartments = () => {
    if (selectedApartments.length === filteredApartments.length) {
      setSelectedApartments([]);
    } else {
      setSelectedApartments(filteredApartments.map(apt => apt.apartmentNumber));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterParams({
      ...filterParams,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFilterParams({
      floor: '',
      status: 'All',
      apartmentNumber: '',
      residentName: '',
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const validateForm = () => {
    if (!formData.dueDate) {
      toast({
        title: 'Error',
        description: 'Please set a due date',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    
    // Check if at least one reading exists
    let hasAtLeastOneReading = false;
    
    for (const key in formData.readings) {
      if (formData.readings[key] && formData.readings[key] > 0) {
        hasAtLeastOneReading = true;
        break;
      }
    }
    
    if (!hasAtLeastOneReading) {
      toast({
        title: 'Error',
        description: 'Please enter at least one meter reading',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    
    return true;
  };

  const handleCreateBills = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Create payload for batch utility bill creation
      const payload = {
        formData: formData.readings,
        dueDate: formData.dueDate
      };
      
      await api.post('/utility-bills/generate', payload);
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Utility bills created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form after successful creation
      setFormData({
        dueDate: '',
        readings: {}
      });
      setSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create utility bills',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentMonth = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Calculate estimated amount for electricity
  const calculateElectricityAmount = (reading) => {
    return reading * utilityRates.electricityFeePerKWh;
  };

  // Calculate estimated amount for water
  const calculateWaterAmount = (reading) => {
    return reading * utilityRates.waterFeePerM3;
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header */}
      <Flex mb='20px' justify='space-between' align='center'>
        <Text color={textColor} fontSize='2xl' fontWeight='700'>
          Utility Bills Creation
        </Text>
      </Flex>
      
      {success && (
        <Alert status='success' mb={4}>
          <AlertIcon />
          <AlertTitle mr={2}>Success!</AlertTitle>
          <AlertDescription>Utility bills have been created successfully.</AlertDescription>
        </Alert>
      )}
      
      {/* Bill Configuration */}
      <Card mb='20px'>
        <Flex p='20px' direction='column'>
          <Text color={textColor} fontSize='xl' fontWeight='600' mb='20px'>
            Bill Configuration
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing='20px'>
            <FormControl isRequired>
              <FormLabel>Due Date</FormLabel>
              <Input
                type='date'
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Period</FormLabel>
              <Input
                type='month'
                defaultValue={getCurrentMonth()}
                readOnly
              />
            </FormControl>

            <Flex direction="column" justify="flex-end">
              <HStack spacing={4}>
                <Flex align="center">
                  <Box mr={2} color="blue.500">
                    <MdWaterDrop size={20} />
                  </Box>
                  <Text fontSize="sm" fontWeight="medium">Water: {formatCurrency(utilityRates.waterFeePerM3)}/m³</Text>
                </Flex>
                <Flex align="center">
                  <Box mr={2} color="yellow.500">
                    <MdElectricBolt size={20} />
                  </Box>
                  <Text fontSize="sm" fontWeight="medium">Electricity: {formatCurrency(utilityRates.electricityFeePerKWh)}/kWh</Text>
                </Flex>
              </HStack>
            </Flex>
          </SimpleGrid>
        </Flex>
      </Card>
      
      {/* Filter and Apartment Selection */}
      <Card mb='20px'>
        <Flex p='20px' direction='column'>
          <Flex justify="space-between" align="center" mb={4}>
            <Text color={textColor} fontSize='xl' fontWeight='600'>
              Utility Readings Input
            </Text>
            
            <Button
              leftIcon={<MdFilterAlt />}
              variant='outline'
              size="sm"
              onClick={toggleFilters}
            >
              Filters
            </Button>
          </Flex>
          
          {showFilters && (
            <Box mb={4}>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing='20px' mb={4}>
                <FormControl>
                  <FormLabel>Floor</FormLabel>
                  <Select
                    name="floor"
                    value={filterParams.floor}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Floors</option>
                    {availableFloors.map(floor => (
                      <option key={floor} value={floor}>{floor}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Apartment Number</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents='none'>
                      <MdSearch color='gray.300' />
                    </InputLeftElement>
                    <Input 
                      placeholder='Search by apartment number'
                      name="apartmentNumber"
                      value={filterParams.apartmentNumber}
                      onChange={handleFilterChange}
                    />
                  </InputGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Resident Name</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents='none'>
                      <MdSearch color='gray.300' />
                    </InputLeftElement>
                    <Input 
                      placeholder='Search by resident name'
                      name="residentName"
                      value={filterParams.residentName}
                      onChange={handleFilterChange}
                    />
                  </InputGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    name="status"
                    value={filterParams.status}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="VACANT">Vacant</option>
                    <option value="PENDING">Pending</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              
              <Flex>
                <Button 
                  variant='outline' 
                  mr='10px'
                  onClick={resetFilters}
                  size="sm"
                >
                  Reset Filters
                </Button>
                
                <Button 
                  leftIcon={<MdRefresh />}
                  variant='outline' 
                  colorScheme='blue'
                  onClick={fetchInitialData}
                  size="sm"
                >
                  Refresh Data
                </Button>
              </Flex>
            </Box>
          )}
          
          <Divider mb={4} />
          
          {isLoading ? (
            <Flex justify='center' align='center' height='200px'>
              <Spinner size='xl' color='brand.500' />
            </Flex>
          ) : (
            <>
              <Box overflowX='auto'>
                <Table variant='simple'>
                  <Thead>
                    <Tr>
                      <Th width="50px">
                        <Checkbox
                          isChecked={selectedApartments.length === filteredApartments.length && filteredApartments.length > 0}
                          onChange={handleSelectAllApartments}
                        />
                      </Th>
                      <Th>Apartment</Th>
                      <Th>Floor</Th>
                      <Th>Area (m²)</Th>
                      <Th>Type</Th>
                      <Th>Resident</Th>
                      <Th>
                        <Flex align="center">
                          <MdWaterDrop color="blue" />
                          <Text ml={1}>Water (m³)</Text>
                        </Flex>
                      </Th>
                      <Th>Water Amount</Th>
                      <Th>
                        <Flex align="center">
                          <MdElectricBolt color="orange" />
                          <Text ml={1}>Electricity (kWh)</Text>
                        </Flex>
                      </Th>
                      <Th>Electricity Amount</Th>
                      <Th>Total Amount</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredApartments.length === 0 ? (
                      <Tr>
                        <Td colSpan={11} textAlign='center' py='20px'>
                          <Text>No apartments match the filter criteria</Text>
                        </Td>
                      </Tr>
                    ) : (
                      filteredApartments.map(apartment => {
                        const waterReading = formData.readings[`water_${apartment.apartmentNumber}`] || '';
                        const electricityReading = formData.readings[`electricity_${apartment.apartmentNumber}`] || '';
                        const waterAmount = waterReading ? calculateWaterAmount(waterReading) : 0;
                        const electricityAmount = electricityReading ? calculateElectricityAmount(electricityReading) : 0;
                        const totalAmount = waterAmount + electricityAmount;
                        
                        return (
                          <Tr key={apartment.id}>
                            <Td>
                              <Checkbox
                                isChecked={selectedApartments.includes(apartment.apartmentNumber)}
                                onChange={() => handleSelectApartment(apartment.apartmentNumber)}
                              />
                            </Td>
                            <Td>{apartment.apartmentNumber}</Td>
                            <Td>{apartment.floor}</Td>
                            <Td>{apartment.area} m²</Td>
                            <Td>{apartment.type}</Td>
                            <Td>{apartment.residentName}</Td>
                            <Td>
                              <NumberInput 
                                min={0} 
                                max={9999}
                                precision={2}
                              >
                                <NumberInputField
                                  placeholder="Water reading"
                                  value={waterReading}
                                  onChange={(e) => handleReadingChange(apartment.apartmentNumber, 'water', e.target.value)}
                                />
                              </NumberInput>
                            </Td>
                            <Td>
                              {waterReading ? 
                                formatCurrency(waterAmount) : '-'}
                            </Td>
                            <Td>
                              <NumberInput 
                                min={0} 
                                max={9999}
                                precision={2}
                              >
                                <NumberInputField
                                  placeholder="Electricity reading"
                                  value={electricityReading}
                                  onChange={(e) => handleReadingChange(apartment.apartmentNumber, 'electricity', e.target.value)}
                                />
                              </NumberInput>
                            </Td>
                            <Td>
                              {electricityReading ? 
                                formatCurrency(electricityAmount) : '-'}
                            </Td>
                            <Td fontWeight="bold">
                              {(waterReading || electricityReading) ? 
                                formatCurrency(totalAmount) : '-'}
                            </Td>
                          </Tr>
                        );
                      })
                    )}
                  </Tbody>
                  <Thead>
                    <Tr>
                      <Th colSpan={7} textAlign="right">Total:</Th>
                      <Th>{formatCurrency(totals.waterTotal)}</Th>
                      <Th></Th>
                      <Th>{formatCurrency(totals.electricityTotal)}</Th>
                      <Th>{formatCurrency(totals.grandTotal)}</Th>
                    </Tr>
                  </Thead>
                </Table>
              </Box>
              
              <Flex mt={4} justify="space-between" align="center">
                <HStack spacing={4}>
                  <Text fontWeight="bold">Water Total: {formatCurrency(totals.waterTotal)}</Text>
                  <Text fontWeight="bold">Electricity Total: {formatCurrency(totals.electricityTotal)}</Text>
                  <Text fontWeight="bold" fontSize="lg" color="brand.500">Grand Total: {formatCurrency(totals.grandTotal)}</Text>
                </HStack>
                
                <Button
                  leftIcon={<MdSave />}
                  colorScheme="brand"
                  onClick={handleCreateBills}
                  isLoading={isSubmitting}
                >
                  Generate Utility Bills
                </Button>
              </Flex>
            </>
          )}
        </Flex>
      </Card>
    </Box>
  );
};

export default UtilityBillsCreation; 