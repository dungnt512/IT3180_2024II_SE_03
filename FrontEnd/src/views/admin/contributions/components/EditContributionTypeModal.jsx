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
  useToast,
} from '@chakra-ui/react';

import { updateContributionType } from '../services/contributionService';

const EditContributionTypeModal = ({ isOpen, onClose, contributionType, onRefresh }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && contributionType) {
      setName(contributionType.name || '');
      setDescription(contributionType.description || '');
    }
  }, [isOpen, contributionType]);

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
      await updateContributionType(contributionType.id, {
        name,
        description,
      });

      toast({
        title: 'Success',
        description: 'Contribution type updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to update contribution type, please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Contribution Type</ModalHeader>
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
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditContributionTypeModal; 
