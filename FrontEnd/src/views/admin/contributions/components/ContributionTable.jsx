import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Badge,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useToast,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Progress,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdMoreVert, MdDone, MdRefresh, MdInfo, MdPictureAsPdf, MdFileDownload } from 'react-icons/md';
import { FaFileExcel } from 'react-icons/fa';

import { closeContribution, cancelContribution, reactivateContribution, getContributionById, downloadContribution } from '../services/contributionService';
import EditContributionModal from './EditContributionModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// Temporary replacement for date-fns
const format = (date, formatString, options = {}) => {
  return new Date(date).toLocaleDateString('en-US');
};

const ContributionTable = ({ contributions = [], onRefresh, isLoading = false }) => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgTable = useColorModeValue('white', 'navy.700');
  const bgTableHeader = useColorModeValue('gray.50', 'whiteAlpha.100');
  const toast = useToast();
  
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [contributionDetail, setContributionDetail] = useState(null);

  const handleEditClick = (contribution) => {
    setSelectedContribution(contribution);
    onEditOpen();
  };

  const handleDeleteClick = (contribution) => {
    setSelectedContribution(contribution);
    onDeleteOpen();
  };

  const handleDetailClick = async (contribution) => {
    setSelectedContribution(contribution);
    setDetailLoading(true);
    try {
      const detail = await getContributionById(contribution.id);
      setContributionDetail(detail);
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
      setDetailLoading(false);
    }
  };

  const handleCloseContribution = async (id) => {
    try {
      await closeContribution(id);
      onRefresh();
      toast({
        title: 'Success',
        description: 'Contribution closed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to close contribution',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancelContribution = async (id) => {
    try {
      await cancelContribution(id);
      onRefresh();
      toast({
        title: 'Success',
        description: 'Contribution canceled successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel contribution',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReactivateContribution = async (id) => {
    try {
      await reactivateContribution(id);
      onRefresh();
      toast({
        title: 'Success',
        description: 'Contribution reactivated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reactivate contribution',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString));
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'CLOSED':
        return 'Closed';
      case 'CANCELED':
        return 'Canceled';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'CLOSED':
        return 'orange';
      case 'CANCELED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: "NAME",
        accessor: 'title',
      },
      {
        Header: "TYPE",
        accessor: 'contributionTypeName',
      },
      {
        Header: "DESCRIPTION",
        accessor: 'description',
      },
      {
        Header: "TARGET",
        accessor: 'targetAmount',
        Cell: ({ value }) => value ? `${value.toLocaleString()} VND` : 'Unlimited',
      },
      {
        Header: "COLLECTED",
        accessor: 'totalAmount',
        Cell: ({ value }) => `${value ? value.toLocaleString() : 0} VND`,
      },
      {
        Header: "START DATE",
        accessor: 'startDate',
        Cell: ({ value }) => format(value, 'MM/dd/yyyy'),
      },
      {
        Header: "END DATE",
        accessor: 'endDate',
        Cell: ({ value }) => value ? format(value, 'MM/dd/yyyy') : 'Unlimited',
      },
      {
        Header: "STATUS",
        accessor: 'status',
        Cell: ({ value }) => (
          <Badge
            colorScheme={value === 'ACTIVE' ? 'green' : 'gray'}
            borderRadius="full"
            px="3"
            py="1"
          >
            {value === 'ACTIVE' ? 'Open' : 'Closed'}
          </Badge>
        ),
      },
    ],
    []
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <Flex justify="center" align="center" width="100%" py={10}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      );
    }

    return (
      <Box
        bg={bgTable}
        boxShadow="0px 2px 5.5px rgba(0, 0, 0, 0.02)"
        borderRadius="16px"
        overflow="hidden"
      >
        <Box overflowX="auto">
          <Table variant="simple" color="gray.500" mb="0">
            <Thead bg={bgTableHeader}>
              <Tr>
                {columns.map((column, index) => (
                  <Th
                    key={index}
                    pe="10px"
                    borderColor={borderColor}
                    color="gray.400"
                  >
                    {column.Header}
                  </Th>
                ))}
                <Th borderColor={borderColor} color="gray.400">
                  ACTIONS
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {contributions.length > 0 ? (
                contributions.map((row, index) => (
                  <Tr key={index}>
                    {columns.map((column, columnIndex) => (
                      <Td
                        key={columnIndex}
                        fontSize={{ sm: '14px' }}
                        borderColor={borderColor}
                        minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                      >
                        {column.Cell ? (
                          column.Cell({ value: row[column.accessor.split('.')[0]] })
                        ) : (
                          column.accessor.includes('.') ? (
                            row[column.accessor.split('.')[0]]?.[column.accessor.split('.')[1]]
                          ) : (
                            row[column.accessor]
                          )
                        )}
                      </Td>
                    ))}
                    <Td borderColor={borderColor}>
                      <Menu placement="bottom-end">
                        <MenuButton
                          as={IconButton}
                          icon={<MdMoreVert />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList minW="150px">
                          <MenuItem 
                            icon={<MdInfo />} 
                            onClick={() => handleDetailClick(row)}
                          >
                            View Details
                          </MenuItem>
                          <MenuItem 
                            icon={<MdEdit />} 
                            onClick={() => handleEditClick(row)}
                          >
                            Edit
                          </MenuItem>
                          {row.status === 'ACTIVE' && (
                            <MenuItem 
                              icon={<MdDone />} 
                              onClick={() => handleCloseContribution(row.id)}
                            >
                              Close
                            </MenuItem>
                          )}
                          {row.status === 'CLOSED' && (
                            <MenuItem 
                              icon={<MdRefresh />} 
                              onClick={() => handleReactivateContribution(row.id)}
                            >
                              Reactivate
                            </MenuItem>
                          )}
                          <MenuItem 
                            icon={<MdDelete />} 
                            onClick={() => handleDeleteClick(row)}
                            color="red.500"
                          >
                            Cancel
                          </MenuItem>
                          <MenuItem 
                            icon={<MdPictureAsPdf />}
                            onClick={() => downloadContribution(row.id, 'PDF')}
                          >
                            Export to PDF
                          </MenuItem>
                          <MenuItem 
                            icon={<FaFileExcel />}
                            onClick={() => downloadContribution(row.id, 'EXCEL')}
                          >
                            Export to Excel
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={columns.length + 1} textAlign="center">
                    <Text fontSize="lg" py={4}>
                      No contribution data available
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>
    );
  };

  return (
    <>
      {renderContent()}

      {selectedContribution && (
        <>
          <EditContributionModal
            isOpen={isEditOpen}
            onClose={onEditClose}
            contribution={selectedContribution}
            onRefresh={onRefresh}
          />

          <DeleteConfirmationModal
            isOpen={isDeleteOpen}
            onClose={onDeleteClose}
            onConfirm={() => {
              handleCancelContribution(selectedContribution.id);
              onDeleteClose();
            }}
            title="Cancel Contribution"
            message={`Are you sure you want to cancel the contribution "${selectedContribution.title}"? This action cannot be undone.`}
          />
        </>
      )}

      {/* Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Contribution Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {detailLoading ? (
              <Flex justify="center" py={10}>
                <Spinner size="xl" color="brand.500" />
              </Flex>
            ) : contributionDetail ? (
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={4}>{contributionDetail.title}</Text>
                <Text mb={4}>{contributionDetail.description}</Text>
                
                <StatGroup mb={6} bg="gray.50" p={4} borderRadius="md">
                  <Stat>
                    <StatLabel>Participants</StatLabel>
                    <StatNumber>{contributionDetail.participants || 0}</StatNumber>
                    <StatHelpText>People contributing</StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Amount</StatLabel>
                    <StatNumber>{formatCurrency(contributionDetail.collectedAmount || 0)}</StatNumber>
                    <StatHelpText>of {formatCurrency(contributionDetail.targetAmount || 0)}</StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Contributions</StatLabel>
                    <StatNumber>{contributionDetail.contributionCount || 0}</StatNumber>
                    <StatHelpText>{contributionDetail.pendingCount || 0} pending</StatHelpText>
                  </Stat>
                </StatGroup>
                
                <Box mb={4}>
                  <Text fontWeight="medium" mb={2}>Progress</Text>
                  <Progress 
                    value={(contributionDetail.collectedAmount / contributionDetail.targetAmount) * 100 || 0} 
                    colorScheme="green" 
                    size="sm" 
                    borderRadius="md" 
                  />
                  <Flex justify="space-between" mt={1}>
                    <Text fontSize="sm">{formatCurrency(contributionDetail.collectedAmount || 0)}</Text>
                    <Text fontSize="sm">{formatCurrency(contributionDetail.targetAmount || 0)}</Text>
                  </Flex>
                </Box>
                
                <Box>
                  <Text fontWeight="medium" mb={2}>Time Frame</Text>
                  <Flex justify="space-between" bg="gray.50" p={3} borderRadius="md">
                    <Box>
                      <Text fontSize="sm" color="gray.500">Start Date</Text>
                      <Text>{formatDate(contributionDetail.startDate)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">End Date</Text>
                      <Text>{formatDate(contributionDetail.endDate)}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Status</Text>
                      <Badge colorScheme={getStatusColor(contributionDetail.status)}>
                        {getStatusLabel(contributionDetail.status)}
                      </Badge>
                    </Box>
                  </Flex>
                </Box>
              </Box>
            ) : (
              <Text>No contribution details available</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" mr={3} onClick={onDetailClose}>
              Close
            </Button>
            <Button variant="outline" leftIcon={<MdFileDownload />}>
              Export Details
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ContributionTable; 