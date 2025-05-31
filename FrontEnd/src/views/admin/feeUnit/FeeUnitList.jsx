import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  IconButton,
  Spinner,
  NumberInput,
  NumberInputField,
  Select,
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import api from 'services/apiConfig';
import { 
  MdAdd,
  MdEdit,
  MdDelete,
} from 'react-icons/md';

const FeeUnitList = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const toast = useToast();

  const [feeUnits, setFeeUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFeeUnit, setCurrentFeeUnit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: 0,
    unit: '',
    description: '',
    active: true
  });

  // Modal controls
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  useEffect(() => {
    fetchFeeUnits();
  }, []);

  const fetchFeeUnits = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/fee-units');
      // Đảm bảo feeUnits luôn là một mảng
      if (!response.data) {
        setFeeUnits([]);
      } else if (Array.isArray(response.data)) {
        setFeeUnits(response.data);
      } else if (response.data.feeUnits && Array.isArray(response.data.feeUnits)) {
        setFeeUnits(response.data.feeUnits);
      } else {
        setFeeUnits([]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to fetch fee units',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setFeeUnits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddForm = () => {
    setCurrentFeeUnit(null);
    setFormData({
      name: '',
      code: '',
      price: 0,
      unit: '',
      description: '',
      active: true
    });
    onFormOpen();
  };

  const openEditForm = (feeUnit) => {
    setCurrentFeeUnit(feeUnit);
    setFormData({
      name: feeUnit.name,
      code: feeUnit.code,
      price: feeUnit.price,
      unit: feeUnit.unit,
      description: feeUnit.description || '',
      active: feeUnit.active
    });
    onFormOpen();
  };

  const openDeleteConfirm = (feeUnit) => {
    setCurrentFeeUnit(feeUnit);
    onDeleteOpen();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNumberChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === 'true'
    });
  };

  const handleSubmit = async () => {
    try {
      if (currentFeeUnit) {
        // Update existing fee unit
        await api.put(`/fee-units/${currentFeeUnit.id}`, formData);
        toast({
          title: 'Success',
          description: 'Fee unit updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new fee unit
        await api.post('/fee-units', formData);
        toast({
          title: 'Success',
          description: 'Fee unit created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onFormClose();
      fetchFeeUnits();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    if (!currentFeeUnit) return;
    
    try {
      await api.delete(`/fee-units/${currentFeeUnit.id}`);
      toast({
        title: 'Success',
        description: 'Fee unit deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
      fetchFeeUnits();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Unable to delete fee unit',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header */}
      <Flex mb='20px' justify='space-between' align='center'>
        <Text color={textColor} fontSize='2xl' fontWeight='700'>
          Fee Unit Management
        </Text>
        
        <Button
          leftIcon={<MdAdd />}
          variant='brand'
          onClick={openAddForm}
        >
          Add New Fee Unit
        </Button>
      </Flex>
      
      {/* Fee Unit List */}
      <Card>
        <Flex p='20px' justify='space-between' align='center'>
          <Text color={textColor} fontSize='xl' fontWeight='600'>
            Fee Units
          </Text>
        </Flex>
        
        <Box overflowX='auto'>
          {isLoading ? (
            <Flex justify='center' align='center' height='200px'>
              <Spinner size='xl' color='brand.500' />
            </Flex>
          ) : (
            <Table variant='simple'>
              <Thead>
                <Tr>
                  <Th>Code</Th>
                  <Th>Name</Th>
                  <Th>Price</Th>
                  <Th>Unit</Th>
                  <Th>Description</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {feeUnits.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign='center' py='20px'>
                      <Text>No fee units found</Text>
                    </Td>
                  </Tr>
                ) : (
                  feeUnits.map(feeUnit => (
                    <Tr key={feeUnit.id}>
                      <Td>{feeUnit.code}</Td>
                      <Td>{feeUnit.name}</Td>
                      <Td>{formatCurrency(feeUnit.price)}</Td>
                      <Td>{feeUnit.unit}</Td>
                      <Td>{feeUnit.description || '-'}</Td>
                      <Td>{feeUnit.active ? 'Active' : 'Inactive'}</Td>
                      <Td>
                        <Flex>
                          <IconButton
                            icon={<MdEdit />}
                            variant='ghost'
                            aria-label='Edit'
                            mr={2}
                            onClick={() => openEditForm(feeUnit)}
                          />
                          <IconButton
                            icon={<MdDelete />}
                            variant='ghost'
                            colorScheme='red'
                            aria-label='Delete'
                            onClick={() => openDeleteConfirm(feeUnit)}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          )}
        </Box>
      </Card>
      
      {/* Add/Edit Fee Unit Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentFeeUnit ? 'Edit Fee Unit' : 'Add New Fee Unit'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4}>
              <FormLabel>Code</FormLabel>
              <Input 
                name="code" 
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Enter fee unit code"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Name</FormLabel>
              <Input 
                name="name" 
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter fee unit name"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Price</FormLabel>
              <NumberInput min={0}>
                <NumberInputField 
                  name="price"
                  value={formData.price}
                  onChange={(e) => handleNumberChange('price', Number(e.target.value))}
                  placeholder="Enter price"
                />
              </NumberInput>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Unit</FormLabel>
              <Input 
                name="unit" 
                value={formData.unit}
                onChange={handleInputChange}
                placeholder="Enter unit (e.g., kWh, m³)"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Input 
                name="description" 
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Status</FormLabel>
              <Select 
                name="active"
                value={formData.active.toString()}
                onChange={handleSelectChange}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button colorScheme='brand' mr={3} onClick={handleSubmit}>
              {currentFeeUnit ? 'Update' : 'Save'}
            </Button>
            <Button onClick={onFormClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Fee Unit</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            Are you sure you want to delete this fee unit?<br />
            <Text fontWeight="bold">{currentFeeUnit?.name}</Text>
          </ModalBody>
          
          <ModalFooter>
            <Button colorScheme='red' mr={3} onClick={handleDelete}>
              Delete
            </Button>
            <Button onClick={onDeleteClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FeeUnitList; 