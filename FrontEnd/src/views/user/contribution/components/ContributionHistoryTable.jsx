import React, { useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  useColorModeValue,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Card,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Spinner,
  SimpleGrid,
  Divider,
  useToast,
  Image,
} from '@chakra-ui/react';
import { MdMoreVert, MdInfo, MdOutlineFileDownload, MdPictureAsPdf, MdOutlineRemoveRedEye, MdPayment, MdQrCode, MdRefresh } from 'react-icons/md';
import { FaFileExcel } from 'react-icons/fa';

import ContributionDetailsModal from './ContributionDetailsModal';
import { getContributionPaymentQR, downloadContribution } from 'views/admin/contributions/services/contributionService';

const ContributionHistoryTable = ({ history = [], onRefresh }) => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const toast = useToast();
  
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isQrOpen, onOpen: onQrOpen, onClose: onQrClose } = useDisclosure();
  
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [paymentQrCode, setPaymentQrCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'No limit';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMoney = (amount) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'VND' });
  };

  const handleViewDetails = (contribution) => {
    setSelectedContribution(contribution);
    onDetailOpen();
  };

  const handleShowPayment = async (contribution) => {
    setIsLoading(true);
    try {
      const response = await getContributionPaymentQR(contribution.id);
      setPaymentQrCode({
        contributionId: contribution.id,
        contributionName: contribution.name || contribution.title || contribution.contributionName,
        qrCode: response.qrCodeUrl || response.qrCode
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

  const handleDownload = async (contribution, type) => {
    setIsLoading(true);
    try {
      await downloadContribution(contribution.id, type);
      toast({
        title: 'Success',
        description: type === 'VIEW' ? 'Document opened successfully' : 'Document downloaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${type === 'VIEW' ? 'view' : 'download'} document: ${error.message}`,
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
    if (!paymentQrCode?.contributionId) return;
    
    setIsLoading(true);
    try {
      const response = await getContributionPaymentQR(paymentQrCode.contributionId);
      
      setPaymentQrCode({
        ...paymentQrCode,
        qrCode: response.qrCodeUrl || response.qrCode
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
        link.download = `contribution-qr-${paymentQrCode.contributionId}.png`;
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

  const getStatusBadge = (status) => {
    let colorScheme = 'gray';
    let label = status;

    switch (status?.toLowerCase()) {
      case 'closed':
        colorScheme = 'red';
        break;
      case 'completed':
        colorScheme = 'green';
        break;
      case 'in_progress':
        colorScheme = 'orange';
        label = 'In Progress';
        break;
      case 'active':
        colorScheme = 'green';
        break;
      default:
        break;
    }

    return <Badge colorScheme={colorScheme}>{label}</Badge>;
  };

  return (
    <>
      <Card>
        <Box overflowX="auto" p="20px">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color={textColor}>Name</Th>
                <Th color={textColor}>Type</Th>
                <Th color={textColor}>Amount</Th>
                <Th color={textColor}>Date</Th>
                <Th color={textColor}>Status</Th>
                <Th color={textColor}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {history.length === 0 ? (
                <Tr>
                  <Td colSpan={6}>
                    <Text textAlign="center" py="4">
                      No contribution history found
                    </Text>
                  </Td>
                </Tr>
              ) : (
                history.map((item) => (
                  <Tr key={item.id}>
                    <Td color={textColor}>
                      <Text fontWeight="500">{item.name || item.title || item.contributionName}</Text>
                    </Td>
                    <Td color={textColor}>
                      {item.type?.name || item.contributionTypeName || 'General'}
                    </Td>
                    <Td color={textColor}>
                      {formatMoney(item.amount || item.userContribution || 0)}
                    </Td>
                    <Td color={textColor}>{formatDate(item.contributedAt || item.createdAt)}</Td>
                    <Td>
                      {getStatusBadge(item.status)}
                    </Td>
                    <Td>
                      <Flex>
                        {(item.status?.toLowerCase() === 'active' || item.status?.toLowerCase() === 'in_progress') && (
                          <Tooltip label="Pay Now">
                            <IconButton
                              icon={<MdPayment />}
                              colorScheme="green"
                              size="sm"
                              mr={1}
                              onClick={() => handleShowPayment(item)}
                              isLoading={isLoading}
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
                            <MenuItem 
                              icon={<MdInfo />} 
                              onClick={() => handleViewDetails(item)}
                            >
                              View Details
                            </MenuItem>
                            <MenuItem 
                              icon={<MdOutlineFileDownload />} 
                              onClick={() => handleDownload(item, 'WORD')}
                              isDisabled={isLoading}
                            >
                              Download Word
                            </MenuItem>
                            <MenuItem 
                              icon={<MdPictureAsPdf />} 
                              onClick={() => handleDownload(item, 'PDF')}
                              isDisabled={isLoading}
                            >
                              Download PDF
                            </MenuItem>
                            <MenuItem 
                              icon={<MdOutlineRemoveRedEye />} 
                              onClick={() => handleDownload(item, 'VIEW')}
                              isDisabled={isLoading}
                            >
                              View PDF
                            </MenuItem>
                            <MenuItem 
                              icon={<FaFileExcel />} 
                              onClick={() => handleDownload(item, 'EXCEL')}
                              isDisabled={isLoading}
                            >
                              Download Excel
                            </MenuItem>
                            {(item.status?.toLowerCase() === 'active' || item.status?.toLowerCase() === 'in_progress') && (
                              <MenuItem 
                                icon={<MdQrCode />} 
                                onClick={() => handleShowPayment(item)}
                                isDisabled={isLoading}
                              >
                                Show Payment QR
                              </MenuItem>
                            )}
                          </MenuList>
                        </Menu>
                      </Flex>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* Contribution Detail Modal */}
      {selectedContribution && (
        <ContributionDetailsModal
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          contribution={selectedContribution}
        />
      )}
      
      {/* QR Code Payment Modal */}
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
                  Contribution: <b>{paymentQrCode.contributionName}</b>
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
                
                {/* Hiển thị danh sách invoices nếu có */}
                {paymentQrCode.invoices && paymentQrCode.invoices.length > 0 && (
                  <>
                    <Divider my={4} />
                    <Text fontWeight="bold" mb={2}>Related Invoices</Text>
                    <Box width="100%">
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Invoice #</Th>
                            <Th>Date</Th>
                            <Th isNumeric>Amount</Th>
                            <Th>Status</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {paymentQrCode.invoices.map(invoice => (
                            <Tr key={invoice.id}>
                              <Td>{invoice.invoiceNumber}</Td>
                              <Td>{formatDate(invoice.createdAt)}</Td>
                              <Td isNumeric>{formatMoney(invoice.totalAmount)}</Td>
                              <Td>
                                <Badge 
                                  colorScheme={invoice.status === 'PAID' ? 'green' : 
                                    invoice.status === 'UNPAID' ? 'orange' : 'red'}
                                >
                                  {invoice.status}
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </>
                )}
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
              isDisabled={!paymentQrCode?.qrCode || isLoading}
            >
              Regenerate QR
            </Button>
            <Button
              colorScheme="green"
              leftIcon={<MdOutlineFileDownload />}
              mr={2}
              onClick={downloadQrCode}
              isDisabled={!paymentQrCode?.qrCode || isLoading}
            >
              Download QR
            </Button>
            <Button variant='ghost' onClick={onQrClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ContributionHistoryTable; 
