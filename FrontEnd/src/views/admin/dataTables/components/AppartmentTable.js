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
// Custom components
import Card from 'components/card/Card';
import Menu from 'components/menu/TableMenu';
import { IconButton } from '@chakra-ui/react';
import { MdCancel, MdCheckCircle } from 'react-icons/md';
import AppartmentModal from './AppartmentModal';
import columnsDataIcon from './AppartmentIconButton';
import UserListModal from './UserListModal';
const columnHelper = createColumnHelper();
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const activateAccount = async (globalId, toast) => {
  try {
    const token = localStorage.getItem('token'); // Lấy token từ localStorage
    if (!token) {
      console.log('Authentication failed: No token found!');
      return;
    }

    const response = await axios.post(
      `${API_BASE_URL}/admin/activate/${globalId}`,
      {}, // Body rỗng
      {
        headers: {
          Authorization: `Bearer ${token}`, // Gửi token trong header
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
  formData,
) => {
  return [
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
    ...columnsDataIcon({ setData, toast, handleEdit, handleView, formData }), // Sửa lỗi JSX không hợp lệ
  ];
};

export default function ColumnTable({ tableData, columnsConfig, refreshData }) {
  const [userList, setUserList] = React.useState([]);
  const [isUserListOpen, setUserListOpen] = React.useState(false);
  const [sorting, setSorting] = React.useState([]); // 🔹 Hook để hiển thị thông báo
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const toast = useToast();
  const [data, setData] = React.useState([]);
  const [originalData, setOriginalData] = React.useState([]);
  const [error, setError] = React.useState('');
  // Phân trang
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isVisible, setIsVisible] = React.useState(true); // Trạng thái hiển thị bảng
  const rowsPerPage = 5;
  const [idEdit, setIdEdit] = React.useState(0);
  const [mode, setMode] = React.useState('');
  const { isOpen, onOpen, onClose } = useDisclosure(); // Điều khiển modal
  const [newUser, setNewUser] = React.useState({
    name: '',
    password: '',
    role: '',
    fullName: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    apartmentId: '',
  });

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

    // Lấy token từ localStorage
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const rawData = await response.text();
      console.log('Raw response:', rawData);

      // Nếu phản hồi đúng như mong đợi
      if (rawData === expectedResponse) {
        toast({
          title: successTitle,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });

        refreshData();
        onClose(); // Đóng modal sau khi submit
        return;
      }

      // Cố gắng parse JSON, nếu không thành công thì gán vào object với key message
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
    if (mode === 'create') {
      await submitUserData(
        `${API_BASE_URL}/api/admin/apartment-list/add-apartment`,
        'POST',
        formData,
        'Apartment created successfully',
        'Creation Successful!',
      );
    } else if (mode === 'edit') {
      await submitUserData(
        `${API_BASE_URL}/api/admin/apartment-list/edit-apartment`,
        'POST',
        formData,
        'Apartment updated successfully',
        'Updating Successful!',
      );
    }
  };

  const handleView = async (id) => {
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
      setUserListOpen(true)

      return;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Failed!',
        description: 'An error occurred while viewing the user.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleEdit = async (id) => {
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
      console.log('rawData = ', rawData);
      setNewUser(rawData);
      setMode('edit');
      setIdEdit(id);
      onOpen();

      return;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Failed!',
        description: 'An error occurred while editting the user.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  React.useEffect(() => {
    if (Array.isArray(tableData)) {
      setOriginalData(tableData);
      setData(tableData);
    } else {
      console.warn('tableData không phải là mảng, bỏ qua cập nhật');
    }
  }, [tableData]); // Chạy lại khi tableData thay đổi
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
    setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
  }, [searchTerm, originalData]);

  const toggleStatusHandler = (id, accessor) =>
    toggleStatus(id, accessor, setOriginalData, setData);

  const columns = generateColumns(
    columnsConfig,
    textColor,
    setData,
    toggleStatusHandler,
    toast,
    handleEdit,
    handleView,
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Tính toán dữ liệu trang hiện tại
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
        {/* Tiêu đề + Nút "Add a new account" */}
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
        <Flex align="center">
          <Button
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
            }}
          >
            Add a new apartment
          </Button>
        </Flex>
        <Flex align="center">
        </Flex>
      </Flex>

      {/* Chỉ hiển thị khi isVisible = true */}
      {isVisible && (
        <>
          {/* Thanh tìm kiếm theo Global ID */}
          <Box px="25px" mb="12px">
            <Input
              placeholder="Search by apartment number..."
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
          {/* Phân trang */}
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

      {/* Modal thêm tài khoản */}
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
    </Card>
  );
}
