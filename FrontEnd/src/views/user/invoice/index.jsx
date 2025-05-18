import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Select,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  Tooltip,
  Input,
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import api from 'services/apiConfig';
import { 
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdDelete,
  MdAdd,
  MdMoreVert,
  MdInfo,
  MdOutlineFileDownload,
  MdPictureAsPdf,
  MdOutlineRemoveRedEye,
  MdPayment,
  MdRefresh,
  MdQrCode,
  MdFilterList,
} from 'react-icons/md';
import { FaFileExcel } from 'react-icons/fa';

const UserInvoice = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const [paymentQrCode, setPaymentQrCode] = useState(null);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isQrOpen, onOpen: onQrOpen, onClose: onQrClose } = useDisclosure();

  // Thêm state cho filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Lấy thông tin căn hộ và hóa đơn khi trang được tải
  useEffect(() => {
    fetchUserData();
  }, []);

  // Lấy danh sách căn hộ và hóa đơn của người dùng
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/invoices/user');
      
      if (response.data.allApartments) {
        setApartments(response.data.allApartments);
        
        if (response.data.apartment) {
          setSelectedApartment(response.data.apartment);
          fetchUnpaidBills(response.data.apartment.apartmentNumber);
        }
        
        if (response.data.invoices) {
          setInvoices(response.data.invoices);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get invoice information',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy danh sách bill chưa thanh toán của căn hộ đã chọn
  const fetchUnpaidBills = async (apartmentNumber) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/invoices/user/form-data?apartmentNumber=${apartmentNumber}`);
      if (response.data.bills) {
        setUnpaidBills(response.data.bills);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get list of unpaid bills',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Khi người dùng thay đổi căn hộ
  const handleApartmentChange = (e) => {
    const apartmentNumber = e.target.value;
    const apartment = apartments.find(apt => apt.apartmentNumber === apartmentNumber);
    setSelectedApartment(apartment);
    setSelectedBills([]);
    fetchUnpaidBills(apartmentNumber);
    fetchUserInvoicesForApartment(apartmentNumber);
  };

  // Lấy danh sách hóa đơn tổng hợp của căn hộ đã chọn
  const fetchUserInvoicesForApartment = async (apartmentNumber) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/invoices/user?apartmentNumber=${apartmentNumber}`);
      if (response.data.invoices) {
        setInvoices(response.data.invoices);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get list of invoices',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý chọn/bỏ chọn bill
  const handleSelectBill = (id) => {
    if (selectedBills.includes(id)) {
      setSelectedBills(selectedBills.filter(billId => billId !== id));
    } else {
      setSelectedBills([...selectedBills, id]);
    }
  };

  // Chọn tất cả bill
  const handleSelectAllBills = () => {
    if (selectedBills.length === unpaidBills.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(unpaidBills.map(bill => bill.id));
    }
  };

  // Tạo hóa đơn tổng hợp từ các bill đã chọn
  const createInvoiceFromSelectedBills = async () => {
    if (selectedBills.length === 0) {
      toast({
        title: 'Notice',
        description: 'Please select at least one bill to create an invoice',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/invoices/user/create', selectedBills, {
        params: {
          apartmentNumber: selectedApartment.apartmentNumber
        }
      });

      toast({
        title: 'Success',
        description: 'New invoice created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Cập nhật lại danh sách bill chưa thanh toán và hóa đơn tổng hợp
      fetchUnpaidBills(selectedApartment.apartmentNumber);
      fetchUserInvoicesForApartment(selectedApartment.apartmentNumber);
      setSelectedBills([]);
      
      // Chuyển đến tab hóa đơn tổng hợp và hiển thị chi tiết hóa đơn mới tạo
      viewInvoiceDetail(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Tạo hóa đơn tổng hợp từ tất cả các bill chưa thanh toán
  const createInvoiceFromAllUnpaidBills = async () => {
    if (unpaidBills.length === 0) {
      toast({
        title: 'Notice',
        description: 'No unpaid bills to create invoice',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/invoices/create-all-unpaid', null, {
        params: {
          apartmentNumber: selectedApartment.apartmentNumber
        }
      });

      toast({
        title: 'Success',
        description: 'Created invoice for all unpaid bills',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Cập nhật lại danh sách bill chưa thanh toán và hóa đơn tổng hợp
      fetchUnpaidBills(selectedApartment.apartmentNumber);
      fetchUserInvoicesForApartment(selectedApartment.apartmentNumber);
      setSelectedBills([]);
      
      // Chuyển đến tab hóa đơn tổng hợp và hiển thị chi tiết hóa đơn mới tạo
      viewInvoiceDetail(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data || 'Failed to create invoice',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Xem chi tiết hóa đơn tổng hợp
  const viewInvoiceDetail = async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      setInvoiceDetail(response.data);
      onDetailOpen();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load invoice details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Hiển thị QR code cho thanh toán
  const showPaymentQr = async (invoice) => {
    setIsLoading(true);
    try {
      setPaymentQrCode({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        qrCode: invoice.qrCodeUrl
      });
      onQrOpen();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load payment QR code',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Tái tạo QR code
  const regenerateQrCode = async () => {
    if (!paymentQrCode?.invoiceId) return;
    
    setIsLoading(true);
    try {
      const response = await api.post(`/invoices/${paymentQrCode.invoiceId}/regenerate-qr`);
      
      setPaymentQrCode({
        ...paymentQrCode,
        qrCode: response.data.qrCode
      });
      
      toast({
        title: 'Success',
        description: 'QR code regenerated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to regenerate QR code',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Tải xuống QR code
  const downloadQrCode = () => {
    if (!paymentQrCode?.qrCode) return;
    
    // Tải xuống ảnh từ URL
    fetch(paymentQrCode.qrCode)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-qr-${paymentQrCode.invoiceNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      })
      .catch(error => {
        console.error('Error downloading QR code:', error);
        toast({
          title: 'Error',
          description: 'Failed to download QR code',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
  };

  // Định dạng tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  };

  // Lấy màu trạng thái hóa đơn
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

  // Lấy text trạng thái hóa đơn
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

  // Download invoice function
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
        case 'EXCEL':
          endpoint = `/invoices/${id}/downloadExcel`;
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
        // Format: "attachment; filename=filename.extension"
        const filenameMatch = contentDisposition.match(/filename=([^;]+)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].trim();
        } else {
          // Nếu không tìm thấy filename, thêm extension dựa vào loại
          if (type === 'PDF') filename += '.pdf';
          else if (type === 'WORD') filename += '.docx';
          else if (type === 'EXCEL') filename += '.xlsx';
        }
      } else {
        // Không có Content-Disposition, thêm extension dựa vào loại
        if (type === 'PDF') filename += '.pdf';
        else if (type === 'WORD') filename += '.docx';
        else if (type === 'EXCEL') filename += '.xlsx';
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

  // Thêm hàm xuất tất cả hóa đơn ra Excel
  const exportAllInvoicesToExcel = async () => {
    setIsLoading(true);
    try {
      // Gọi API xuất tất cả hóa đơn ra Excel với filter hiện tại
      const response = await fetch(`${api.defaults.baseURL}/invoices/export-excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(filters),
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // Lấy content-type và filename từ headers
      const contentType = response.headers.get('Content-Type');
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'invoices.xlsx';
      
      // Trích xuất filename từ Content-Disposition nếu có
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=([^;]+)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].trim();
        }
        
        // Kiểm tra thêm nếu filename được đặt trong dấu ngoặc kép
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
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
        description: 'All invoices exported to Excel successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error exporting invoices to Excel:', error);
      toast({
        title: 'Error',
        description: `Failed to export invoices: ${error.message}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Thêm hàm áp dụng filter
  const applyFilters = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/invoices/filter', filters, {
        params: {
          apartmentNumber: selectedApartment?.apartmentNumber
        }
      });
      setInvoices(response.data || []);
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

  // Thêm hàm reset filter
  const resetFilters = async () => {
    const resetFilterValues = {
      startDate: '',
      endDate: '',
      status: 'all'
    };
    setFilters(resetFilterValues);
    
    // Gọi lại danh sách hóa đơn không có filter
    if (selectedApartment) {
      fetchUserInvoicesForApartment(selectedApartment.apartmentNumber);
    }
  };

  // Thêm hàm toggle filter panel
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Tiêu đề */}
      <Text
        color={textColor}
        fontSize='2xl'
        fontWeight='700'
        mb='20px'
      >
        Invoice Management
      </Text>

      {/* Chọn căn hộ */}
      <Card mb='20px'>
        <Flex p='20px' direction='column'>
          <Text color={textColor} fontSize='xl' fontWeight='600' mb='20px'>
            Select Apartment
          </Text>

          <FormControl>
            <Select
              value={selectedApartment?.apartmentNumber || ''}
              onChange={handleApartmentChange}
              isDisabled={isLoading || apartments.length === 0}
            >
              {apartments.map((apt) => (
                <option key={apt.apartmentNumber} value={apt.apartmentNumber}>
                  {apt.apartmentNumber}
                </option>
              ))}
            </Select>
          </FormControl>
        </Flex>
      </Card>

      <Tabs variant='soft-rounded' colorScheme='brand'>
        <TabList mb='20px'>
          <Tab>Unpaid Bills</Tab>
          <Tab>Invoices</Tab>
        </TabList>

        <TabPanels>
          {/* Tab hóa đơn chưa thanh toán */}
          <TabPanel p={0}>
            <Card mb='20px'>
              <Flex p='20px' justify='space-between' align='center'>
                <Text color={textColor} fontSize='xl' fontWeight='600'>
                  Unpaid Bills
                </Text>

                <Flex>
                  {selectedBills.length > 0 && (
                    <Button
                      colorScheme='brand'
                      mr={2}
                      onClick={createInvoiceFromSelectedBills}
                      isLoading={isLoading}
                      isDisabled={!selectedApartment}
                    >
                      Create Invoice ({selectedBills.length})
                    </Button>
                  )}
                  <Button
                    variant='outline'
                    colorScheme='brand'
                    leftIcon={<MdAdd />}
                    onClick={createInvoiceFromAllUnpaidBills}
                    isLoading={isLoading}
                    isDisabled={!selectedApartment || unpaidBills.length === 0}
                  >
                    Create Invoice for All
                  </Button>
                </Flex>
              </Flex>

              <Box overflowX='auto'>
                {isLoading ? (
                  <Flex justify='center' align='center' height='200px'>
                    <Spinner size='xl' color='brand.500' />
                  </Flex>
                ) : !selectedApartment ? (
                  <Flex justify='center' align='center' height='200px'>
                    <Text>Please select an apartment</Text>
                  </Flex>
                ) : unpaidBills.length === 0 ? (
                  <Flex justify='center' align='center' height='200px'>
                    <Text>No unpaid bills found</Text>
                  </Flex>
                ) : (
                  <Table variant='simple'>
                    <Thead>
                      <Tr>
                        <Th width='50px'>
                          <Checkbox
                            isChecked={selectedBills.length === unpaidBills.length && unpaidBills.length > 0}
                            onChange={handleSelectAllBills}
                          />
                        </Th>
                        <Th>ID</Th>
                        <Th>Bill Number</Th>
                        <Th>Type</Th>
                        <Th>Created Date</Th>
                        <Th>Due Date</Th>
                        <Th isNumeric>Amount</Th>
                        <Th>Description</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {unpaidBills.map((bill) => (
                        <Tr key={bill.id}>
                          <Td>
                            <Checkbox
                              isChecked={selectedBills.includes(bill.id)}
                              onChange={() => handleSelectBill(bill.id)}
                            />
                          </Td>
                          <Td>{bill.id}</Td>
                          <Td>{bill.billNumber}</Td>
                          <Td>{bill.billTypeName || bill.billType}</Td>
                          <Td>{formatDate(bill.createdAt)}</Td>
                          <Td>{formatDate(bill.dueDate)}</Td>
                          <Td isNumeric>{formatCurrency(bill.amount)}</Td>
                          <Td>{bill.description || ''}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </Card>
          </TabPanel>

          {/* Tab hóa đơn tổng hợp */}
          <TabPanel p={0}>
            <Card>
              <Flex p='20px' justify='space-between' align='center'>
                <Text color={textColor} fontSize='xl' fontWeight='600'>
                  Invoices
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

              {showFilters && (
                <Box p='20px' pt='0'>
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
                        <option value="PAID">Paid</option>
                        <option value="UNPAID">Unpaid</option>
                        <option value="FAILED">Failed</option>
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

              <Box overflowX='auto'>
                {isLoading ? (
                  <Flex justify='center' align='center' height='200px'>
                    <Spinner size='xl' color='brand.500' />
                  </Flex>
                ) : !selectedApartment ? (
                  <Flex justify='center' align='center' height='200px'>
                    <Text>Please select an apartment</Text>
                  </Flex>
                ) : invoices.length === 0 ? (
                  <Flex justify='center' align='center' height='200px'>
                    <Text>No invoices found</Text>
                  </Flex>
                ) : (
                  <Table variant='simple'>
                    <Thead>
                      <Tr>
                        <Th>Invoice Number</Th>
                        <Th>Created Date</Th>
                        <Th>Due Date</Th>
                        <Th isNumeric>Amount</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {invoices.map((invoice) => (
                        <Tr key={invoice.id}>
                          <Td>{invoice.invoiceNumber}</Td>
                          <Td>{formatDate(invoice.createdAt)}</Td>
                          <Td>{formatDate(invoice.dueDate)}</Td>
                          <Td isNumeric>{formatCurrency(invoice.totalAmount)}</Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(invoice.status)}>
                              {getStatusText(invoice.status)}
                            </Badge>
                          </Td>
                          <Td>
                            <Flex>
                              {invoice.status === 'UNPAID' && (
                                <Tooltip label="Pay Now">
                                  <IconButton
                                    icon={<MdPayment />}
                                    colorScheme="green"
                                    size="sm"
                                    mr={1}
                                    onClick={() => showPaymentQr(invoice)}
                                  />
                                </Tooltip>
                              )}
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
                                  <MenuItem icon={<FaFileExcel />} onClick={() => downloadInvoice(invoice.id, 'EXCEL')}>
                                    Download Excel
                                  </MenuItem>
                                  <MenuItem icon={<MdOutlineRemoveRedEye />} onClick={() => downloadInvoice(invoice.id, 'VIEW')}>
                                    View PDF
                                  </MenuItem>
                                  {invoice.status === 'UNPAID' && (
                                    <MenuItem icon={<MdQrCode />} onClick={() => showPaymentQr(invoice)}>
                                      Show Payment QR
                                    </MenuItem>
                                  )}
                                </MenuList>
                              </Menu>
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

      {/* Modal Chi tiết hóa đơn */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invoice Details</ModalHeader>
          {console.log(invoiceDetail)}
          <ModalCloseButton />
          <ModalBody pb={6}>
            {invoiceDetail ? (
              <Box>
                <SimpleGrid columns={2} spacing={4} mb={4}>
                  <FormControl>
                    <FormLabel fontWeight='bold'>Invoice Number</FormLabel>
                    <Text>{invoiceDetail.invoiceNumber}</Text>
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
                
                {/* Hiển thị QR Code nếu hóa đơn chưa thanh toán */}
                {invoiceDetail.status === 'UNPAID' && invoiceDetail.qrCode && (
                  <Box mb={4} p={4} borderWidth="1px" borderRadius="lg" bg="white">
                    <Flex direction="column" align="center">
                      <Text fontSize="lg" fontWeight="bold" mb={2}>
                        Payment QR Code
                      </Text>
                      <img 
                        src={invoiceDetail.qrCode}
                        alt="Payment QR Code" 
                        style={{ maxWidth: "200px", marginBottom: "12px" }}
                      />
                      <Text fontSize="sm" mb={3}>
                        Scan the QR code to pay via banking app
                      </Text>
                    </Flex>
                  </Box>
                )}
                
                <FormControl>
                  <FormLabel fontWeight='bold'>Bills</FormLabel>
                  {invoiceDetail.bills && invoiceDetail.bills.length > 0 ? (
                    <Table variant='simple' size='sm'>
                      <Thead>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Bill Number</Th>
                          <Th>Type</Th>
                          <Th>Amount</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {invoiceDetail.bills.map(bill => (
                          <Tr key={bill.id}>
                            <Td>{bill.id}</Td>
                            <Td>{bill.billNumber}</Td>
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
            <Button
              leftIcon={<MdOutlineRemoveRedEye />}
              colorScheme='brand'
              mr={3}
              onClick={() => invoiceDetail && downloadInvoice(invoiceDetail.id, 'VIEW')}
            >
              View PDF
            </Button>
            <Button variant='ghost' onClick={onDetailClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal QR Code thanh toán */}
      <Modal isOpen={isQrOpen} onClose={onQrClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Payment QR Code</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {isLoading ? (
              <Flex justify='center' align='center' height='200px'>
                <Spinner size='xl' color='brand.500' />
              </Flex>
            ) : paymentQrCode?.qrCode ? (
              <Flex direction="column" alignItems="center">
                <Text mb={3}>
                  Invoice: <b>{paymentQrCode.invoiceNumber}</b>
                </Text>
                <Box borderWidth="1px" borderRadius="lg" p={4} mb={4} bg="white" width="100%" textAlign="center">
                  <img
                    src={paymentQrCode.qrCode}
                    alt="Payment QR Code"
                    style={{ maxWidth: "250px", margin: "0 auto" }}
                  />
                </Box>
                <Text fontSize="sm" mb={4} textAlign="center">
                  Scan this QR code with your banking app to complete the payment
                </Text>
              </Flex>
            ) : (
              <Text textAlign="center">QR code not available</Text>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              leftIcon={<MdRefresh />}
              mr={2}
              onClick={regenerateQrCode}
              isDisabled={!paymentQrCode?.qrCode}
            >
              Regenerate QR
            </Button>
            <Button
              colorScheme="green"
              leftIcon={<MdOutlineFileDownload />}
              mr={2}
              onClick={downloadQrCode}
              isDisabled={!paymentQrCode?.qrCode}
            >
              Download QR
            </Button>
            <Button variant='ghost' onClick={onQrClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserInvoice; 