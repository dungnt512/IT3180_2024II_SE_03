import {
    Flex,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    RadioGroup,
    Radio,
    HStack,
    Spinner,
    useToast,
    useColorModeValue,
    Box,
    Text,
    Select,
  } from '@chakra-ui/react';
  import * as React from 'react';
  import { MdCheckCircle } from 'react-icons/md';
  import { WarningIcon } from '@chakra-ui/icons';
  import axios from 'axios';
  
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  
  export default function UserFilterModal({ isOpen, onClose, onFilterSuccess }) {
    const toast = useToast();
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const brandStars = useColorModeValue('brand.500', 'brand.400');
    const [filters, setFilters] = React.useState({
      fullname: '',
      username: '',
      apartment: '',
      floors: '',
      status: '',
      role: '',
      filterLogic: 'AND',
    });
    const [isFiltering, setIsFiltering] = React.useState(false);
    const [filterSuccess, setFilterSuccess] = React.useState(false);
    const [error, setError] = React.useState([]);
  
    const fetchFilteredData = async () => {
      setIsFiltering(true);
      setFilterSuccess(false);
      setError([]);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found');
        }
  
        // Map status to boolean and handle apartment/floors with | delimiter
        const filterParams = Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== '' && value !== null && value !== 'None') {
            if (['apartment', 'floors'].includes(key)) {
              acc[key] = value.replace(/,/g, '|');
            } else if (key === 'status') {
              acc[key] = value === 'ACTIVATED' ? 'true' : 'false';
            } else {
              acc[key] = value;
            }
          }
          return acc;
        }, {});
  
        const response = await axios.get(`${API_BASE_URL}/api/residents/admin/filter`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: filterParams,
        });
  
        const newData = response.data.data || response.data;
        if (newData.length === 0) {
          toast({
            title: 'No available users',
            description: 'No users match the provided filters.',
            status: 'info',
            duration: 5000,
            isClosable: true,
          });
        }
        setFilterSuccess(true);
        setTimeout(() => {
          setIsFiltering(false);
          setFilterSuccess(false);
          onFilterSuccess(newData);
          onClose();
        }, 1000);
      } catch (error) {
        console.error('Error fetching users:', error);
        const errorMessage = error.message || 'An error occurred while applying filters.';
        setError([errorMessage]);
        setIsFiltering(false);
      }
    };
  
    const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
  
    const handleFilterLogicChange = (value) => {
      setFilters((prev) => ({
        ...prev,
        filterLogic: value,
      }));
    };
  
    const handleFilterSubmit = (e) => {
      e.preventDefault();
      fetchFilteredData();
    };
  
    const handleResetFilters = () => {
      setFilters({
        fullname: '',
        username: '',
        apartment: '',
        floors: '',
        status: '',
        role: '',
        filterLogic: 'AND',
      });
      setError([]);
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Filter Users</ModalHeader>
          <ModalBody>
            <form onSubmit={handleFilterSubmit}>
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
                      Full Name<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Input
                      name="fullname"
                      value={filters.fullname}
                      onChange={handleFilterChange}
                      placeholder="Enter full name"
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: '0px', md: '0px' }}
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                      mb="8px"
                    >
                      Username<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Input
                      name="username"
                      value={filters.username}
                      onChange={handleFilterChange}
                      placeholder="Enter username"
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: '0px', md: '0px' }}
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                      mb="8px"
                    >
                      Apartment<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Input
                      name="apartment"
                      value={filters.apartment}
                      onChange={handleFilterChange}
                      placeholder="Enter apartments (e.g., A101,A102)"
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: '0px', md: '0px' }}
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                      mb="8px"
                    >
                      Filter Logic<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <RadioGroup
                      name="filterLogic"
                      value={filters.filterLogic}
                      onChange={handleFilterLogicChange}
                    >
                      <HStack spacing="24px">
                        <Radio value="AND" fontSize="sm">
                          And
                        </Radio>
                        <Radio value="OR" fontSize="sm">
                          Or
                        </Radio>
                      </HStack>
                    </RadioGroup>
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
                      Floors<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Input
                      name="floors"
                      value={filters.floors}
                      onChange={handleFilterChange}
                      placeholder="Enter floors (e.g., 1,2,3)"
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: '0px', md: '0px' }}
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                      mb="8px"
                    >
                      Status<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      placeholder="Select status"
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: '0px', md: '0px' }}
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                    >
                      <option value="None">None</option>
                      <option value="ACTIVATED">ACTIVATED</option>
                      <option value="UNACTIVATED">UNACTIVATED</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                      mb="8px"
                    >
                      Role<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Select
                      name="role"
                      value={filters.role}
                      onChange={handleFilterChange}
                      placeholder="Select role"
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: '0px', md: '0px' }}
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                    >
                      <option value="None">None</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="USER">USER</option>
                    </Select>
                  </FormControl>
                  {error.length > 0 && (
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
                          <WarningIcon boxSize={4} color="red.500" mr={2} />
                          {errMsg}
                        </Text>
                      ))}
                    </Box>
                  )}
                </Box>
              </Flex>
            </form>
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
              mr={3}
              onClick={handleResetFilters}
            >
              Reset
            </Button>
            <Button
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="10px"
              px="15px"
              py="5px"
              onClick={handleFilterSubmit}
              isDisabled={isFiltering}
              leftIcon={
                isFiltering ? (
                  <Spinner size="sm" />
                ) : filterSuccess ? (
                  <MdCheckCircle />
                ) : null
              }
            >
              {isFiltering ? 'Filtering...' : filterSuccess ? 'Success' : 'Filter'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }