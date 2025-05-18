import {
    Flex,
    Box,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    Input,
    useColorModeValue,
    Button,
    useDisclosure,
    Icon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Link,
  } from '@chakra-ui/react';
  import * as React from 'react';
  import { useToast } from '@chakra-ui/react';
  import { HStack } from '@chakra-ui/react';
  import { WarningIcon } from '@chakra-ui/icons';
  import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
  } from '@tanstack/react-table';
  import axios from 'axios';
  import { MdCheckCircle, MdCancel, MdHourglassEmpty, MdAutorenew } from 'react-icons/md';
  // Custom components
  import Card from 'components/card/Card';
  import Menu from 'components/menu/TableMenu';
  import PaymentModal from './PaymentModal';
  
  const columnHelper = createColumnHelper();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  
  export default function BillPaymentTable({ tableData, columnsConfig, refreshData }) {
    const [sorting, setSorting] = React.useState([]);
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
    const toast = useToast();
    const [data, setData] = React.useState([]);
    const [originalData, setOriginalData] = React.useState([]);
    const [error, setError] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isVisible, setIsVisible] = React.useState(true);
    const rowsPerPage = 5;
    const [mode, setMode] = React.useState('');
    const [selectedBillId, setSelectedBillId] = React.useState(null);
    const [selectedContent, setSelectedContent] = React.useState('');
    const { isOpen, onOpen, onClose } = useDisclosure(); // For PaymentModal
    const contentDisclosure = useDisclosure(); // For content view modal
    const [newPayment, setNewPayment] = React.useState({
      title: '',
      content: '',
      type: 'Payment',
    });
  
    const handleSubmit = async (formData) => {
      setError([]);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication failed: No token found!');
        }
  
        const response = await axios.post(
          `${API_BASE_URL}/api/payments/process`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
  
        if (response.status === 200) {
          toast({
            title: 'Payment Submitted!',
            description: 'Your payment has been successfully submitted.',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
          refreshData();
          onClose();
        }
      } catch (err) {
        console.error('Submit Error:', err);
        const errorMessage = err.response?.data?.message || 'Error in server, please try later.';
        setError([errorMessage]);
        toast({
          title: 'Payment Failed!',
          description: errorMessage,
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
      }
    };
  
    React.useEffect(() => {
      if (Array.isArray(tableData)) {
        console.log('tableData:', tableData); // Debug: Inspect tableData
        setOriginalData(tableData);
        setData(tableData);
      } else {
        console.warn('tableData is not an array, skipping update');
      }
    }, [tableData]);
  
    const [searchTerm, setSearchTerm] = React.useState('');
  
    React.useEffect(() => {
      if (searchTerm.trim() === '') {
        setData(originalData);
      } else {
        setData(
          originalData.filter((item) =>
            Object.values(item).some((value) =>
              String(value).toLowerCase().includes(searchTerm.toLowerCase()),
            ),
          ),
        );
      }
      setCurrentPage(1);
    }, [searchTerm, originalData]);
  
    const formatBillType = (value) => {
      if (!value) return value;
      return value
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };
  
    const generateColumns = (columnsConfig) => {
      const dataColumns = columnsConfig.map(({ Header, accessor }) =>
        columnHelper.accessor(accessor, {
          id: accessor,
          header: () => (
            <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
              {Header}
            </Text>
          ),
          cell: (info) => {
            const value = info.getValue();
            if (accessor === 'status') {
              let statusText, icon, iconColor;
              switch (value) {
                case 'PENDING':
                  statusText = 'Pending';
                  icon = MdHourglassEmpty;
                  iconColor = 'yellow.500';
                  break;
                case 'IN_PROGRESS':
                  statusText = 'In Progress';
                  icon = MdAutorenew;
                  iconColor = 'blue.500';
                  break;
                case 'PAID':
                  statusText = 'Paid';
                  icon = MdCheckCircle;
                  iconColor = 'green.500';
                  break;
                case 'OVERDUE':
                  statusText = 'Overdue';
                  icon = MdCancel;
                  iconColor = 'red.500';
                  break;
                case 'UNPAID':
                  statusText = 'Unpaid';
                  icon = MdCancel;
                  iconColor = 'red.500';
                  break;
                default:
                  console.warn('Unexpected status value:', value);
                  statusText = String(value);
                  icon = null;
                  iconColor = textColor;
              }
              return (
                <Flex align="center">
                  {icon && (
                    <Icon
                      as={icon}
                      w="20px"
                      h="20px"
                      color={iconColor}
                      mr="8px"
                    />
                  )}
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {statusText}
                  </Text>
                </Flex>
              );
            } else if (accessor === 'billType') {
              return (
                <Text color={textColor} fontSize="sm" fontWeight="700">
                  {formatBillType(value)}
                </Text>
              );
            } else if (accessor === 'content') {
              if (value.length > 300) {
                return (
                  <Flex align="center" wrap="wrap">
                    <Text color={textColor} fontSize="sm" fontWeight="700" width="100%">
                      {value.slice(0, 300)}...{'             '}
                      <Link
                        color="blue.500"
                        fontSize="sm"
                        textDecor="underline"
                        onClick={() => {
                          setSelectedContent(value);
                          contentDisclosure.onOpen();
                        }}
                      >
                        View more
                      </Link>
                    </Text>
                  </Flex>
                );
              }
              return (
                <Text color={textColor} fontSize="sm" fontWeight="700">
                  {value}
                </Text>
              );
            }
            return (
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {value}
              </Text>
            );
          },
        }),
      );
  
      const actionColumn = columnHelper.display({
        id: 'action',
        header: () => (
          <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
            ACTION
          </Text>
        ),
        cell: (info) => {
          const row = info.row.original;
          const isDisabled = row.status === 'PAID';
          return (
            <Button
              colorScheme="green"
              fontSize="sm"
              fontWeight="500"
              borderRadius="10px"
              px="15px"
              py="5px"
              isDisabled={isDisabled}
              onClick={() => {
                setSelectedBillId(row.id);
                setMode('pay');
                onOpen();
              }}
            >
              Pay
            </Button>
          );
        },
      });
  
      return [...dataColumns, actionColumn];
    };
  
    const columns = generateColumns(columnsConfig);
  
    const table = useReactTable({
      data,
      columns,
      state: { sorting },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });
  
    const totalPages = Math.ceil(table.getRowModel().rows.length / rowsPerPage);
    const paginatedRows = table
      .getRowModel()
      .rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  
    return (
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Flex align="center">
            <Text
              color={textColor}
              fontSize="22px"
              fontWeight="700"
              lineHeight="100%"
              mr="12px"
            >
              Your Bills
            </Text>
          </Flex>
          <Flex align="center">
            <Text
              color={textColor}
              fontSize="17px"
              fontWeight="700"
              lineHeight="100%"
              mr="12px"
            >
              Export to
            </Text>
            <Menu />
          </Flex>
        </Flex>
  
        {isVisible && (
          <>
            <Box px="25px" mb="12px">
              <Input
                placeholder="Search by bill title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="md"
                bg="whiteAlpha.800"
                _placeholder={{ color: 'gray.500' }}
              />
            </Box>
  
            <Table variant="simple" color="gray.500" mb="24px" mt="12px">
              <Thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Th
                        key={header.id}
                        pe="10px"
                        borderColor={borderColor}
                        cursor="pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <Flex
                          justifyContent="space-between"
                          align="center"
                          fontSize={{ sm: '10px', lg: '12px' }}
                          color="gray.400"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </Flex>
                      </Th>
                    ))}
                  </Tr>
                ))}
              </Thead>
              <Tbody>
                {paginatedRows.map((row) => (
                  <Tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <Td
                        key={cell.id}
                        fontSize={{ sm: '14px' }}
                        minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                        borderColor="transparent"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Flex justifyContent="center" mt={4} mb={4}>
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                isDisabled={currentPage === 1}
                mr={2}
              >
                Previous
              </Button>
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  variant={currentPage === index + 1 ? 'solid' : 'outline'}
                  mx={1}
                >
                  {index + 1}
                </Button>
              ))}
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                isDisabled={currentPage === totalPages}
                ml={2}
              >
                Next
              </Button>
            </Flex>
          </>
        )}
  
            <PaymentModal
            isOpen={isOpen}
            onClose={onClose}
            id={selectedBillId}
            />
  
        <Modal isOpen={contentDisclosure.isOpen} onClose={contentDisclosure.onClose} size="2xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Full Bill Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>{selectedContent}</Text>
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
                onClick={contentDisclosure.onClose}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Card>
    );
  }