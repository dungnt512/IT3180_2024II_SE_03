import { useState } from 'react';
import { MdDelete, MdCheckCircle, MdEdit, MdVisibility } from 'react-icons/md';
import { Icon, IconButton, Spinner, Flex, Text } from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import { useToast } from '@chakra-ui/react';

const columnHelper = createColumnHelper();
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ActionsCell = ({ row, setData, toast, handleEdit, handleView, tableData }) => {
  const [status, setStatus] = useState('idle'); // "idle" | "loading" | "success"
  const isAdmin = row.name === 'admin';

  const handleDelete = async () => {
    if (isAdmin) {
      toast({
        title: 'Action blocked!',
        description: 'Cannot delete admin account.',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      setStatus('loading'); // Hiện icon loading
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Authentication failed: No token found!');
        return;
      }

      await fetch(`${API_BASE_URL}/api/admin/users/delete/${row.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setStatus('success'); // Chuyển icon thành check-circle

      setTimeout(() => {
        setData((prevData) => prevData.filter((user) => user.id !== row.id));
      }, 1000); // 1s sau mới xóa hàng

      toast({
        title: 'User deleted',
        description: `User with ID: ${row.id} has been deleted successfully.`,
        status: 'success',
        duration: 500,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      setStatus('idle'); // Trả lại icon Delete nếu lỗi
      toast({
        title: 'Deletion failed!',
        description: 'An error occurred while deleting the user.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex>
      <IconButton
        aria-label="View User"
        icon={<Icon as={MdVisibility} w="24px" h="24px" color="black.600" />}
        size="sm"
        variant="ghost"
        onClick={() => handleView(row.id)}
      />
      <IconButton
        aria-label="Edit User"
        icon={<Icon as={MdEdit} w="24px" h="24px" color="blue.500" />}
        size="sm"
        variant="ghost"
        onClick={() => handleEdit(row.id)}
        isDisabled={isAdmin}
      />
      <IconButton
        aria-label="Delete User"
        icon={
          status === 'loading' ? (
            <Spinner size="sm" color="red.500" />
          ) : status === 'success' ? (
            <Icon as={MdCheckCircle} w="24px" h="24px" color="green.500" />
          ) : (
            <Icon as={MdDelete} w="24px" h="24px" color="red.500" />
          )
        }
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        isDisabled={isAdmin || status === 'loading'}
      />
    </Flex>
  );
};

const columnsIcon = ({ setData, toast, handleEdit, handleView, tableData }) => {
  return [
    columnHelper.display({
      id: 'actions',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Options
        </Text>
      ),
      cell: (info) => (
        <ActionsCell
          row={info.row.original}
          setData={setData}
          toast={toast}
          handleEdit={handleEdit}
          handleView={handleView}
          tableData={tableData}
        />
      ),
    }),
  ];
};

export default columnsIcon;