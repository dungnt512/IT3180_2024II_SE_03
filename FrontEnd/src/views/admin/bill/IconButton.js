import { useState } from 'react';
import { MdDelete, MdCheckCircle, MdEdit, MdVisibility } from 'react-icons/md';
import { Icon, IconButton, Spinner, Flex, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper();
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ActionsCell = ({ row, setData, toast, handleEdit, handleView }) => {
  const [status, setStatus] = useState('idle'); // "idle" | "loading" | "success"
  const [verifyStatus, setVerifyStatus] = useState('idle'); // For verify button
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDelete = async () => {
    try {
      setStatus('loading');
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Authentication failed: No token found!');
        return;
      }

      await fetch(`${API_BASE_URL}/api/admin/bills/${row.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setStatus('success');
      setTimeout(() => {
        setData((prevData) => prevData.filter((user) => user.id !== row.id));
      }, 1000);

      toast({
        title: 'Bill deleted',
        description: `Bill with ID: ${row.id} has been deleted successfully.`,
        status: 'success',
        duration: 500,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      setStatus('idle');
      toast({
        title: 'Deletion failed!',
        description: 'An error occurred while deleting the user.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleVerify = async () => {
    try {
      setVerifyStatus('loading');
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Authentication failed: No token found!');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/bills/${row.id}/confirm-payment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to confirm payment');
      }

      setVerifyStatus('success');
      setData((prevData) =>
        prevData.map((item) =>
          item.id === row.id ? { ...item, status: 'PAID' } : item
        )
      );

      toast({
        title: 'Payment confirmed',
        description: `Payment for bill ID: ${row.id} has been confirmed successfully.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      setVerifyStatus('idle');
      toast({
        title: 'Confirmation failed!',
        description: 'An error occurred while confirming the payment.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      onClose();
    }
  };

  return (
    <>
      <Flex gap={2} alignItems="center">
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
          isDisabled={status === 'loading'}
        />
        {row.status === 'UNPAID' ? (
          <Button
            fontSize="sm"
            fontWeight="500"
            borderRadius="10px"
            px="15px"
            py="5px"

            colorScheme="green"
            onClick={onOpen}
            isLoading={verifyStatus === 'loading'}
          >
            Verify
          </Button>
        ) : (
          <Button             fontSize="sm"
          fontWeight="500"
          borderRadius="10px"
          px="15px"
          py="5px" colorScheme="green" 
 isDisabled>
            Verified
          </Button>
        )}
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Do you want to confirm payment for this bill?</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleVerify} isLoading={verifyStatus === 'loading'}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const columnsBillIcon = ({ setData, toast, handleEdit, handleView }) => {
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
        />
      ),
    }),
  ];
};

export default columnsBillIcon;