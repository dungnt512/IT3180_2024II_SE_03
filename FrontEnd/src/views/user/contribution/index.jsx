import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Spinner,
  useColorModeValue,
  useToast,
  Card,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Badge,
} from '@chakra-ui/react';
import { MdFilterList, MdFileDownload, MdSearch, MdRefresh, MdPayment } from 'react-icons/md';
import { FaFileExcel } from 'react-icons/fa';

// Components
import ContributionCard from './components/ContributionCard';

// API Service
import {
  getActiveContributions,
  getClosedContributions,
  filterContributions,
  getUserFormData,
} from 'views/admin/contributions/services/contributionService';

function UserContribution() {
  const [contributions, setContributions] = useState([]);
  const [userContributionStats, setUserContributionStats] = useState({
    totalPaid: 0,
    totalAmount: 0,
    pendingCount: 0,
    paidCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    type: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContribution, setSelectedContribution] = useState(null);
  
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  
  const toast = useToast();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const statBg = useColorModeValue('white', 'navy.700');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Get active contributions
      const activeData = await getActiveContributions();
      const activeContributions = Array.isArray(activeData) ? activeData : [];

      // Get user contribution history
      const historyData = await getClosedContributions();
      const historyContributions = Array.isArray(historyData) ? historyData : [];
      
      // Get user contribution stats
      const userFormData = await getUserFormData();
      
      // Calculate total paid amount and total amount to be paid
      let totalPaid = 0;
      let totalAmount = 0;
      let pendingCount = 0;
      let paidCount = 0;
      
      if (userFormData && userFormData.userContributions) {
        userFormData.userContributions.forEach(contribution => {
          totalAmount += contribution.amount || 0;
          
          if (contribution.paymentStatus === 'PAID') {
            totalPaid += contribution.amount || 0;
            paidCount++;
          } else {
            pendingCount++;
          }
        });
      }
      
      setUserContributionStats({
        totalPaid,
        totalAmount,
        pendingCount,
        paidCount
      });
      
      // Sort to have active contributions at the top
      const allContributions = [...activeContributions, ...historyContributions];
      setContributions(allContributions);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Cannot load data, please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const applyFilters = async () => {
    setIsLoading(true);
    try {
      const response = await filterContributions(filters);
      const filteredData = Array.isArray(response) ? response : [];
      
      setContributions(filteredData);
      
      toast({
        title: 'Success',
        description: 'Filters applied successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply filters',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: 'all',
      type: 'all',
    });
    setSearchTerm('');
    fetchData();
  };
  
  const handleViewDetails = (contribution) => {
    setSelectedContribution(contribution);
    onDetailOpen();
  };
  
  // Filter contributions based on search term
  const filteredContributions = searchTerm 
    ? contributions.filter(item => 
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.contributionTypeName && item.contributionTypeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.type?.name && item.type.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : contributions;
    
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  };

  const handleContribute = (contribution, e) => {
    e.stopPropagation();
    // Logic to open contribution modal or redirect to payment page
    console.log('Contributing to:', contribution.id);
    
    toast({
      title: 'Contribute',
      description: 'Redirecting to payment page...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    // Open detail modal for user to view info and contribute
    handleViewDetails(contribution);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page title */}
      <Flex justifyContent="space-between" alignItems="center" mb="20px">
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          Contribution Services
        </Text>
        
        <Flex gap={2}>
          <Button
            variant='outline'
            colorScheme='brand'
            leftIcon={<MdFilterList />}
            onClick={toggleFilters}
          >
            Filters
          </Button>
        </Flex>
      </Flex>
      
      {/* Stats section */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing="20px" mb="20px">
        <Card>
          <Stat p={4}>
            <StatLabel>Total Contributions</StatLabel>
            <StatNumber>{formatCurrency(userContributionStats.totalAmount)}</StatNumber>
            <StatHelpText>
              {userContributionStats.pendingCount + userContributionStats.paidCount} contributions
            </StatHelpText>
          </Stat>
        </Card>
        <Card>
          <Stat p={4}>
            <StatLabel>Paid</StatLabel>
            <StatNumber>{formatCurrency(userContributionStats.totalPaid)}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              {userContributionStats.paidCount} paid items
            </StatHelpText>
          </Stat>
        </Card>
        <Card>
          <Stat p={4}>
            <StatLabel>Unpaid</StatLabel>
            <StatNumber>{formatCurrency(userContributionStats.totalAmount - userContributionStats.totalPaid)}</StatNumber>
            <StatHelpText>
              <StatArrow type="decrease" />
              {userContributionStats.pendingCount} unpaid items
            </StatHelpText>
          </Stat>
        </Card>
        <Card>
          <Stat p={4}>
            <StatLabel>Completion Rate</StatLabel>
            <StatNumber>{userContributionStats.totalAmount > 0 
              ? Math.round((userContributionStats.totalPaid / userContributionStats.totalAmount) * 100) 
              : 0}%</StatNumber>
            <Progress 
              value={userContributionStats.totalAmount > 0 
                ? (userContributionStats.totalPaid / userContributionStats.totalAmount) * 100 
                : 0} 
              size="sm" 
              colorScheme="green"
              borderRadius="md"
              mt={2}
            />
          </Stat>
        </Card>
      </SimpleGrid>
      
      {/* Search and Filters */}
      <Card mb="20px">
        <Flex p="20px" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
          <InputGroup width={{ base: '100%', md: '300px' }}>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input
              fontSize='sm'
              placeholder='Search contributions...'
              value={searchTerm}
              onChange={handleSearch}
              borderRadius='30px'
            />
          </InputGroup>
          
          <Button
            variant='brand'
            leftIcon={<MdRefresh />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Flex>
        
        {showFilters && (
          <Box px="20px" pb="20px">
            <Flex gap={4} flexWrap="wrap">
              <FormControl w={{ base: '100%', md: '200px' }}>
                <FormLabel fontSize="sm">Start Date</FormLabel>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                />
              </FormControl>
              <FormControl w={{ base: '100%', md: '200px' }}>
                <FormLabel fontSize="sm">End Date</FormLabel>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                />
              </FormControl>
              <FormControl w={{ base: '100%', md: '200px' }}>
                <FormLabel fontSize="sm">Status</FormLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </Select>
              </FormControl>
              <Flex alignItems="flex-end" gap={2}>
                <Button colorScheme="brand" onClick={applyFilters}>
                  Apply
                </Button>
                <Button variant="ghost" onClick={resetFilters}>
                  Reset
                </Button>
              </Flex>
            </Flex>
          </Box>
        )}
      </Card>

      {/* Contribution Cards */}
      <Card p="20px">
        {isLoading ? (
          <Flex justifyContent="center" alignItems="center" height="300px">
            <Spinner size="xl" color="brand.500" />
          </Flex>
        ) : filteredContributions.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px">
            {filteredContributions.map((contribution) => (
              <Card
                key={contribution.id}
                p="20px"
                borderRadius="lg"
                boxShadow="md"
                onClick={() => handleViewDetails(contribution)}
                cursor="pointer"
                _hover={{ transform: 'translateY(-5px)', transition: 'all 0.3s' }}
              >
                <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Text fontWeight="bold" fontSize="lg" noOfLines={1}>{contribution.title || contribution.name}</Text>
                  <Badge 
                    colorScheme={
                      contribution.status === 'ACTIVE' || contribution.status === 'active' 
                        ? 'green' 
                        : contribution.status === 'CLOSED' || contribution.status === 'closed'
                          ? 'orange'
                          : 'gray'
                    }
                  >
                    {contribution.status}
                  </Badge>
                </Flex>
                
                <Text color="gray.500" fontSize="sm" mb={3}>
                  {contribution.contributionTypeName || (contribution.type && contribution.type.name) || 'General'}
                </Text>
                
                <Text fontSize="sm" noOfLines={2} mb={4}>
                  {contribution.description}
                </Text>
                
                <Flex justifyContent="space-between" fontSize="sm" mb={2}>
                  <Text color="gray.500">Start Date:</Text>
                  <Text>{formatDate(contribution.startDate)}</Text>
                </Flex>
                
                <Flex justifyContent="space-between" fontSize="sm" mb={3}>
                  <Text color="gray.500">End Date:</Text>
                  <Text>{formatDate(contribution.endDate) || 'No limit'}</Text>
                </Flex>

                {contribution.targetAmount && (
                  <>
                    <Progress 
                      value={(contribution.collectedAmount / contribution.targetAmount) * 100 || 0} 
                      colorScheme="green" 
                      size="sm" 
                      borderRadius="md" 
                      mb={2}
                    />
                    <Flex justifyContent="space-between" fontSize="sm">
                      <Text fontWeight="medium">{formatCurrency(contribution.collectedAmount || 0)}</Text>
                      <Text color="gray.500">Target: {formatCurrency(contribution.targetAmount)}</Text>
                    </Flex>
                  </>
                )}
                
                {/* Show payment button if active */}
                {(contribution.status === 'ACTIVE' || contribution.status === 'active') && (
                  <Button 
                    colorScheme="green" 
                    size="sm" 
                    leftIcon={<MdPayment />} 
                    mt={4}
                    width="100%"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContribute(contribution, e);
                    }}
                  >
                    Contribute Now
                  </Button>
                )}
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Text fontSize="lg" textAlign="center" py="50px">
            No contributions found.
          </Text>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedContribution?.title || selectedContribution?.name || 'Contribution Details'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoading ? (
              <Flex justifyContent="center" alignItems="center" height="200px">
                <Spinner size="xl" color="brand.500" />
              </Flex>
            ) : selectedContribution ? (
              <Box>
                <Badge 
                  colorScheme={
                    selectedContribution.status === 'ACTIVE' || selectedContribution.status === 'active' 
                      ? 'green' 
                      : selectedContribution.status === 'CLOSED' || selectedContribution.status === 'closed'
                        ? 'orange'
                        : 'gray'
                  }
                  mb={4}
                >
                  {selectedContribution.status}
                </Badge>
                
                <Text fontSize="md" mb={4}>{selectedContribution.description}</Text>
                
                <SimpleGrid columns={2} spacing={4} mb={4}>
                  <Box>
                    <Text fontWeight="medium" fontSize="sm" color="gray.500">Contribution Type</Text>
                    <Text>{selectedContribution.contributionTypeName || (selectedContribution.type && selectedContribution.type.name) || 'General'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" fontSize="sm" color="gray.500">Created Date</Text>
                    <Text>{formatDate(selectedContribution.createdAt)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" fontSize="sm" color="gray.500">Start Date</Text>
                    <Text>{formatDate(selectedContribution.startDate)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" fontSize="sm" color="gray.500">End Date</Text>
                    <Text>{formatDate(selectedContribution.endDate) || 'No limit'}</Text>
                  </Box>
                </SimpleGrid>
                
                {selectedContribution.targetAmount && (
                  <Box mb={4}>
                    <Flex justifyContent="space-between" mb={1}>
                      <Text fontWeight="medium">Progress</Text>
                      <Text>{Math.round((selectedContribution.collectedAmount / selectedContribution.targetAmount) * 100 || 0)}%</Text>
                    </Flex>
                    <Progress 
                      value={(selectedContribution.collectedAmount / selectedContribution.targetAmount) * 100 || 0} 
                      colorScheme="green" 
                      size="sm" 
                      borderRadius="md" 
                      mb={2}
                    />
                    <Flex justifyContent="space-between" fontSize="sm">
                      <Text>{formatCurrency(selectedContribution.collectedAmount || 0)}</Text>
                      <Text color="gray.500">Target: {formatCurrency(selectedContribution.targetAmount)}</Text>
                    </Flex>
                  </Box>
                )}
                
                {/* Section for invoice or payment buttons will be added here */}
                {/* Placeholder for invoice section */}
                <Box mt={4} pt={4} borderTopWidth="1px">
                  <Text fontWeight="medium" mb={3}>Your Contribution History</Text>
                  {selectedContribution.userContributions && selectedContribution.userContributions.length > 0 ? (
                    selectedContribution.userContributions.map((item, index) => (
                      <Card key={index} p={3} mb={3} variant="outline">
                        <Flex justifyContent="space-between" alignItems="center">
                          <Box>
                            <Text fontWeight="medium">{formatCurrency(item.amount)}</Text>
                            <Text fontSize="sm" color="gray.500">{formatDate(item.createdAt)}</Text>
                          </Box>
                          <Badge colorScheme={item.paymentStatus === 'PAID' ? 'green' : 'orange'}>
                            {item.paymentStatus === 'PAID' ? 'Paid' : 'Unpaid'}
                          </Badge>
                        </Flex>
                        {item.paymentStatus !== 'PAID' && (
                          <Button 
                            colorScheme="green" 
                            size="sm" 
                            leftIcon={<MdPayment />} 
                            mt={2}
                            width="100%"
                          >
                            Pay Now
                          </Button>
                        )}
                      </Card>
                    ))
                  ) : (
                    <Text fontSize="sm" color="gray.500">You don't have any contributions for this item yet</Text>
                  )}
                </Box>
              </Box>
            ) : (
              <Text>No details found</Text>
            )}
          </ModalBody>
          <ModalFooter>
            {selectedContribution && (selectedContribution.status === 'ACTIVE' || selectedContribution.status === 'active') && (
              <Button
                colorScheme="green"
                leftIcon={<MdPayment />}
                mr={3}
                onClick={() => {
                  const amount = prompt('Enter the amount you want to contribute (VND):');
                  if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
                    // Call contribution API with the entered amount
                    toast({
                      title: 'Success',
                      description: `Contributed ${formatCurrency(parseFloat(amount))} to ${selectedContribution.title || selectedContribution.name}`,
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    });
                    onDetailClose();
                    setTimeout(handleRefresh, 1000);
                  } else if (amount !== null) {
                    toast({
                      title: 'Error',
                      description: 'Please enter a valid amount',
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }}
              >
                Contribute Now
              </Button>
            )}
            <Button onClick={onDetailClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default UserContribution; 
