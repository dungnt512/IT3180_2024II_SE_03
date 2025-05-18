import React, { useState } from 'react';
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
  useToast,
} from '@chakra-ui/react';

import { createContributionType } from '../services/contributionService';

const AddContributionTypeModal = ({ isOpen, onClose, onRefresh }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!name) {
      toast({
        title: 'Error',
        description: 'Please enter a contribution type name',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await createContributionType({
        name,
        description,
      });

      toast({
        title: 'Success',
        description: 'New contribution type added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setName('');
      setDescription('');
      onClose();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to add contribution type, please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Contribution Type</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired>
            <FormLabel fontSize="sm" fontWeight="500">Contribution Type Name</FormLabel>
            <Input
              placeholder="Enter contribution type name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="lg"
              fontSize="sm"
              borderRadius="15px"
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel fontSize="sm" fontWeight="500">Description</FormLabel>
            <Textarea
              placeholder="Enter contribution type description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              size="lg"
              fontSize="sm"
              borderRadius="15px"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="darkBrand"
            color="white"
            mr={3}
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Save
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddContributionTypeModal; 
