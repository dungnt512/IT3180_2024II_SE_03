import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Tab,
  Text,
  useDisclosure,
  useColorModeValue,
  useToast,
  FormControl,
  FormLabel,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  IconButton,
  Tooltip,
  Progress,
  Textarea,
} from '@chakra-ui/react';

// Components
import ContributionTable from './components/ContributionTable';
import ContributionTypeTable from './components/ContributionTypeTable';
import AddContributionTypeModal from './components/AddContributionTypeModal';
import AddContributionModal from './components/AddContributionModal';

// Icons
import { MdAdd, MdAttachMoney, MdFileDownload, MdSearch, MdFilterList, MdPayment, MdRefresh, MdInfo, MdEdit, MdDone } from 'react-icons/md';
import { FaFileExcel } from 'react-icons/fa';

// Services
import { 
  getAdminContributions, 
  getContributionTypes, 
  filterContributions,
  exportContributionsToExcel,
  getContributionById,
  updateContribution,
  getResidentContributions
} from './services/contributionService';
import api from 'services/apiConfig';
import { viewInvoice, markInvoiceAsPaid } from './services/invoiceService';

// Custom components
import Card from 'components/card/Card';

function Contributions() {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const { isOpen: isOpenAddType, onOpen: onOpenAddType, onClose: onCloseAddType } = useDisclosure();
  const { isOpen: isOpenAddContribution, onOpen: onOpenAddContribution, onClose: onCloseAddContribution } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isInvoiceDetailOpen, onOpen: onInvoiceDetailOpen, onClose: onInvoiceDetailClose } = useDisclosure();
  
  const toast = useToast();

  const [contributions, setContributions] = useState([]);
  const [residentContributions, setResidentContributions] = useState([]);
  const [contributionTypes, setContributionTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });
  const [residentFilters, setResidentFilters] = useState({
    status: 'all',
    apartment: '',
    resident: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showResidentFilters, setShowResidentFilters] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [invoiceDetail, setInvoiceDetail] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let allContributions = [];
      
      if (Object.values(filters).some(value => value !== 'all' && value !== null)) {
        allContributions = await filterContributions(filters);
      } else {
        const response = await getAdminContributions();
        
        // Log received data for debugging
        console.log('API response:', response);
        
        // Handle response with proper null checking
        const activeContributions = Array.isArray(response.contributions) 
          ? response.contributions.map(c => ({...c, status: 'ACTIVE'}))
          : [];
        
        const closedContributionsData = Array.isArray(response.closedContributions) 
          ? response.closedContributions.map(c => ({...c, status: 'CLOSED'}))
          : [];
        
        console.log('Active contributions:', activeContributions);
        console.log('Closed contributions:', closedContributionsData);
        
        // Merge the two types for filtering purposes, but mark their status
        allContributions = [...activeContributions, ...closedContributionsData];
      }

      // Lấy danh sách resident contributions khi cần
      try {
        const residentContributionsData = await getResidentContributions();
        setResidentContributions(residentContributionsData);
        console.log('Resident contributions loaded:', residentContributionsData.length);
      } catch (residentError) {
        console.error('Error fetching resident contributions:', residentError);
      }

      const typesData = await getContributionTypes();

      setContributions(allContributions);
      setContributionTypes(typesData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not load data, please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportContributionsToExcel(filters);
      toast({
        title: 'Success',
        description: 'Data exported to Excel',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Export error',
        description: 'Could not export data, please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleExportResidentContributions = async () => {
    try {
      // Call the new API to export resident contributions
      const response = await fetch(`${api.defaults.baseURL}/admin/export/resident-contributions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Lấy content-type và filename từ headers
      const contentType = response.headers.get('Content-Type');
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'resident-contributions.xlsx';
      
      // Trích xuất filename từ Content-Disposition nếu có
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=([^;]+)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].trim();
        }
      }
      
      // Chuyển response thành blob với content-type từ server
      const blob = await response.blob();
      const blobWithType = new Blob([blob], { 
        type: contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Tạo link tải xuống
      const url = window.URL.createObjectURL(blobWithType);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      // Giải phóng URL và xóa element
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast({
        title: 'Success',
        description: 'Resident contributions exported to Excel successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Export error',
        description: 'Could not export resident contributions, please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleViewDetails = async (contribution) => {
    setIsLoading(true);
    try {
      const contributionDetail = await getContributionById(contribution.id);
      setSelectedContribution({
        ...contribution,
        ...contributionDetail
      });
      onDetailOpen();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load contribution details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (contribution, e) => {
    if (e) {
      e.stopPropagation();
    }
    
    // Set the selected contribution for editing
    setSelectedContribution(contribution);
    
    // Open the detail modal
    onDetailOpen();
    
    // Notification for user
    toast({
      title: 'Edit Contribution',
      description: `Editing: ${contribution.title || contribution.name}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Function to handle saving edits
  const handleSaveEdit = async (editedData) => {
    setIsLoading(true);
    try {
      // Call the API to update contribution using our service
      await updateContribution(selectedContribution.id, editedData);
      
      toast({
        title: 'Success',
        description: 'Contribution updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Close modal and refresh data
      onDetailClose();
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to update contribution. Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error updating contribution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseContribution = async (contributionId) => {
    setIsLoading(true);
    try {
      await api.post(`/contributions/admin/${contributionId}/close`);
      
      toast({
        title: 'Success',
        description: 'Contribution closed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to close contribution',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error closing contribution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateContribution = async (contributionId) => {
    setIsLoading(true);
    try {
      await api.post(`/contributions/admin/${contributionId}/reactivate`);
      
      toast({
        title: 'Success',
        description: 'Contribution reactivated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reactivate contribution',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error reactivating contribution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter contributions
  const filteredContributions = searchTerm.trim() === ''
    ? contributions
    : Array.isArray(contributions) 
      ? contributions.filter(item => 
          (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.contributionTypeName && item.contributionTypeName.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : [];

  // Sort contributions to have ACTIVE first, then CLOSED
  const sortedContributions = [...filteredContributions].sort((a, b) => {
    if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
    if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
    return 0;
  });

  // Count contributions by status for displaying in badges
  const openContributions = Array.isArray(filteredContributions) 
    ? filteredContributions.filter(c => c.status === 'ACTIVE')
    : [];
  const closedContributions = Array.isArray(filteredContributions)
    ? filteredContributions.filter(c => c.status === 'CLOSED')
    : [];

  // Filter resident contributions
  const filteredResidentContributions = searchTerm.trim() === ''
    ? residentContributions
    : Array.isArray(residentContributions)
      ? residentContributions.filter(item =>
          (item.residentName && item.residentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.apartmentNumber && item.apartmentNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.contributionName && item.contributionName.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : [];

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const toggleResidentFilters = () => {
    setShowResidentFilters(!showResidentFilters);
  };

  const applyFilters = async () => {
    setIsLoading(true);
    try {
      const filteredData = await filterContributions(filters);
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
        title: 'Filter error',
        description: 'Could not apply filters, please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    const resetFilters = {
      status: 'all',
      type: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    };
    setFilters(resetFilters);
    fetchData();
  };
  
  const applyResidentFilters = async () => {
    setIsLoading(true);
    try {
      // Implement logic to filter resident contributions
      // For now, just showing success message
      toast({
        title: 'Success',
        description: 'Resident filters applied successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Filter error',
        description: 'Could not apply filters, please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetResidentFilters = () => {
    const resetFilters = {
      status: 'all',
      apartment: '',
      resident: '',
      startDate: '',
      endDate: '',
    };
    setResidentFilters(resetFilters);
    fetchData();
  };
  
  // Format functions for displaying data
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  };

  // Sửa hàm xử lý khi chuyển tab để đóng tất cả modal
  const handleTabChange = (index) => {
    setActiveTabIndex(index);
    // Đóng tất cả các modal khi chuyển tab
    onDetailClose();
    onInvoiceDetailClose();
  };

  // Thêm function để xem chi tiết invoice
  const handleViewInvoice = async (invoiceId, e) => {
    if (e) e.stopPropagation();
    if (!invoiceId) {
      toast({
        title: 'Thông báo',
        description: 'Không tìm thấy hóa đơn cho khoản đóng góp này',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const invoiceData = await api.get(`/invoices/${invoiceId}`);
      if (invoiceData && invoiceData.data) {
        setInvoiceDetail(invoiceData.data);
        onInvoiceDetailOpen();  // Thay đổi này để sử dụng onInvoiceDetailOpen thay vì onDetailOpen
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load invoice details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Thêm function để đánh dấu thanh toán invoice
  const handleMarkAsPaid = async (invoiceId, e) => {
    if (e) e.stopPropagation();
    if (!invoiceId) {
      toast({
        title: 'Thông báo',
        description: 'Không tìm thấy hóa đơn cho khoản đóng góp này',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post(`/invoices/${invoiceId}/mark-paid`);
      
      toast({
        title: 'Success',
        description: 'Invoice marked as paid successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      fetchData(); // Refresh data
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark invoice as paid',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text
        color={textColor}
        fontSize='22px'
        fontWeight='700'
        lineHeight='100%'
        mb='20px'
      >
        Contributions Management
      </Text>

      <Tabs variant='soft-rounded' colorScheme='brand' index={activeTabIndex} onChange={handleTabChange}>
        <TabList mb='20px'>
          <Tab>Contributions</Tab>
          <Tab>User Contributions</Tab>
          <Tab>Contribution Types</Tab>
        </TabList>
        
        <TabPanels>
          {/* Tab 1: Contributions */}
          <TabPanel p={0}>
            <Flex mb='20px' align='center' justify='space-between'>
              <Flex align='center' gap={2}>
                <Button
                  variant='darkBrand'
                  color='white'
                  fontSize='sm'
                  fontWeight='500'
                  borderRadius='70px'
                  px='24px'
                  py='5px'
                  leftIcon={<MdAdd />}
                  onClick={onOpenAddContribution}
                >
                  Create
                </Button>
                <Button
                  variant='outline'
                  color={textColor}
                  fontSize='sm'
                  fontWeight='500'
                  borderRadius='70px'
                  px='24px'
                  py='5px'
                  leftIcon={<MdAdd />}
                  onClick={onOpenAddType}
                >
                  Add Type
                </Button>
                <Button
                  variant='outline'
                  color={textColor}
                  fontSize='sm'
                  fontWeight='500'
                  borderRadius='70px'
                  px='24px'
                  py='5px'
                  leftIcon={<MdFileDownload />}
                  onClick={handleExport}
                >
                  Export All
                </Button>
                <Button
                  variant='outline'
                  color={textColor}
                  fontSize='sm'
                  fontWeight='500'
                  borderRadius='70px'
                  px='24px'
                  py='5px'
                  leftIcon={<MdFilterList />}
                  onClick={toggleFilters}
                >
                  Filters
                </Button>
              </Flex>
              
              <InputGroup width='300px'>
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
                      <option value="ACTIVE">Active</option>
                      <option value="CLOSED">Closed</option>
                      <option value="CANCELED">Canceled</option>
                    </Select>
                  </FormControl>
                  <FormControl w={{ base: '100%', md: '200px' }}>
                    <FormLabel fontSize="sm">Type</FormLabel>
                    <Select
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                    >
                      <option value="all">All Types</option>
                      {contributionTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl w={{ base: '100%', md: '150px' }}>
                    <FormLabel fontSize="sm">Min Amount</FormLabel>
                    <Input
                      type="number"
                      value={filters.minAmount}
                      onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                      placeholder="Min"
                    />
                  </FormControl>
                  <FormControl w={{ base: '100%', md: '150px' }}>
                    <FormLabel fontSize="sm">Max Amount</FormLabel>
                    <Input
                      type="number"
                      value={filters.maxAmount}
                      onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                      placeholder="Max"
                    />
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

            <Card p="20px">
              {isLoading ? (
                <Flex justify="center" align="center" width="100%" py={10}>
                  <Spinner size="xl" color="blue.500" />
                </Flex>
              ) : sortedContributions.length === 0 ? (
                <Text textAlign="center" py={5}>No contributions found</Text>
              ) : (
                <Box>
                  <Flex mb={4} justify="space-between">
                    <Text fontWeight="bold" fontSize="lg">
                      All Contributions ({sortedContributions.length})
                    </Text>
                    <Text>
                      <Badge colorScheme="green" mr={2}>Active: {openContributions.length}</Badge>
                      <Badge colorScheme="orange">Closed: {closedContributions.length}</Badge>
                    </Text>
                  </Flex>
                  <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="20px">
                    {sortedContributions.map((contribution) => (
                      <Card
                        key={contribution.id}
                        p="20px"
                        borderRadius="lg"
                        boxShadow="md"
                        onClick={() => handleViewDetails(contribution)}
                        cursor="pointer"
                        _hover={{ transform: 'translateY(-5px)', transition: 'all 0.3s' }}
                        opacity={contribution.status === 'CLOSED' ? "0.8" : "1"}
                        borderLeft={contribution.status === 'ACTIVE' ? "4px solid green" : "4px solid orange"}
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
                              value={Math.min(((contribution.totalPaidAmount || contribution.currentAmount || contribution.collectedAmount || 0) / contribution.targetAmount) * 100, 100)}
                              colorScheme="green" 
                              size="sm" 
                              borderRadius="md" 
                              mb={2}
                              w="100%"

                            />
                            <Flex justifyContent="space-between" fontSize="sm">
                              <Text fontWeight="medium">{formatCurrency(contribution.totalPaidAmount || contribution.currentAmount || contribution.collectedAmount || 0)}</Text>
                              <Text color="gray.500">
                                Target: {formatCurrency(contribution.targetAmount)}
                                {contribution.targetAmount > 0 && ` (${Math.min(Math.round(((contribution.totalPaidAmount || contribution.currentAmount || contribution.collectedAmount || 0) / contribution.targetAmount) * 10000) / 100, 100)}%)`}
                              </Text>
                            </Flex>
                          </>
                        )}
                        
                        <Flex mt={4} gap={2}>
                          {contribution.status === 'ACTIVE' ? (
                            <>
                              <Button 
                                colorScheme="brand" 
                                size="sm" 
                                leftIcon={<MdEdit />}
                                flex="1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(contribution, e);
                                }}
                              >
                                Edit
                              </Button>
                              <Button 
                                colorScheme="orange" 
                                size="sm" 
                                leftIcon={<MdDone />}
                                flex="1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCloseContribution(contribution.id);
                                }}
                              >
                                Close
                              </Button>
                            </>
                          ) : (
                            <Button 
                              colorScheme="blue" 
                              size="sm" 
                              leftIcon={<MdRefresh />}
                              width="100%"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReactivateContribution(contribution.id);
                              }}
                            >
                              Reactivate
                            </Button>
                          )}
                        </Flex>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </Card>
          </TabPanel>
          
          {/* Tab 2: User Contributions */}
          <TabPanel p={0}>
            <Flex mb='20px' align='center' justify='space-between'>
              <Flex align='center' gap={2}>
                <Button
                  variant='outline'
                  color={textColor}
                  fontSize='sm'
                  fontWeight='500'
                  borderRadius='70px'
                  px='24px'
                  py='5px'
                  leftIcon={<MdFileDownload />}
                  onClick={handleExportResidentContributions}
                >
                  Export All
                </Button>
                <Button
                  variant='outline'
                  color={textColor}
                  fontSize='sm'
                  fontWeight='500'
                  borderRadius='70px'
                  px='24px'
                  py='5px'
                  leftIcon={<MdFilterList />}
                  onClick={toggleResidentFilters}
                >
                  Filters
                </Button>
                <Button
                  variant='outline'
                  color={textColor}
                  fontSize='sm'
                  fontWeight='500'
                  borderRadius='70px'
                  px='24px'
                  py='5px'
                  leftIcon={<MdRefresh />}
                  onClick={handleRefresh}
                >
                  Refresh
                </Button>
              </Flex>
              
              <InputGroup width='300px'>
                <InputLeftElement pointerEvents='none'>
                  <MdSearch color='gray.400' />
                </InputLeftElement>
                <Input
                  fontSize='sm'
                  placeholder='Search user contributions...'
                  value={searchTerm}
                  onChange={handleSearch}
                  borderRadius='30px'
                />
              </InputGroup>
            </Flex>
            
            {showResidentFilters && (
              <Box px="20px" pb="20px">
                <Flex gap={4} flexWrap="wrap">
                  <FormControl w={{ base: '100%', md: '200px' }}>
                    <FormLabel fontSize="sm">Apartment</FormLabel>
                    <Input
                      placeholder="Apartment Number"
                      value={residentFilters.apartment}
                      onChange={(e) => setResidentFilters({...residentFilters, apartment: e.target.value})}
                    />
                  </FormControl>
                  <FormControl w={{ base: '100%', md: '200px' }}>
                    <FormLabel fontSize="sm">Resident</FormLabel>
                    <Input
                      placeholder="Resident Name"
                      value={residentFilters.resident}
                      onChange={(e) => setResidentFilters({...residentFilters, resident: e.target.value})}
                    />
                  </FormControl>
                  <FormControl w={{ base: '100%', md: '200px' }}>
                    <FormLabel fontSize="sm">Payment Status</FormLabel>
                    <Select
                      value={residentFilters.status}
                      onChange={(e) => setResidentFilters({...residentFilters, status: e.target.value})}
                    >
                      <option value="all">All</option>
                      <option value="PAID">Paid</option>
                      <option value="UNPAID">Unpaid</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="FAILED">Failed</option>
                    </Select>
                  </FormControl>
                  <FormControl w={{ base: '100%', md: '200px' }}>
                    <FormLabel fontSize="sm">Start Date</FormLabel>
                    <Input
                      type="date"
                      value={residentFilters.startDate}
                      onChange={(e) => setResidentFilters({...residentFilters, startDate: e.target.value})}
                    />
                  </FormControl>
                  <FormControl w={{ base: '100%', md: '200px' }}>
                    <FormLabel fontSize="sm">End Date</FormLabel>
                    <Input
                      type="date"
                      value={residentFilters.endDate}
                      onChange={(e) => setResidentFilters({...residentFilters, endDate: e.target.value})}
                    />
                  </FormControl>
                  <Flex alignItems="flex-end" gap={2}>
                    <Button colorScheme="brand" onClick={applyResidentFilters}>
                      Apply
                    </Button>
                    <Button variant="ghost" onClick={resetResidentFilters}>
                      Reset
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            )}
            
            <Card>
              <Box overflowX="auto" p="20px">
                {isLoading ? (
                  <Flex justify="center" align="center" width="100%" py={10}>
                    <Spinner size="xl" color="blue.500" />
                  </Flex>
                ) : filteredResidentContributions.length === 0 ? (
                  <Text textAlign="center" p={5}>No resident contributions found</Text>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>Resident</Th>
                        <Th>Apartment</Th>
                        <Th>Type</Th>
                        <Th>Amount</Th>
                        <Th>Payment Status</Th>
                        <Th>Created Date</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredResidentContributions.map((contribution) => (
                        <Tr key={contribution.id}>
                          <Td>{contribution.id}</Td>
                          <Td>{contribution.residentName}</Td>
                          <Td>{contribution.apartmentNumber}</Td>
                          <Td>{contribution.contributionTitle}</Td>
                          <Td>{formatCurrency(contribution.amount || 0)}</Td>
                          <Td>
                            <Badge 
                              colorScheme={
                                contribution.paymentStatus === 'PAID' ? 'green' : 
                                contribution.paymentStatus === 'UNPAID' ? 'orange' :
                                contribution.paymentStatus === 'PROCESSING' ? 'blue' : 'red'
                              }
                            >
                              {contribution.paymentStatus}
                            </Badge>
                          </Td>
                          <Td>{formatDate(contribution.createdAt)}</Td>
                          <Td>
                            <Flex gap={2}>
                              <Tooltip label="View invoice details">
                                <IconButton
                                  icon={<MdInfo />}
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleViewInvoice(contribution.invoiceId, e)}
                                  isDisabled={!contribution.invoiceId}
                                />
                              </Tooltip>
                              {(contribution.paymentStatus === 'UNPAID' || contribution.paymentStatus === 'PROCESSING') && 
                                contribution.invoiceId && (
                                <Tooltip label="Mark as paid">
                                  <IconButton
                                    icon={<MdPayment />}
                                    colorScheme="green"
                                    size="sm"
                                    onClick={(e) => handleMarkAsPaid(contribution.invoiceId, e)}
                                  />
                                </Tooltip>
                              )}
                            </Flex>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </Card>
          </TabPanel>
          
          {/* Tab 3: Contribution Types */}
          <TabPanel p={0}>
            <Flex mb='20px' justify='space-between'>
              <Button
                variant='darkBrand'
                color='white'
                fontSize='sm'
                fontWeight='500'
                borderRadius='70px'
                px='24px'
                py='5px'
                leftIcon={<MdAdd />}
                onClick={onOpenAddType}
              >
                Add Contribution Type
              </Button>
              
              <InputGroup width='300px'>
                <InputLeftElement pointerEvents='none'>
                  <MdSearch color='gray.400' />
                </InputLeftElement>
                <Input
                  fontSize='sm'
                  placeholder='Search contribution types...'
                  value={searchTerm}
                  onChange={handleSearch}
                  borderRadius='30px'
                />
              </InputGroup>
            </Flex>
            
            <Card>
              <Box overflowX="auto" p="20px">
                {isLoading ? (
                  <Flex justify="center" align="center" width="100%" py={10}>
                    <Spinner size="xl" color="blue.500" />
                  </Flex>
                ) : contributionTypes.length === 0 ? (
                  <Text textAlign="center" p={5}>No contribution types found</Text>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>Name</Th>
                        <Th>Description</Th>
                        <Th>Status</Th>
                        <Th>Created Date</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {contributionTypes
                        .filter(type => 
                          !searchTerm || 
                          (type.name && type.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        .map((type) => (
                        <Tr key={type.id}>
                          <Td>{type.id}</Td>
                          <Td fontWeight="500">{type.name}</Td>
                          <Td>{type.description}</Td>
                          <Td>
                            <Badge colorScheme="green">
                              Active
                            </Badge>
                          </Td>
                          <Td>{formatDate(type.createdAt)}</Td>
                          <Td>
                            <Flex gap={2}>
                              <Tooltip label="Edit">
                                <IconButton
                                  icon={<MdEdit />}
                                  variant="ghost"
                                  size="sm"
                                />
                              </Tooltip>
                            </Flex>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modals */}
      <AddContributionTypeModal 
        isOpen={isOpenAddType} 
        onClose={onCloseAddType} 
        onRefresh={handleRefresh}
      />
      
      <AddContributionModal
        isOpen={isOpenAddContribution}
        onClose={onCloseAddContribution}
        contributionTypes={contributionTypes}
        onRefresh={handleRefresh}
      />
      
      {/* Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedContribution ? 'Edit Contribution' : 'Contribution Details'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoading ? (
              <Flex justify="center" py={10}>
                <Spinner size="xl" color="brand.500" />
              </Flex>
            ) : selectedContribution ? (
              <Box>
                <SimpleGrid columns={2} spacing={4} mb={4}>
                  <FormControl>
                    <FormLabel fontWeight="medium">Title</FormLabel>
                    <Input 
                      value={selectedContribution.title || selectedContribution.name || ''}
                      onChange={(e) => setSelectedContribution({
                        ...selectedContribution,
                        title: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Status</FormLabel>
                    <Badge 
                      colorScheme={
                        selectedContribution.status === 'ACTIVE' ? 'green' : 
                        selectedContribution.status === 'CLOSED' ? 'orange' : 'red'
                      }
                      p={2}
                      fontSize="sm"
                    >
                      {selectedContribution.status}
                    </Badge>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Contribution Type</FormLabel>
                    <Select
                      value={selectedContribution.contributionTypeId || ''}
                      onChange={(e) => setSelectedContribution({
                        ...selectedContribution,
                        contributionTypeId: e.target.value
                      })}
                    >
                      {contributionTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Target Amount</FormLabel>
                    <Input 
                      type="number"
                      value={selectedContribution.targetAmount || ''}
                      onChange={(e) => setSelectedContribution({
                        ...selectedContribution,
                        targetAmount: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Start Date</FormLabel>
                    <Input 
                      type="date"
                      value={selectedContribution.startDate ? selectedContribution.startDate.substring(0, 10) : ''}
                      onChange={(e) => setSelectedContribution({
                        ...selectedContribution,
                        startDate: e.target.value
                      })}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">End Date</FormLabel>
                    <Input 
                      type="date"
                      value={selectedContribution.endDate ? selectedContribution.endDate.substring(0, 10) : ''}
                      onChange={(e) => setSelectedContribution({
                        ...selectedContribution,
                        endDate: e.target.value
                      })}
                    />
                  </FormControl>
                </SimpleGrid>
                
                <FormControl mb={4}>
                  <FormLabel fontWeight="medium">Description</FormLabel>
                  <Textarea
                    value={selectedContribution.description || ''}
                    onChange={(e) => setSelectedContribution({
                      ...selectedContribution,
                      description: e.target.value
                    })}
                    rows={4}
                  />
                </FormControl>
                
                {selectedContribution.targetAmount && (
                  <Box mb={4}>
                    <Flex justifyContent="space-between" mb={1}>
                      <Text fontWeight="medium">Progress</Text>
                      <Text>{Math.min(Math.round(((selectedContribution.totalPaidAmount || selectedContribution.currentAmount || selectedContribution.collectedAmount || 0) / selectedContribution.targetAmount) * 10000) / 100, 100)}%</Text>
                    </Flex>
                    <Progress 
                      value={Math.min(((selectedContribution.totalPaidAmount || selectedContribution.currentAmount || selectedContribution.collectedAmount || 0) / selectedContribution.targetAmount) * 100, 100)} 
                      colorScheme="green" 
                      size="sm" 
                      borderRadius="md" 
                      mb={2}
                      w="100%"
                      bgColor="gray.200"
                    />
                    <Flex justifyContent="space-between" fontSize="sm">
                      <Text>{formatCurrency(selectedContribution.totalPaidAmount || selectedContribution.currentAmount || selectedContribution.collectedAmount || 0)}</Text>
                      <Text color="gray.500">Target: {formatCurrency(selectedContribution.targetAmount)}</Text>
                    </Flex>
                  </Box>
                )}
                
                {/* Resident Contributions */}
                {selectedContribution.residentContributions && selectedContribution.residentContributions.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={3}>Resident Contributions</Text>
                    <Box overflowX="auto" maxHeight="300px" overflowY="auto">
                      <Table variant="simple" size="sm">
                        <Thead position="sticky" top={0} bg="white" zIndex={1}>
                          <Tr>
                            <Th>Resident</Th>
                            <Th>Apartment</Th>
                            <Th>Amount</Th>
                            <Th>Status</Th>
                            <Th>Created Date</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {selectedContribution.residentContributions.map((item, index) => (
                            <Tr key={index}>
                              <Td>{item.residentName || 'Unknown'}</Td>
                              <Td>{item.apartmentNumber}</Td>
                              <Td>{formatCurrency(item.amount || 0)}</Td>
                              <Td>
                                <Badge 
                                  colorScheme={
                                    item.paymentStatus === 'PAID' ? 'green' : 
                                    item.paymentStatus === 'UNPAID' ? 'orange' :
                                    item.paymentStatus === 'PROCESSING' ? 'blue' : 'red'
                                  }
                                  size="sm"
                                >
                                  {item.paymentStatus}
                                </Badge>
                              </Td>
                              <Td>{formatDate(item.createdAt)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <Text>No contribution details available</Text>
            )}
          </ModalBody>
          <ModalFooter>
            {selectedContribution && (
              <>
                <Button 
                  colorScheme="brand" 
                  mr={3} 
                  onClick={() => handleSaveEdit(selectedContribution)}
                  isLoading={isLoading}
                >
                  Save Changes
                </Button>
                <Button variant="outline" leftIcon={<MdFileDownload />} onClick={handleExport} mr={3}>
                  Export Details
                </Button>
              </>
            )}
            <Button onClick={onDetailClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal xem chi tiết invoice - sử dụng isInvoiceDetailOpen */}
      <Modal isOpen={isInvoiceDetailOpen} onClose={onInvoiceDetailClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invoice Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoading ? (
              <Flex justify="center" py={10}>
                <Spinner size="xl" color="brand.500" />
              </Flex>
            ) : invoiceDetail ? (
              <Box>
                <SimpleGrid columns={2} spacing={4} mb={4}>
                  <FormControl>
                    <FormLabel fontWeight="medium">Invoice Number</FormLabel>
                    <Text>{invoiceDetail.invoiceNumber}</Text>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Status</FormLabel>
                    <Badge 
                      colorScheme={
                        invoiceDetail.status === 'PAID' ? 'green' : 
                        invoiceDetail.status === 'UNPAID' ? 'orange' : 'red'
                      }
                      p={2}
                      fontSize="sm"
                    >
                      {invoiceDetail.status}
                    </Badge>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Apartment</FormLabel>
                    <Text>{invoiceDetail.apartmentNumber}</Text>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Resident Name</FormLabel>
                    <Text>{invoiceDetail.residentName}</Text>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Total Amount</FormLabel>
                    <Text fontWeight="bold">{formatCurrency(invoiceDetail.totalAmount || 0)}</Text>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Due Date</FormLabel>
                    <Text>{formatDate(invoiceDetail.dueDate)}</Text>
                  </FormControl>
                </SimpleGrid>
                
                <FormControl mb={4}>
                  <FormLabel fontWeight="medium">Description</FormLabel>
                  <Text>{invoiceDetail.description || 'No description'}</Text>
                </FormControl>
                
                {/* Bills information if available */}
                {invoiceDetail.bills && invoiceDetail.bills.length > 0 && (
                  <Box mt={4}>
                    <Text fontWeight="bold" mb={3}>Related Bills</Text>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Type</Th>
                          <Th>Description</Th>
                          <Th>Amount</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {invoiceDetail.bills.map((bill, index) => (
                          <Tr key={index}>
                            <Td>{bill.billType}</Td>
                            <Td>{bill.description || '-'}</Td>
                            <Td>{formatCurrency(bill.amount || 0)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </Box>
            ) : (
              <Text>No invoice details available</Text>
            )}
          </ModalBody>
          <ModalFooter>
            {invoiceDetail && invoiceDetail.status === 'UNPAID' && (
              <Button 
                colorScheme="green" 
                mr={3} 
                onClick={() => handleMarkAsPaid(invoiceDetail.id)}
                isLoading={isLoading}
              >
                Mark as Paid
              </Button>
            )}
            <Button variant="outline" onClick={onInvoiceDetailClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Contributions; 
