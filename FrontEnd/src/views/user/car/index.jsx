import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Select,
  useColorModeValue,
  useColorMode,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Spinner,
} from '@chakra-ui/react';
import axios from 'axios';
import { FaCar, FaBuilding, FaDoorOpen, FaArrowUp, FaMotorcycle, FaSwimmingPool, FaCheck } from 'react-icons/fa';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function ParkingBookingPage() {
  const { colorMode } = useColorMode();
  const toast = useToast();

  // Chakra Color Mode
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorBrand = useColorModeValue('brand.700', 'brand.400');
  const menuBg = useColorModeValue('white', 'navy.800');
  const layoutBg = useColorModeValue('blue.50', 'navy.900');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)',
  );
  const spotAvailableColor = useColorModeValue('green.100', 'green.700');
  const spotBookedColor = useColorModeValue('gray.300', 'gray.600');
  const spotSelectedColor = useColorModeValue('blue.200', 'blue.500');

  // State for selected building and parking spots
  const [selectedBuilding, setSelectedBuilding] = useState('A');
  const [parkingSpots, setParkingSpots] = useState({
    A: Array.from({ length: 96 }, (_, i) => ({
      id: `A${i + 1}`,
      section: 'A',
      status: 'available',
      booked: false,
    })),
    B: Array.from({ length: 96 }, (_, i) => ({
      id: `B${i + 1}`,
      section: 'B',
      status: 'available',
      booked: false,
    })),
    C: Array.from({ length: 96 }, (_, i) => ({
      id: `C${i + 1}`,
      section: 'C',
      status: 'available',
      booked: false,
    })),
  });
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    apartmentNumber: '',
    parkingLotCode: '',
    endDate: '',
    plate: '',
  });
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle, loading, success
  const [apartmentNumbers, setApartmentNumbers] = useState([]);

  // Fetch available parking lots from API
  useEffect(() => {
    const fetchAvailableLots = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/parking-rentals/available-parking-lots`);
        const availableLots = response.data;

        // Update parking spots state based on API response
        setParkingSpots((prev) => {
          const updatedSpots = { ...prev };
          Object.keys(updatedSpots).forEach((building) => {
            updatedSpots[building] = updatedSpots[building].map((spot) => {
              const isAvailable = availableLots.some((lot) => lot.lotCode === spot.id && lot.status === 'AVAILABLE');
              return { ...spot, booked: !isAvailable };
            });
          });
          return updatedSpots;
        });
      } catch (error) {
        toast({
          title: 'Error fetching available parking lots',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchAvailableLots();
  }, [toast]);

  useEffect(() => {
    if (isModalOpen) {
      const fetchApartmentNumbers = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/api/user/home`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const data = await response.json();
          const apartments = data.resident?.apartmentNumbers || [];
          setApartmentNumbers(apartments);
  
          if (apartments.length > 0) {
            setFormData((prev) => ({ ...prev, apartmentNumber: apartments[0] }));
          }
        } catch (error) {
          toast({
            title: 'Error fetching apartment numbers',
            description: error.message,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      };
  
      fetchApartmentNumbers();
    }
  }, [isModalOpen, toast]);
  
  // Handle spot selection
  const handleSpotClick = (spot) => {
    if (spot.booked) {
      toast({
        title: 'Spot already booked',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    setSelectedSpot(spot.id);
    setFormData((prev) => ({ ...prev, parkingLotCode: spot.id }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle booking submission
  const handleBookSpot = () => {
    if (!selectedSpot) {
      toast({
        title: 'Please select a spot',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      const { apartmentNumber, parkingLotCode, endDate, plate } = formData;
  
      if (!apartmentNumber || !parkingLotCode || !endDate || !plate) {
        toast({
          title: 'Please fill in all fields',
          status: 'warning',
          duration: 2000,
          isClosable: true,
        });
        return;
      }
  
      setSubmitStatus('loading');
  
      const requestBody = {
        parkingLotCode: parkingLotCode,
        endDate: endDate,
        plate: plate,
      };
  
      console.log("Sending body JSON to server:", JSON.stringify(requestBody, null, 2));
  
      await axios.post(
        `${API_BASE_URL}/api/parking-rentals/new?apartmentNumber=${encodeURIComponent(apartmentNumber)}`,
        requestBody
      );
  
      setSubmitStatus('success');
  
      setParkingSpots((prev) => ({
        ...prev,
        [selectedBuilding]: prev[selectedBuilding].map((spot) =>
          spot.id === selectedSpot ? { ...spot, booked: true } : spot
        ),
      }));
  
      toast({
        title: `Spot ${selectedSpot} booked successfully!`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
  
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitStatus('idle');
        setSelectedSpot(null);
        setFormData({
          apartmentNumber: '',
          parkingLotCode: '',
          endDate: '',
          plate: '',
        });
      }, 1000);
    } catch (error) {
      setSubmitStatus('idle');
      toast({
        title: 'Booking failed',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Group spots into pairs and then into 6 columns
  const spots = parkingSpots[selectedBuilding];
  const pairedSpots = [];
  for (let i = 0; i < spots.length; i += 2) {
    if (i + 1 < spots.length) {
      pairedSpots.push([spots[i], spots[i + 1]]);
    } else {
      pairedSpots.push([spots[i]]);
    }
  }

  // Split into 6 columns, each with 8 pairs
  const columns = [[], [], [], [], [], []];
  pairedSpots.forEach((pair, index) => {
    const columnIndex = Math.floor(index / 8);
    if (columnIndex < 6) {
      columns[columnIndex].push(pair);
    }
  });

  return (
    <Box p="20px" bg={menuBg} minH="100vh" mt="60px">
      <Text
        fontSize="2xl"
        fontWeight="700"
        color={textColor}
        mb="20px"
        textAlign="center"
      >
        Parking Spot Booking
      </Text>

      {/* Building Selection */}
      <Flex justify="center" mb="40px">
        <Select
          value={selectedBuilding}
          onChange={(e) => setSelectedBuilding(e.target.value)}
          w="200px"
          bg={menuBg}
          borderRadius="10px"
          boxShadow={shadow}
          color={textColor}
          _hover={{ borderColor: textColorBrand }}
        >
          <option value="A">Building A</option>
          <option value="B">Building B</option>
          <option value="C">Building C</option>
        </Select>
      </Flex>

      {/* Entrances/Exits */}
      <Flex justify="space-between" mb="30px" px="50px">
        <Flex align="center" gap="20px">
          <Flex align="center" bg="gray.100" p="10px" borderRadius="10px">
            <FaDoorOpen size="20px" color={textColorBrand} />
            <Text fontSize="md" fontWeight="600" color={textColorBrand} ml="5px">
              Entrance 1{selectedBuilding}
            </Text>
          </Flex>
          <Flex align="center" bg="gray.100" p="10px" borderRadius="10px">
            <FaSwimmingPool size="20px" color={textColorBrand} />
            <Text fontSize="md" fontWeight="600" color={textColorBrand} ml="5px">
              Swimming Pool
            </Text>
          </Flex>
        </Flex>
        <Flex align="center" gap="20px">
          <Flex align="center" bg="gray.100" p="10px" borderRadius="10px">
            <FaDoorOpen size="20px" color={textColorBrand} />
            <Text fontSize="md" fontWeight="600" color={textColorBrand} ml="5px">
              Entrance 2{selectedBuilding}
            </Text>
          </Flex>
          <Flex align="center" bg="gray.100" p="10px" borderRadius="10px">
            <FaBuilding size="20px" color={textColorBrand} />
            <Text fontSize="md" fontWeight="600" color={textColorBrand} ml="5px">
              Shopping Center
            </Text>
          </Flex>
        </Flex>
      </Flex>

      {/* Parking Layout */}
      <Flex direction="column" align="center">
        <Box mb="40px" w="100%" maxW="1400px">
          <Flex justify="space-between" align="center" mb="10px">
            <Flex align="center">
              <FaBuilding size="20px" color={textColor} />
              <Text fontSize="lg" fontWeight="600" color={textColor} ml="5px">
                Building {selectedBuilding}
              </Text>
            </Flex>
            <Flex align="center">
              <FaArrowUp size="16px" color="gray.500" />
              <Text fontSize="sm" color="gray.500" ml="5px">
                Near Elevator 1.{selectedBuilding}
              </Text>
            </Flex>
          </Flex>
          <Flex
            direction="row"
            gap="50px"
            p="20px"
            borderRadius="20px"
            boxShadow={shadow}
            bg={layoutBg}
            maxW="100%"
          >
            {columns.map((column, colIndex) => (
              <Flex key={colIndex} direction="column" gap="10px">
                {column.map((pair, pairIndex) => (
                  <Flex key={pairIndex} direction="row" gap="10px">
                    {pair.map((spot) => (
                      <Box
                        key={spot.id}
                        w="80px"
                        h="50px"
                        borderRadius="8px"
                        bg={
                          spot.booked
                            ? spotBookedColor
                            : selectedSpot === spot.id
                            ? spotSelectedColor
                            : spotAvailableColor
                        }
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        cursor={spot.booked ? 'not-allowed' : 'pointer'}
                        onClick={() => handleSpotClick(spot)}
                        transition="all 0.2s"
                        _hover={
                          !spot.booked && { transform: 'scale(1.05)', boxShadow: 'md' }
                        }
                      >
                        {selectedBuilding === 'B' ? (
                          <FaMotorcycle size="20px" color={spot.booked ? 'gray' : 'green'} />
                        ) : (
                          <FaCar size="20px" color={spot.booked ? 'gray' : 'green'} />
                        )}
                        <Text fontSize="sm" ml="5px" color={textColor}>
                          {spot.id}
                        </Text>
                      </Box>
                    ))}
                  </Flex>
                ))}
              </Flex>
            ))}
          </Flex>
        </Box>
      </Flex>

      {/* Exits and Elevators */}
      <Flex justify="space-between" mt="30px" px="50px">
        <Flex align="center" bg="gray.100" p="10px" borderRadius="10px">
          <FaDoorOpen size="20px" color={textColorBrand} />
          <Text fontSize="md" fontWeight="600" color={textColorBrand} ml="5px">
            Exit 1{selectedBuilding}
          </Text>
        </Flex>
        <Flex align="center" bg="gray.100" p="10px" borderRadius="10px">
          <FaArrowUp size="20px" color={textColorBrand} />
          <Text fontSize="md" fontWeight="600" color={textColorBrand} ml="5px">
            Residential Area
          </Text>
        </Flex>
        <Flex align="center" bg="gray.100" p="10px" borderRadius="10px">
          <FaDoorOpen size="20px" color={textColorBrand} />
          <Text fontSize="md" fontWeight="600" color={textColorBrand} ml="5px">
            Exit 2{selectedBuilding}
          </Text>
        </Flex>
      </Flex>

      {/* Book Button */}
      <Flex justify="center" mt="30px">
        <Button
          onClick={handleBookSpot}
          bg={textColorBrand}
          color="white"
          borderRadius="30px"
          px="30px"
          py="25px"
          _hover={{ bg: useColorModeValue('brand.600', 'brand.300') }}
        >
          Book Selected Spot
        </Button>
      </Flex>

      {/* Booking Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Book Parking Spot</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <FormControl mb="4">
        <FormLabel>Apartment Number</FormLabel>
        <Select
          name="apartmentNumber"
          value={formData.apartmentNumber}
          onChange={handleInputChange}
          placeholder={apartmentNumbers.length === 0 ? "No apartments available" : "Select apartment"}
          isDisabled={apartmentNumbers.length === 0}
        >
          {apartmentNumbers.map((number) => (
            <option key={number} value={number}>
              {number}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl mb="4">
        <FormLabel>Parking Lot Code</FormLabel>
        <Input
          name="parkingLotCode"
          value={formData.parkingLotCode}
          isReadOnly
        />
      </FormControl>
      <FormControl mb="4">
        <FormLabel>End Date</FormLabel>
        <Input
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleInputChange}
        />
      </FormControl>
      <FormControl mb="4">
        <FormLabel>Plate Number</FormLabel>
        <Input
          name="plate"
          value={formData.plate}
          onChange={handleInputChange}
          placeholder="Enter plate number"
        />
      </FormControl>
    </ModalBody>
    <ModalFooter>
      <Button
        variant="darkBrand"
        color="white"
        fontSize="sm"
        fontWeight="500"
        borderRadius="10px"
        px="15px"
        py="5px"
        onClick={handleModalSubmit}
        isDisabled={submitStatus === 'loading' || submitStatus === 'success'}
        leftIcon={
          submitStatus === 'loading' ? (
            <Spinner size="sm" />
          ) : submitStatus === 'success' ? (
            <FaCheck color="green" />
          ) : null
        }
      >
        {submitStatus === 'loading'
          ? 'Submitting...'
          : submitStatus === 'success'
          ? 'Success'
          : 'Submit'}
      </Button>
      <Button
        ml={3} // Khoảng cách giữa 2 nút
        variant="darkBrand"
        color="white"
        fontSize="sm"
        fontWeight="500"
        borderRadius="10px"
        px="15px"
        py="5px"
        onClick={() => setIsModalOpen(false)}
      >
        Cancel
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
    </Box>
  );
}