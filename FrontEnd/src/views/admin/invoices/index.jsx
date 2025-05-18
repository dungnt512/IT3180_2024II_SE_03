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
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
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
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Badge,
  IconButton,
  Spinner,
  NumberInput,
  NumberInputField,
  Image,
  Stack,
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import api from 'services/apiConfig';
import { 
  MdSearch,
  MdFilterList, 
  MdFileDownload, 
  MdDelete, 
  MdCheck, 
  MdMoreVert, 
  MdInfo,
  MdOutlineFileDownload,
  MdOutlineDescription,
  MdPictureAsPdf,
  MdOutlineRemoveRedEye,
  MdAdd,
  MdAddCircleOutline,
} from 'react-icons/md';

const InvoicesAdmin = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const toast = useToast();

  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterParams, setFilterParams] = useState({
    invoiceNumber: '',
    apartmentNumber: '',
    residentName: '',
    status: '',
    minAmount: null,
    maxAmount: null,
    fromDueDate: '',
    toDueDate: '',
    floors: '',
    description: '',
  });
  
  // Create Invoice Modal States
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [apartments, setApartments] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState('');
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);
  
  // Invoice Detail Modal States
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  
  // Add a new state for toggling filters
  const [showFilters, setShowFilters] = useState(false);
  
  // Get invoices data
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Fetch invoice list
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/invoices/list');
      setInvoices(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to fetch invoices list',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter invoices
  const filterInvoices = async () => {
    setIsLoading(true);
    try {
      // Create params object for filter API
      const params = {};
      
      if (filterParams.invoiceNumber) {
        params.invoiceNumber = filterParams.invoiceNumber;
      }
      
      if (filterParams.apartmentNumber) {
        params.apartmentNumber = filterParams.apartmentNumber;
      }
      
      if (filterParams.residentName) {
        params.residentName = filterParams.residentName;
      }
      
      if (filterParams.description) {
        params.description = filterParams.description;
      }
      
      if (filterParams.minAmount) {
        params.minAmount = filterParams.minAmount;
      }
      
      if (filterParams.maxAmount) {
        params.maxAmount = filterParams.maxAmount;
      }
      
      if (filterParams.fromDueDate) {
        params.fromDueDate = filterParams.fromDueDate;
      }
      
      if (filterParams.toDueDate) {
        params.toDueDate = filterParams.toDueDate;
      }
      
      if (filterParams.status) {
        params.status = filterParams.status;
      }
      
      if (filterParams.floors) {
        params.floors = filterParams.floors;
      }
      
      const response = await api.get('/invoices/filter', { params });
      setInvoices(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to filter invoices',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete invoice
  const deleteInvoice = async (id) => {
    try {
      await api.delete(`/invoices/${id}`);
      fetchInvoices();
      toast({
        title: 'Success',
        description: 'Invoice deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to delete invoice',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Delete multiple invoices
  const deleteSelectedInvoices = async () => {
    try {
      for (const id of selectedInvoices) {
        await api.delete(`/invoices/${id}`);
      }
      setSelectedInvoices([]);
      fetchInvoices();
      toast({
        title: 'Success',
        description: `Deleted ${selectedInvoices.length} invoices`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to delete invoices',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Mark invoice as paid
  const markInvoiceAsPaid = async (id) => {
    try {
      await api.post(`/invoices/${id}/mark-paid`);
      fetchInvoices();
      toast({
        title: 'Success',
        description: 'Invoice marked as paid',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to mark invoice as paid',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Mark multiple invoices as paid
  const markSelectedAsPaid = async () => {
    try {
      for (const id of selectedInvoices) {
        await api.post(`/invoices/${id}/mark-paid`);
      }
      setSelectedInvoices([]);
      fetchInvoices();
      toast({
        title: 'Success',
        description: `Marked ${selectedInvoices.length} invoices as paid`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to mark invoices as paid',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${api.defaults.baseURL}/admin/export/invoices`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Get content-type and filename from headers
      const contentType = response.headers.get('Content-Type');
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'invoices.xlsx';
      
      // Extract filename from Content-Disposition if present
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=([^;]+)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].trim();
        }
      }
      
      // Convert response to blob with content-type from server
      const blob = await response.blob();
      const blobWithType = new Blob([blob], { 
        type: contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blobWithType);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast({
        title: 'Success',
        description: 'Invoices exported to Excel successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Export Error',
        description: 'Unable to export to Excel: ' + error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Download invoice
  const downloadInvoice = async (id, type) => {
    setIsLoading(true);
    try {
      let endpoint = '';
      
      switch (type) {
        case 'PDF':
          endpoint = `/invoices/${id}/downloadPdf`;
          break;
        case 'WORD':
          endpoint = `/invoices/${id}/download`;
          break;
        case 'VIEW':
          endpoint = `/invoices/${id}/viewPdf`;
          break;
        default:
          setIsLoading(false);
          return;
      }
      
      // Sử dụng fetch với mode: 'cors' để xử lý cross-origin
      const response = await fetch(`${api.defaults.baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Đảm bảo gửi token nếu cần
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // Lấy content-type và filename từ headers
      const contentType = response.headers.get('Content-Type');
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `invoice-${id}`;
      
      // Trích xuất filename từ Content-Disposition nếu có
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        } else if (contentDisposition.includes('attachment')) {
          // Nếu là attachment nhưng không có filename rõ ràng
          if (type === 'PDF') filename += '.pdf';
          else if (type === 'WORD') filename += '.docx';
        }
      } else {
        // Không có Content-Disposition, thêm extension dựa vào loại
        if (type === 'PDF') filename += '.pdf';
        else if (type === 'WORD') filename += '.docx';
      }
      
      // Chuyển response thành blob với content-type từ server
      const blob = await response.blob();
      const blobWithType = new Blob([blob], { type: contentType || 'application/octet-stream' });
      
      // Xử lý khác nhau dựa trên loại
      if (type === 'VIEW') {
        // Đối với VIEW, mở PDF trong tab mới
        const url = window.URL.createObjectURL(blobWithType);
        window.open(url, '_blank');
        // Giải phóng URL
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
      } else {
        // Đối với DOWNLOAD, tạo link tải xuống
        const url = window.URL.createObjectURL(blobWithType);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        
        // Giải phóng URL và xóa element
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      toast({
        title: 'Success',
        description: type === 'VIEW' ? 'Invoice opened successfully' : 'Invoice downloaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error handling invoice:', error);
      toast({
        title: 'Error',
        description: `Failed to ${type === 'VIEW' ? 'view' : 'download'} invoice: ${error.message}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // View invoice details
  const viewInvoiceDetail = async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      setInvoiceDetail(response.data);
      onDetailOpen();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to load invoice details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle invoice selection
  const handleSelectInvoice = (id) => {
    if (selectedInvoices.includes(id)) {
      setSelectedInvoices(selectedInvoices.filter(item => item !== id));
    } else {
      setSelectedInvoices([...selectedInvoices, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedInvoices(invoices.map(invoice => invoice.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  // Create Invoice Functions
  const openCreateInvoice = async () => {
    try {
      // Fetch apartments and initialize create invoice modal
      const response = await api.get('/invoices/admin/form-data');
      if (response.data && response.data.apartments) {
        setApartments(response.data.apartments);
      }
      onCreateOpen();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to load form data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleApartmentSelect = async (apartmentNumber) => {
    setSelectedApartment(apartmentNumber);
    setSelectedBills([]);
    
    if (apartmentNumber) {
      try {
        const response = await api.get(`/invoices/bills/${apartmentNumber}`, {
          params: { invoiceIdIsNull: true }
        });
        if (response.data && response.data.bills) {
          // Filter bills that are not already part of an invoice
          const availableBills = response.data.bills;
          setUnpaidBills(availableBills);
        } else {
          setUnpaidBills([]);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Unable to load unpaid bills',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setUnpaidBills([]);
      }
    }
  };

  const handleSelectBill = (id) => {
    if (selectedBills.includes(id)) {
      setSelectedBills(selectedBills.filter(billId => billId !== id));
    } else {
      setSelectedBills([...selectedBills, id]);
    }
  };

  const handleSelectAllBills = () => {
    if (selectedBills.length === unpaidBills.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(unpaidBills.map(bill => bill.id));
    }
  };

  const createInvoice = async () => {
    if (!selectedApartment) {
      toast({
        title: 'Warning',
        description: 'Please select an apartment',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (selectedBills.length === 0) {
      toast({
        title: 'Warning',
        description: 'Please select at least one bill',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await api.post(`/invoices/create`, selectedBills, {
        params: { apartmentNumber: selectedApartment }
      });
      
      toast({
        title: 'Success',
        description: 'Invoice created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh invoice list and close modal
      fetchInvoices();
      onCreateClose();
      
      // Reset form
      setSelectedApartment('');
      setUnpaidBills([]);
      setSelectedBills([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data || 'Unable to create invoice',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const createInvoiceFromAllUnpaid = async () => {
    if (!selectedApartment) {
      toast({
        title: 'Warning',
        description: 'Please select an apartment',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (unpaidBills.length === 0) {
      toast({
        title: 'Warning',
        description: 'There are no unpaid bills',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await api.post(`/invoices/create-all-unpaid`, null, {
        params: { apartmentNumber: selectedApartment }
      });
      
      toast({
        title: 'Success',
        description: 'Invoice created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh invoice list and close modal
      fetchInvoices();
      onCreateClose();
      
      // Reset form
      setSelectedApartment('');
      setUnpaidBills([]);
      setSelectedBills([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data || 'Unable to create invoice',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Invoice status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'green';
      case 'UNPAID':
        return 'orange';
      case 'FAILED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PAID':
        return 'Paid';
      case 'UNPAID':
        return 'Unpaid';
      case 'FAILED':
        return 'Failed';
      case 'REFUNDED':
        return 'Refunded';
      default:
        return status;
    }
  };

  // Add toggle filters function
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header */}
      <Flex mb='20px' justify='space-between' align='center'>
        <Text color={textColor} fontSize='2xl' fontWeight='700'>
          Invoice Management
        </Text>
        
        <Flex>
          <Button
            leftIcon={<MdFilterList />}
            variant='outline'
            colorScheme='brand'
            mr='10px'
            onClick={toggleFilters}
          >
            Filters
          </Button>
          <Button
            leftIcon={<MdAddCircleOutline />}
            variant='outline'
            colorScheme='brand'
            mr='10px'
            onClick={openCreateInvoice}
          >
            Create Invoice
          </Button>
          <Button
            leftIcon={<MdFileDownload />}
            variant='brand'
            onClick={exportToExcel}
            isLoading={isLoading}
          >
            Export to Excel
          </Button>
        </Flex>
      </Flex>
      
      {/* Collapsible Filter Card */}
      {showFilters && (
        <Card mb='20px'>
          <Flex p='20px' direction='column'>
            <Text color={textColor} fontSize='xl' fontWeight='600' mb='20px'>
              Filters
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing='20px'>
              <FormControl>
                <FormLabel>Invoice Number</FormLabel>
                <Input 
                  placeholder='Enter invoice number' 
                  value={filterParams.invoiceNumber}
                  onChange={(e) => setFilterParams({...filterParams, invoiceNumber: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Apartment</FormLabel>
                <Input 
                  placeholder='Enter apartment number' 
                  value={filterParams.apartmentNumber}
                  onChange={(e) => setFilterParams({...filterParams, apartmentNumber: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Resident Name</FormLabel>
                <Input 
                  placeholder='Enter resident name' 
                  value={filterParams.residentName}
                  onChange={(e) => setFilterParams({...filterParams, residentName: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select 
                  placeholder='All' 
                  value={filterParams.status}
                  onChange={(e) => setFilterParams({...filterParams, status: e.target.value})}
                >
                  <option value="UNPAID">Unpaid</option>
                  <option value="PAID">Paid</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Min Amount</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField 
                    placeholder='Enter minimum amount'
                    value={filterParams.minAmount || ''}
                    onChange={(e) => setFilterParams({...filterParams, minAmount: e.target.value ? Number(e.target.value) : null})}
                  />
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Max Amount</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField 
                    placeholder='Enter maximum amount'
                    value={filterParams.maxAmount || ''}
                    onChange={(e) => setFilterParams({...filterParams, maxAmount: e.target.value ? Number(e.target.value) : null})}
                  />
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>From Date</FormLabel>
                <Input 
                  placeholder='YYYY-MM-DD'
                  type='date'
                  value={filterParams.fromDueDate}
                  onChange={(e) => setFilterParams({...filterParams, fromDueDate: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>To Date</FormLabel>
                <Input
                  placeholder='YYYY-MM-DD'
                  type='date'
                  value={filterParams.toDueDate}
                  onChange={(e) => setFilterParams({...filterParams, toDueDate: e.target.value})}
                />
              </FormControl>
            </SimpleGrid>
            
            <Flex mt='20px' justify='flex-end'>
              <Button 
                variant='outline' 
                mr='10px'
                onClick={() => {
                  setFilterParams({
                    invoiceNumber: '',
                    apartmentNumber: '',
                    residentName: '',
                    status: '',
                    minAmount: null,
                    maxAmount: null,
                    fromDueDate: '',
                    toDueDate: '',
                    floors: '',
                    description: '',
                  });
                  fetchInvoices();
                }}
              >
                Reset
              </Button>
              <Button 
                colorScheme='brand'
                onClick={filterInvoices}
              >
                Apply Filters
              </Button>
            </Flex>
          </Flex>
        </Card>
      )}
      
      {/* Invoice List */}
      <Card>
        <Flex p='20px' justify='space-between' align='center'>
          <Text color={textColor} fontSize='xl' fontWeight='600'>
            Invoices
          </Text>
          
          {selectedInvoices.length > 0 && (
            <Flex>
              <Button 
                leftIcon={<MdDelete />} 
                colorScheme='red' 
                variant='outline' 
                size='sm'
                mr='10px'
                onClick={deleteSelectedInvoices}
              >
                Delete ({selectedInvoices.length})
              </Button>
              <Button 
                leftIcon={<MdCheck />} 
                colorScheme='green' 
                variant='outline' 
                size='sm'
                onClick={markSelectedAsPaid}
              >
                Mark as Paid ({selectedInvoices.length})
              </Button>
            </Flex>
          )}
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
                  <Th>
                    <Checkbox 
                      onChange={handleSelectAll} 
                      isChecked={selectedInvoices.length === invoices.length && invoices.length > 0}
                    />
                  </Th>
                  <Th>Invoice Number</Th>
                  <Th>Apartment</Th>
                  <Th>Resident</Th>
                  <Th>Amount</Th>
                  <Th>Created Date</Th>
                  <Th>Due Date</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {invoices.length === 0 ? (
                  <Tr>
                    <Td colSpan={9} textAlign='center' py='20px'>
                      <Text>No invoices found</Text>
                    </Td>
                  </Tr>
                ) : (
                  invoices.map(invoice => (
                    <Tr key={invoice.id}>
                      <Td>
                        <Checkbox 
                          isChecked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleSelectInvoice(invoice.id)}
                        />
                      </Td>
                      <Td>{invoice.invoiceNumber || "-"}</Td>
                      <Td>{invoice.apartmentNumber}</Td>
                      <Td>{invoice.residentName}</Td>
                      <Td>{formatCurrency(invoice.totalAmount)}</Td>
                      <Td>{formatDate(invoice.createdAt)}</Td>
                      <Td>{formatDate(invoice.dueDate)}</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(invoice.status)}>
                          {getStatusText(invoice.status)}
                        </Badge>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<MdMoreVert />}
                            variant='ghost'
                            size='sm'
                          />
                          <MenuList>
                            <MenuItem icon={<MdInfo />} onClick={() => viewInvoiceDetail(invoice.id)}>
                              View Details
                            </MenuItem>
                            <MenuItem icon={<MdOutlineFileDownload />} onClick={() => downloadInvoice(invoice.id, 'WORD')}>
                              Download Word
                            </MenuItem>
                            <MenuItem icon={<MdPictureAsPdf />} onClick={() => downloadInvoice(invoice.id, 'PDF')}>
                              Download PDF
                            </MenuItem>
                            <MenuItem icon={<MdOutlineRemoveRedEye />} onClick={() => downloadInvoice(invoice.id, 'VIEW')}>
                              View PDF
                            </MenuItem>
                            <MenuItem icon={<MdCheck />} onClick={() => markInvoiceAsPaid(invoice.id)} isDisabled={invoice.status === 'PAID'}>
                              Mark as Paid
                            </MenuItem>
                            <MenuItem icon={<MdDelete />} onClick={() => deleteInvoice(invoice.id)}>
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          )}
        </Box>
      </Card>
      
      {/* Create Invoice Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Invoice</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4}>
              <FormLabel>Select Apartment</FormLabel>
              <Select 
                placeholder="Select apartment"
                value={selectedApartment}
                onChange={(e) => handleApartmentSelect(e.target.value)}
              >
                {apartments.map(apt => (
                  <option key={apt.id} value={apt.apartmentNumber}>
                    {apt.apartmentNumber}
                  </option>
                ))}
              </Select>
            </FormControl>

            {selectedApartment && (
              <>
                <Text fontWeight="bold" mb={2}>Unpaid Bills</Text>
                {unpaidBills.length === 0 ? (
                  <Text>No unpaid bills found for this apartment</Text>
                ) : (
                  <>
                    <Box overflowY="auto" maxHeight="300px" mb={4}>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th width="50px">
                              <Checkbox 
                                isChecked={selectedBills.length === unpaidBills.length && unpaidBills.length > 0}
                                onChange={handleSelectAllBills}
                              />
                            </Th>
                            <Th>Bill Number</Th>
                            <Th>Type</Th>
                            <Th>Due Date</Th>
                            <Th isNumeric>Amount</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {unpaidBills.map(bill => (
                            <Tr key={bill.id}>
                              <Td>
                                <Checkbox 
                                  isChecked={selectedBills.includes(bill.id)}
                                  onChange={() => handleSelectBill(bill.id)}
                                />
                              </Td>
                              <Td>{bill.billNumber || "-"}</Td>
                              <Td>{bill.billTypeName || bill.billType}</Td>
                              <Td>{formatDate(bill.dueDate)}</Td>
                              <Td isNumeric>{formatCurrency(bill.amount)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                    
                    <Flex justifyContent="space-between">
                      <Text>Selected: {selectedBills.length} bills</Text>
                      <Text fontWeight="bold">
                        Total: {formatCurrency(unpaidBills
                          .filter(bill => selectedBills.includes(bill.id))
                          .reduce((sum, bill) => sum + bill.amount, 0))}
                      </Text>
                    </Flex>
                  </>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            {selectedApartment && unpaidBills.length > 0 && (
              <Button 
                colorScheme="green" 
                mr={3} 
                onClick={createInvoiceFromAllUnpaid}
              >
                Create for All Bills
              </Button>
            )}
            <Button 
              colorScheme="brand" 
              mr={3} 
              onClick={createInvoice}
              isDisabled={selectedBills.length === 0}
            >
              Create Invoice
            </Button>
            <Button onClick={onCreateClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Invoice Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invoice Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {invoiceDetail ? (
              <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                  <FormControl>
                    <FormLabel fontWeight='bold'>Invoice Number</FormLabel>
                    <Text>{invoiceDetail.invoiceNumber || "-"}</Text>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight='bold'>Apartment</FormLabel>
                    <Text>{invoiceDetail.apartmentNumber}</Text>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight='bold'>Resident</FormLabel>
                    <Text>{invoiceDetail.residentName}</Text>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight='bold'>Total Amount</FormLabel>
                    <Text>{formatCurrency(invoiceDetail.totalAmount)}</Text>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight='bold'>Created Date</FormLabel>
                    <Text>{formatDate(invoiceDetail.createdAt)}</Text>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight='bold'>Due Date</FormLabel>
                    <Text>{formatDate(invoiceDetail.dueDate)}</Text>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight='bold'>Status</FormLabel>
                    <Badge colorScheme={getStatusColor(invoiceDetail.status)}>
                      {getStatusText(invoiceDetail.status)}
                    </Badge>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight='bold'>Payment Reference</FormLabel>
                    <Text>{invoiceDetail.paymentReferenceCode || 'N/A'}</Text>
                  </FormControl>
                </SimpleGrid>
                
                <FormControl mb={4}>
                  <FormLabel fontWeight='bold'>Description</FormLabel>
                  <Text>{invoiceDetail.description || 'No description'}</Text>
                </FormControl>
                
                {/* QR Code Display */}
                {invoiceDetail.qrCode && (
                  <Flex direction="column" align="center" mb={4} p={4} borderWidth={1} borderRadius="md">
                    <Text fontWeight="bold" mb={2}>Payment QR Code</Text>
                    <Image 
                      src={`data:image/png;base64,${invoiceDetail.qrCode}`} 
                      alt="Payment QR Code" 
                      maxW="200px"
                      mb={2}
                    />
                    <Text fontSize="sm">Scan to pay via banking app</Text>
                  </Flex>
                )}
                
                <FormControl>
                  <FormLabel fontWeight='bold'>Bills</FormLabel>
                  {invoiceDetail.bills && invoiceDetail.bills.length > 0 ? (
                    <Table variant='simple' size='sm'>
                      <Thead>
                        <Tr>
                          <Th>Bill Number</Th>
                          <Th>Type</Th>
                          <Th>Amount</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {invoiceDetail.bills.map(bill => (
                          <Tr key={bill.id}>
                            <Td>{bill.billNumber || "-"}</Td>
                            <Td>{bill.billTypeName || bill.billType}</Td>
                            <Td>{formatCurrency(bill.amount)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text>No bills found</Text>
                  )}
                </FormControl>
              </Box>
            ) : (
              <Flex justify='center' align='center' height='200px'>
                <Spinner size='xl' color='brand.500' />
              </Flex>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onDetailClose}>
              Close
            </Button>
            {invoiceDetail && invoiceDetail.status !== 'PAID' && (
              <Button 
                colorScheme='green' 
                onClick={() => {
                  markInvoiceAsPaid(invoiceDetail.id);
                  onDetailClose();
                }}
              >
                Mark as Paid
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default InvoicesAdmin; 