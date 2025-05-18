import {
  Flex,
  Box,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Icon,
  Tr,
  Input,
  useColorModeValue,
  Button,
  useDisclosure,
  Spinner,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
} from '@chakra-ui/react';
import * as React from 'react';
import { useToast } from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import ApartmentFilterModal from './FilterModal';
import Card from 'components/card/Card';
import Menu from 'components/menu/TableMenu';
import { IconButton } from '@chakra-ui/react';
import { MdCancel, MdCheckCircle } from 'react-icons/md';
import AppartmentModal from './ApartmentModal';
import columnsDataIcon from '../dataTables/components/AppartmentIconButton';
import UserListModal from '../dataTables/components/UserListModal';
import { FiPlus, FiFilter, FiCheckSquare, FiXSquare, FiDownload, FiEdit } from 'react-icons/fi';

const columnHelper = createColumnHelper();
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Simple cache object for API responses
const cache = {};

const activateAccount = async (globalId, toast) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Authentication failed: No token found!');
      return;
    }

    const response = await axios.post(
      `${API_BASE_URL}/admin/activate/${globalId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status === 200) {
      toast({
        title: 'Account activated!',
        description: `Account with ID: ${globalId} has been successfully activated.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  } catch (error) {
    console.error('Error activating account:', error);
    toast({
      title: 'Activation failed!',
      description: 'An error occurred while activating the account.',
      status: 'error',
      duration: 2000,
      isClosable: true,
    });
  }
};

const toggleStatus = (id, accessor, setOriginalData, setData) => {
  setOriginalData((prevData) =>
    prevData.map((item) =>
      item.id === id ? { ...item, [accessor]: !item[accessor] } : item,
    ),
  );

  setData((prevData) =>
    prevData.map((item) =>
      item.id === id ? { ...item, [accessor]: !item[accessor] } : item,
    ),
  );
};

const generateColumns = (
  columnsConfig,
  textColor,
  setData,
  toggleStatus,
  toast,
  handleEdit,
  handleView,
  selectedRows,
  setSelectedRows,
) => {
  return [
    {
      id: 'select',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Select
        </Text>
      ),
      cell: ({ row }) => (
        <Checkbox
          isChecked={selectedRows.includes(row.original.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows([...selectedRows, row.original.id]);
            } else {
              setSelectedRows(selectedRows.filter((id) => id !== row.original.id));
            }
          }}
        />
      ),
    },
    ...columnsConfig.map(({ Header, accessor }) =>
      columnHelper.accessor(accessor, {
        id: accessor,
        header: () => (
          <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
            {Header}
          </Text>
        ),
        cell: (info) => {
          const row = info.row.original;
          const cellValue = info.getValue();

          if (typeof cellValue === 'boolean') {
            return (
              <Flex
                align="center"
                cursor="pointer"
                onClick={() => {
                  toggleStatus(row.id, accessor);
                  activateAccount(row.id, toast);
                }}
              >
                <IconButton
                  aria-label={cellValue ? 'Activated' : 'Unactivated'}
                  icon={
                    <Icon
                      w="24px"
                      h="24px"
                      me="5px"
                      color={cellValue ? 'green.500' : 'red.500'}
                      as={cellValue ? MdCheckCircle : MdCancel}
                    />
                  }
                  size="sm"
                  variant="ghost"
                  mr="8px"
                />
                <Text color={textColor} fontSize="sm" fontWeight="700">
                  {cellValue ? 'Activated' : 'Unactivated'}
                </Text>
              </Flex>
            );
          }

          return (
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {cellValue}
            </Text>
          );
        },
      }),
    ),
    ...columnsDataIcon({ setData, toast, handleEdit, handleView }),
  ];
};

