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
} from '@chakra-ui/react';
import api from 'services/apiConfig';
import { MdAdd, MdSave, MdRefresh, MdSearch } from 'react-icons/md';

const BatchBillCreation = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [feeUnits, setFeeUnits] = useState([]);
  const [selectedApartments, setSelectedApartments] = useState([]);
  const [formData, setFormData] = useState({
    billType: '',
    dueDate: '',
    meterReading: {}
  });
  const [filterParams, setFilterParams] = useState({
    floor: '',
    status: 'active',
    apartmentNumber: '',
    residentName: '',
  });
  const [success, setSuccess] = useState(false);
  const [filteredApartments, setFilteredApartments] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Apply filters whenever filter parameters change
  useEffect(() => {
    filterApartmentsList();
  }, [apartments, filterParams]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch all apartments from the correct endpoint
      const apartmentsResponse = await api.get('/admin/apartment-list');
      if (Array.isArray(apartmentsResponse.data)) {
        setApartments(apartmentsResponse.data);
      } else {
        setApartments(apartmentsResponse.data?.apartments || []);
      }
      
      // Fetch all fee units
      const feeUnitsResponse = await api.get('/fee-units');
      if (Array.isArray(feeUnitsResponse.data)) {
        setFeeUnits(feeUnitsResponse.data);
      } else {
        setFeeUnits(feeUnitsResponse.data?.feeUnits || []);
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
      setFeeUnits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeSelect = (billType) => {
    setFormData({
      ...formData,
      billType,
      meterReading: {}
    });

    // Reset selections
    setSelectedApartments([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleMeterReadingChange = (apartmentId, value) => {
    setFormData({
      ...formData,
      meterReading: {
        ...formData.meterReading,
        [apartmentId]: Number(value)
      }
    });
  };

  const filterApartmentsList = () => {
    const filtered = apartments.filter(apartment => {
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
          !(apartment.residentName && 
            apartment.residentName.toLowerCase().includes(filterParams.residentName.toLowerCase()))) {
        return false;
      }
      
      // Filter by status
      if (filterParams.status === 'active' && !apartment.isActive) {
        return false;
      } else if (filterParams.status === 'inactive' && apartment.isActive) {
        return false;
      }
      
      return true;
    });
    
    setFilteredApartments(filtered);
  };

  const handleSelectApartment = (apartmentId) => {
    if (selectedApartments.includes(apartmentId)) {
      setSelectedApartments(selectedApartments.filter(id => id !== apartmentId));
    } else {
      setSelectedApartments([...selectedApartments, apartmentId]);
    }
  };

  const handleSelectAllApartments = () => {
    if (selectedApartments.length === filteredApartments.length) {
      setSelectedApartments([]);
    } else {
      setSelectedApartments(filteredApartments.map(apt => apt.id));
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
      status: 'active',
      apartmentNumber: '',
      residentName: '',
    });
  };

  const validateForm = () => {
    if (!formData.billType) {
      toast({
        title: 'Error',
        description: 'Please select a bill type',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    
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
    
    if (selectedApartments.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one apartment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    
    // For each selected apartment, check if meter reading exists
    for (const aptId of selectedApartments) {
      if (!formData.meterReading[aptId] && formData.meterReading[aptId] !== 0) {
        toast({
          title: 'Error',
          description: 'Please enter meter readings for all selected apartments',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
    }
    
    return true;
  };

  const handleCreateBills = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Create payload for batch bill creation
      const payload = {
        billType: formData.billType,
        dueDate: formData.dueDate,
        apartments: selectedApartments.map(aptId => ({
          apartmentId: aptId,
          meterReading: formData.meterReading[aptId]
        }))
      };
      
      await api.post('/bills/batch', payload);
      
      // Show success message
      toast({
        title: 'Success',
        description: `Created ${selectedApartments.length} bills successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form after successful creation
      setFormData({
        billType: '',
        dueDate: '',
        meterReading: {}
      });
      setSelectedApartments([]);
      setSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create bills',
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

  // Find fee unit price based on selected bill type
  const getFeeUnitPrice = () => {
    const selectedFeeUnit = feeUnits.find(unit => unit.code === formData.billType);
    return selectedFeeUnit ? selectedFeeUnit.price : 0;
  };

  // Calculate estimated amount for a meter reading
  const calculateEstimatedAmount = (meterReading) => {
    const unitPrice = getFeeUnitPrice();
    return meterReading * unitPrice;
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header */}
      <Flex mb='20px' justify='space-between' align='center'>
        <Text color={textColor} fontSize='2xl' fontWeight='700'>
          Batch Utility Bill Creation
        </Text>
      </Flex>
      
      {success && (
        <Alert status='success' mb={4}>
          <AlertIcon />
          <AlertTitle mr={2}>Success!</AlertTitle>
          <AlertDescription>Bills have been created successfully.</AlertDescription>
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
              <FormLabel>Bill Type</FormLabel>
              <Select 
                placeholder='Select bill type'
                value={formData.billType}
                name="billType"
                onChange={handleInputChange}
              >
                {feeUnits.filter(unit => unit.active).map(unit => (
                  <option key={unit.id} value={unit.code}>
                    {unit.name} ({formatCurrency(unit.price)}/{unit.unit})
                  </option>
                ))}
              </Select>
            </FormControl>
            
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
          </SimpleGrid>
        </Flex>
      </Card>
      
      {/* Filter and Apartment Selection */}
      <Card mb='20px'>
        <Flex p='20px' direction='column'>
          <Text color={textColor} fontSize='xl' fontWeight='600' mb='20px'>
            Filters
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing='20px' mb={4}>
            <FormControl>
              <FormLabel>Floor</FormLabel>
              <Input 
                placeholder='Enter floor number'
                name="floor"
                value={filterParams.floor}
                onChange={handleFilterChange}
              />
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormControl>
          </SimpleGrid>
          
          <Flex justify="space-between" align="center" mb={4}>
            <Flex>
              <Button 
                variant='outline' 
                mr='10px'
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
              
              <Button 
                leftIcon={<MdRefresh />}
                variant='outline' 
                colorScheme='blue'
                onClick={fetchInitialData}
              >
                Refresh Data
              </Button>
            </Flex>
            
            <Text fontWeight="bold">
              {selectedApartments.length} apartments selected
            </Text>
          </Flex>
          
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
                      <Th>Resident</Th>
                      <Th>Meter Reading</Th>
                      <Th>Est. Amount</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredApartments.length === 0 ? (
                      <Tr>
                        <Td colSpan={5} textAlign='center' py='20px'>
                          <Text>No apartments match the filter criteria</Text>
                        </Td>
                      </Tr>
                    ) : (
                      filteredApartments.map(apartment => (
                        <Tr key={apartment.id}>
                          <Td>
                            <Checkbox
                              isChecked={selectedApartments.includes(apartment.id)}
                              onChange={() => handleSelectApartment(apartment.id)}
                              isDisabled={!formData.billType}
                            />
                          </Td>
                          <Td>{apartment.apartmentNumber}</Td>
                          <Td>{apartment.residentName || 'No resident'}</Td>
                          <Td>
                            <NumberInput 
                              min={0} 
                              max={9999} 
                              isDisabled={!selectedApartments.includes(apartment.id) || !formData.billType}
                            >
                              <NumberInputField
                                placeholder="Enter reading"
                                value={formData.meterReading[apartment.id] || ''}
                                onChange={(e) => handleMeterReadingChange(apartment.id, e.target.value)}
                              />
                            </NumberInput>
                          </Td>
                          <Td>
                            {formData.meterReading[apartment.id] ? 
                              formatCurrency(calculateEstimatedAmount(formData.meterReading[apartment.id])) : '-'}
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
              
              <Flex mt={4} justify="flex-end">
                <Button
                  leftIcon={<MdSave />}
                  colorScheme="brand"
                  onClick={handleCreateBills}
                  isLoading={isSubmitting}
                  isDisabled={!formData.billType || selectedApartments.length === 0}
                >
                  Create Bills
                </Button>
              </Flex>
            </>
          )}
        </Flex>
      </Card>
    </Box>
  );
};

export default BatchBillCreation; 