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
} from '@chakra-ui/react';
import * as React from 'react';
import { MdCheckCircle } from 'react-icons/md';
import { WarningIcon } from '@chakra-ui/icons';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function ApartmentFilterModal({ isOpen, onClose, onFilterSuccess }) {
  const toast = useToast();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const [filters, setFilters] = React.useState({
    apartmentNumber: '',
    roomNumber: '',
    floors: '',
    minArea: '',
    maxArea: '',
    status: '',
    type: '',
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

      // Chuyển dấu phẩy thành dấu | trước khi gửi API
      const filterParams = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null) {
          if (['floors', 'status', 'type'].includes(key)) {
            acc[key] = value.replace(/,/g, '|');
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {});

      const response = await axios.get(`${API_BASE_URL}/api/apartments/filter`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: filterParams,
      });

      const newData = response.data.data || response.data;
      if (newData.length === 0) {
        toast({
          title: 'No available apartments',
          description: 'No apartments match the provided filters.',
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
      console.error('Error fetching apartments:', error);
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
      apartmentNumber: '',
      roomNumber: '',
      floors: '',
      minArea: '',
      maxArea: '',
      status: '',
      type: '',
      filterLogic: 'AND',
    });
    setError([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Filter Apartments</ModalHeader>
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
                    Apartment Number<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    name="apartmentNumber"
                    value={filters.apartmentNumber}
                    onChange={handleFilterChange}
                    placeholder="Enter apartment number"
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
                    Room Number<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    name="roomNumber"
                    value={filters.roomNumber}
                    onChange={handleFilterChange}
                    placeholder="Enter room number"
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
                    Min Area<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    name="minArea"
                    type="number"
                    value={filters.minArea}
                    onChange={handleFilterChange}
                    placeholder="Enter min area"
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
                    Max Area<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    name="maxArea"
                    type="number"
                    value={filters.maxArea}
                    onChange={handleFilterChange}
                    placeholder="Enter max area"
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
                  <Input
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    placeholder="Enter statuses (e.g., AVAILABLE,OCCUPIED)"
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
                    Type<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    placeholder="Enter types (e.g., PENTHOUSE,KIOT,STANDARD)"
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                  />
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