export default function ColumnTable({ tableData, columnsConfig, refreshData }) {
  const [userList, setUserList] = React.useState([]);
  const [isUserListOpen, setUserListOpen] = React.useState(false);
  const [sorting, setSorting] = React.useState([]);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const toast = useToast();
  const [data, setData] = React.useState([]);
  const [originalData, setOriginalData] = React.useState([]);
  const [error, setError] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isVisible, setIsVisible] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const rowsPerPage = 5;
  const [idEdit, setIdEdit] = React.useState(0);
  const [mode, setMode] = React.useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
  const { isOpen: isStatusModalOpen, onOpen: onStatusModalOpen, onClose: onStatusModalClose } = useDisclosure();
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [selectedStatus, setSelectedStatus] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAllSelected, setIsAllSelected] = React.useState(false);

  const [newUser, setNewUser] = React.useState({
    apartmentNumber: '',
    roomNumber: '',
    floor: '',
    area: '',
    type: '',
    status: ''
  });

  // Debounce search term to prevent excessive filtering
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleFilterSuccess = (newData) => {
    setOriginalData(newData);
    setData(newData);
    setCurrentPage(1);
    setIsLoading(false);
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication failed: No token found!');
      }

      const response = await fetch(`${API_BASE_URL}/api/export/apartments`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export apartments');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'apartments.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful!',
        description: 'The apartment data has been exported to an Excel file.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error exporting apartments:', error);
      toast({
        title: 'Export Failed!',
        description: 'An error occurred while exporting the apartment data.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitUserData = async (
    url,
    method,
    formData,
    expectedResponse,
    successTitle,
  ) => {
    setError([]);
    console.log(
      `${method === 'POST' ? 'Saving' : 'Editing'} user:`,
      JSON.stringify(formData),
    );

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, id: idEdit }),
      });

      const rawData = await response.text();
      console.log('Raw response:', rawData);

      if (rawData === expectedResponse) {
        toast({
          title: successTitle,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });

        if (mode === 'edit') {
          const updatedApartment = {
            id: idEdit,
            ...formData,
            billIds: [],
            residentIds: [],
            parkingRentals: []
          };
          setData((prevData) =>
            prevData.map((item) =>
              item.id === idEdit ? updatedApartment : item,
            ),
          );
          setOriginalData((prevData) =>
            prevData.map((item) =>
              item.id === idEdit ? updatedApartment : item,
            ),
          );
        }

        refreshData();
        onClose();
        return;
      }

      let data;
      try {
        data = JSON.parse(rawData);
      } catch (jsonError) {
        data = { message: rawData };
      }

      if (!response.ok) {
        const errorMessages =
          data && typeof data === 'object'
            ? Object.values(data)
            : ['Registration failed'];
        setError(errorMessages);
        return;
      }
    } catch (err) {
      console.error('Fetch Error:', err);

      let errorMessage = 'Error in server, please try later.';

      if (
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError')
      ) {
        errorMessage = 'Error in server, please try later.';
      } else {
        errorMessage = err.message;
      }

      if (errorMessage.includes(' | ')) {
        setError(errorMessage.split(' | '));
      } else {
        setError([errorMessage]);
      }
    }
  };

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    if (mode === 'create') {
      await submitUserData(
        `${API_BASE_URL}/api/admin/apartment-list/add-apartment`,
        'POST',
        formData,
        'Apartment created successfully',
        'Creation Successful!',
      );
    } else if (mode === 'edit') {
      console.log("formdata = ", formData);
      await submitUserData(
        `${API_BASE_URL}/api/admin/apartment-list/edit-apartment`,
        'POST',
        formData,
        'Apartment updated successfully',
        'Updating Successful!',
      );
    }
    setIsLoading(false);
  };

  const handleView = async (id) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/admin/apartment-list/residents/${id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const rawData = await response.text();
      console.log('rawData = ', rawData);
      let data = JSON.parse(rawData);
      setUserList(data);
      setUserListOpen(true);
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast({
        title: 'Failed!',
        description: 'An error occurred while viewing the residents.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/admin/apartment-list/edit-apartment/${id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const rawData = await response.json();
      console.log('rawData when edit = ', rawData);

      setNewUser({
        apartmentNumber: rawData.apartmentNumber || '',
        roomNumber: rawData.roomNumber || '',
        floor: rawData.floor || '',
        area: rawData.area || '',
        type: rawData.type || '',
        status: rawData.status || ''
      });

      setMode('edit');
      setIdEdit(id);
      onOpen();
    } catch (error) {
      console.error('Error fetching apartment:', error);
      toast({
        title: 'Failed!',
        description: 'An error occurred while editing the apartment.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    setSelectedRows(data.map((item) => item.id));
  };

  const handleDeselectAll = () => {
    setSelectedRows([]);
  };

  const handleSetStatus = async () => {
    if (!selectedRows.length) {
      toast({
        title: 'No apartments selected!',
        description: 'Please select at least one apartment to update status.',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    onStatusModalOpen();
  };

  const handleStatusSubmit = async () => {
    if (!selectedStatus) {
      toast({
        title: 'No status selected!',
        description: 'Please select a status to update.',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/apartments/batch-update-status`,
        {
          ids: selectedRows,
          status: selectedStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        toast({
          title: 'Status Updated!',
          description: `Status for ${selectedRows.length} apartments updated to ${selectedStatus}.`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });

        setData((prevData) =>
          prevData.map((item) =>
            selectedRows.includes(item.id) ? { ...item, status: selectedStatus } : item,
          ),
        );
        setOriginalData((prevData) =>
          prevData.map((item) =>
            selectedRows.includes(item.id) ? { ...item, status: selectedStatus } : item,
          ),
        );
        setSelectedRows([]);
        onStatusModalClose();
        refreshData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Update Failed!',
        description: 'An error occurred while updating the status.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize filtered data to prevent unnecessary re-computations
  const filteredData = React.useMemo(() => {
    if (searchTerm.trim() === '') {
      return originalData;
    }
    return originalData.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [searchTerm, originalData]);

  // Debounced search handler
  const debouncedSetSearchTerm = React.useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    [],
  );
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows([]);
      setIsAllSelected(false);
    } else {
      setSelectedRows(data.map((item) => item.id));
      setIsAllSelected(true);
    }
  };

  React.useEffect(() => {
    setIsLoading(true);
    if (Array.isArray(tableData)) {
      setOriginalData(tableData);
      setData(tableData);
      setIsLoading(false);
    } else {
      console.warn('tableData is not an array, skipping update');
      setIsLoading(false);
    }
  }, [tableData]);

  const toggleStatusHandler = (id, accessor) =>
    toggleStatus(id, accessor, setOriginalData, setData);

  const columns = React.useMemo(
    () =>
      generateColumns(
        columnsConfig,
        textColor,
        setData,
        toggleStatusHandler,
        toast,
        handleEdit,
        handleView,
        selectedRows,
        setSelectedRows,
      ),
    [columnsConfig, textColor, selectedRows],
  );

  const table = useReactTable({
    data: filteredData,
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

  const maxPageNumbers = 5;
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

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
            Apartment Table
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
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        <Flex align="center" gap="8px" flexWrap="wrap">
          <Button
            leftIcon={<FiPlus />}
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="10px"
            px="15px"
            py="5px"
            onClick={() => {
              onOpen();
              setMode('create');
              setNewUser({
                apartmentNumber: '',
                roomNumber: '',
                floor: '',
                area: '',
                type: '',
                status: ''
              });
            }}
          >
            New Apartment
          </Button>
          <Button
            leftIcon={<FiFilter />}
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="10px"
            px="15px"
            py="5px"
            onClick={onFilterOpen}
          >
            Filter
          </Button>
          <Button
            leftIcon={isAllSelected ? <FiXSquare /> : <FiCheckSquare />}
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="10px"
            px="15px"
            py="5px"
            onClick={handleToggleSelectAll}
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </Button>
          <Button
            leftIcon={<FiEdit />}
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="10px"
            px="15px"
            py="5px"
            onClick={handleSetStatus}
          >
            Set Status
          </Button>
          <Button
            leftIcon={<FiDownload />}
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="10px"
            px="15px"
            py="5px"
            onClick={handleExport}
          >
            Export
          </Button>
        </Flex>
        <Box w={{ base: '100%', md: '300px' }}>
          <Input
            placeholder="Search by apartment number..."
            onChange={(e) => debouncedSetSearchTerm(e.target.value)}
            size="md"
            bg="whiteAlpha.800"
            borderRadius="8px"
            _placeholder={{ color: 'gray.500' }}
          />
        </Box>
      </Flex>

      {isVisible && (
        <>
          {isLoading || !tableData || tableData.length === 0 ? (
            <Flex 
              justify="center" 
              align="center" 
              py="20px" 
              minH="200px" 
              flexDirection="column"
              gap="4"
            >
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
              <Text color={textColor} fontSize="md">
                Loading apartment data...
              </Text>
            </Flex>
          ) : (
            <>
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
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                {pageNumbers.map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? 'solid' : 'outline'}
                    mx={1}
                    size="sm"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  isDisabled={currentPage === totalPages}
                  ml={2}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </Flex>
            </>
          )}
        </>
      )}

      <AppartmentModal
        isOpen={isOpen}
        onClose={onClose}
        userData={newUser}
        mode={mode}
        onSubmit={handleSubmit}
        error={error}
      />
      <UserListModal
        isOpen={isUserListOpen}
        onClose={() => setUserListOpen(false)}
        users={userList}
      />
      <ApartmentFilterModal
        isOpen={isFilterOpen}
        onClose={onFilterClose}
        onFilterSuccess={handleFilterSuccess}
      />

      <Modal isOpen={isStatusModalOpen} onClose={onStatusModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Setup Apartment Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              You are setting up status for {selectedRows.length} apartment(s).
            </Text>
            <Select
              placeholder="Select status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="OCCUPIED">OCCUPIED</option>
              <option value="VACANT">VACANT</option>
              <option value="RENT">RENT</option>
            </Select>
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
              mr={3}
              onClick={handleStatusSubmit}
            >
              Submit
            </Button>
            <Button variant="ghost" onClick={onStatusModalClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}