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
    const {colorMode} = useColorMode();
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
        A: Array.from({length: 96}, (_, i) => ({
            id: `A${i + 1}`,
            section: 'A',
            status: 'available',
            booked: false,
        })),
        B: Array.from({length: 96}, (_, i) => ({
            id: `B${i + 1}`,
            section: 'B',
            status: 'available',
            booked: false,
        })),
        C: Array.from({length: 96}, (_, i) => ({
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
    const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [viewingBooking, setViewingBooking] = useState(null);
    const [bookingDetail, setBookingDetail] = useState(null);

    // Fetch available parking lots from API
    useEffect(() => {
        const fetchAvailableLots = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/parking-rentals/available-parking-lots`);
                const availableLots = response.data;

                // Update parking spots state based on API response
                setParkingSpots((prev) => {
                    const updatedSpots = {...prev};
                    Object.keys(updatedSpots).forEach((building) => {
                        updatedSpots[building] = updatedSpots[building].map((spot) => {
                            const isAvailable = availableLots.some((lot) => lot.lotCode === spot.id && lot.status === 'AVAILABLE');
                            return {...spot, booked: !isAvailable};
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
                        setFormData((prev) => ({...prev, apartmentNumber: apartments[0]}));
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
    const handleSpotClick = async (spot) => {
        if (!spot.booked) return;

        setIsViewingModalOpen(true);
        setLoadingDetail(true);
        setViewingBooking(spot.id);

        try {
            const response = await axios.get(`${API_BASE_URL}/api/parking-rentals/new/view/${spot.id}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                }
            });

            setBookingDetail(response.data);
        } catch (error) {
            toast({
                title: 'Lỗi khi lấy thông tin chỗ đậu',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setBookingDetail(null);
        } finally {
            setLoadingDetail(false);
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
                                                cursor={spot.booked ? 'allowed' : 'pointer'}
                                                onClick={() => handleSpotClick(spot)}
                                                transition="all 0.2s"
                                                _hover={
                                                    !spot.booked && { transform: 'scale(1.05)', boxShadow: 'md' }
                                                }
                                            >
                                                {selectedBuilding === 'B' ? (
                                                    <FaMotorcycle size="20px" color={spot.booked ? 'red' : 'green'} />
                                                ) : (
                                                    <FaCar size="20px" color={spot.booked ? 'red' : 'green'} />
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
            <Modal isOpen={isViewingModalOpen} onClose={() => setIsViewingModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Thông tin chỗ đã đặt</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {loadingDetail ? (
                            <Flex justify="center" align="center" py={6}>
                                <Spinner />
                            </Flex>
                        ) : bookingDetail ? (
                            <>
                                <FormControl mb="4">
                                    <FormLabel>Mã chỗ đậu</FormLabel>
                                    <Input value={bookingDetail.parkingLot.lotCode} isReadOnly />
                                </FormControl>
                                <FormControl mb="4">
                                    <FormLabel>Căn hộ</FormLabel>
                                    <Input value={bookingDetail.apartmentNumber} isReadOnly />
                                </FormControl>
                                <FormControl mb="4">
                                    <FormLabel>Biển số</FormLabel>
                                    <Input value={bookingDetail.licensePlate} isReadOnly />
                                </FormControl>
                                <FormControl mb="4">
                                    <FormLabel>Ngày kết thúc</FormLabel>
                                    <Input
                                        value={new Date(bookingDetail.endDate).toLocaleDateString()}
                                        isReadOnly
                                    />
                                </FormControl>
                            </>
                        ) : (
                            <Text>Không tìm thấy thông tin đặt chỗ.</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => setIsViewingModalOpen(false)}>Đóng</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}