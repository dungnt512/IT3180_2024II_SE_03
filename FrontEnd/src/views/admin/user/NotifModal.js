import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Box,
  Checkbox,
  Flex,
  Text,
  useToast,
  Spinner,
  Image,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const NotificationModal = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const storedIds = JSON.parse(localStorage.getItem('ids') || '[]');
    setSelectedIds(storedIds);
    fetchUsers(storedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async (storedIds = []) => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
  
      const res = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      let filteredUsers = res.data.filter(user => user.name.toLowerCase() !== 'admin');
      
      // Assign random gender for avatar
      filteredUsers = filteredUsers.map(user => ({
        ...user,
        gender: Math.random() > 0.5 ? 'male' : 'female',
      }));
  
      setUsers(filteredUsers);
  
      // Check if all available users are selected based on storedIds
      const validStoredIds = storedIds.filter(id => filteredUsers.some(user => user.id === id));
      setSelectedIds(validStoredIds);
      if (validStoredIds.length === filteredUsers.length && filteredUsers.length > 0) {
        setIsSelectAll(true);
      } else {
        setIsSelectAll(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message === 'No token found'
          ? 'Authentication token is missing. Please login again.'
          : 'Failed to fetch users.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsFetching(false);
    }
  };
  
  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedIds([]);
    } else {
      const filteredUserIds = filteredUsers.map(user => user.id);
      setSelectedIds(filteredUserIds);
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleUserSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
    setIsSelectAll(filteredUsers.length === (selectedIds.includes(id) ? selectedIds.length - 1 : selectedIds.length + 1));
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Message is required.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (selectedIds.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one user.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        residentIds: selectedIds,
        message: message
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/send-noti`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        // Clear localStorage IDs
        localStorage.setItem('ids', JSON.stringify([]));

        setIsSent(true);
        toast({
          title: 'Success',
          description: 'Notification sent successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        setTimeout(() => {
          setMessage('');
          setSelectedIds([]);
          setIsSelectAll(false);
          setIsSent(false);
          onClose();
        }, 1000);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send notification.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Send Notification</ModalHeader>
        <ModalCloseButton isDisabled={isFetching || isSending} />
        <ModalBody>
          <FormControl>
            <FormLabel
              display="flex"
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              mb="8px"
            >
              Message<Text color="red.500">*</Text>
            </FormLabel>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="auth"
              fontSize="sm"
              mb="24px"
              fontWeight="500"
              size="lg"
              placeholder="Enter notification message"
              isDisabled={isFetching || isSending}
            />
            <FormLabel
              display="flex"
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              mb="8px"
            >
              Recipients<Text color="red.500">*</Text>
            </FormLabel>
            <Text fontSize="sm" mb="8px">
              You will send notifications to {selectedIds.length} user(s)
            </Text>
            <Input
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="auth"
              fontSize="sm"
              mb="16px"
              size="lg"
              isDisabled={isFetching || isSending}
            />
            <Button
              onClick={handleSelectAll}
              mb="16px"
              variant="outline"
              size="sm"
              isDisabled={isFetching || isSending}
            >
              {isSelectAll ? 'Deselect All' : 'Select All'}
            </Button>
            {isFetching ? (
              <Flex justify="center" align="center" h="200px">
                <Spinner size="lg" />
              </Flex>
            ) : (
              <Box maxH="200px" overflowY="auto">
                {filteredUsers.map(user => (
                  <Flex
                    key={user.id}
                    align="center"
                    mb="8px"
                    p="8px"
                    borderRadius="md"
                    _hover={{ bg: 'gray.100' }}
                  >
                    <Checkbox
                      isChecked={selectedIds.includes(user.id)}
                      onChange={() => handleUserSelect(user.id)}
                      mr="12px"
                      isDisabled={isFetching || isSending}
                    />
                    <Image
                      src={
                        user.gender === 'male'
                          ? 'https://randomuser.me/api/portraits/men/' + (user.id % 100) + '.jpg'
                          : 'https://randomuser.me/api/portraits/women/' + (user.id % 100) + '.jpg'
                      }
                      boxSize="40px"
                      borderRadius="full"
                      mr="12px"
                    />
                    <Box>
                      <Text fontSize="sm"><strong>Name:</strong> {user.name}</Text>
                      <Text fontSize="sm"><strong>Phone:</strong> {user.phone}</Text>
                      <Text fontSize="sm"><strong>Email:</strong> {user.email || 'N/A'}</Text>
                      <Text fontSize="sm"><strong>Role:</strong> {user.role}</Text>
                    </Box>
                  </Flex>
                ))}
              </Box>
            )}
          </FormControl>
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
            onClick={handleSend}
            isDisabled={isFetching || isSending || isSent}
            leftIcon={
              isSending ? <Spinner size="sm" /> : isSent ? <CheckIcon /> : null
            }
          >
            {isSent ? 'Sent' : 'Send'}
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            fontSize="sm"
            fontWeight="500"
            size="lg"
            isDisabled={isFetching || isSending}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NotificationModal;