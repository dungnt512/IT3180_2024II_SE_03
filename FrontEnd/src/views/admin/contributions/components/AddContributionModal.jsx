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
  Select,
  InputGroup,
  InputRightAddon,
  useToast,
} from '@chakra-ui/react';

import { createAdminContribution } from '../services/contributionService';

const AddContributionModal = ({ isOpen, onClose, contributionTypes = [], onRefresh }) => {
  const [formData, setFormData] = useState({
    title: '',
    contributionTypeId: '',
    description: '',
    targetAmount: '',
    startDate: '',
    endDate: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast({
        title: 'Error',
        description: 'Please enter a contribution title',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.contributionTypeId) {
      toast({
        title: 'Error',
        description: 'Please select a contribution type',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.startDate) {
      toast({
        title: 'Error',
        description: 'Start date is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.endDate) {
      toast({
        title: 'Error',
        description: 'End date is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const today = new Date();
    const endDate = new Date(formData.endDate);
    if (endDate <= today) {
      toast({
        title: 'Error',
        description: 'End date must be in the future',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        targetAmount: formData.targetAmount ? Number(formData.targetAmount) : null,
        contributionTypeId: Number(formData.contributionTypeId),
      };

      console.log('Submitting payload:', payload);
      await createAdminContribution(payload);
      toast({
        title: 'Success',
        description: 'New contribution created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setFormData({
        title: '',
        contributionTypeId: '',
        description: '',
        targetAmount: '',
        startDate: '',
        endDate: '',
      });

      onClose();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to create contribution, please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      contributionTypeId: '',
      description: '',
      targetAmount: '',
      startDate: '',
      endDate: '',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="5xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Contribution</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired mb={4}>
            <FormLabel fontSize="sm" fontWeight="500">Contribution Title</FormLabel>
            <Input
              name="title"
              placeholder="Enter contribution title"
              value={formData.title}
              onChange={handleChange}
              size="lg"
              fontSize="sm"
              borderRadius="15px"
            />
          </FormControl>

          <FormControl isRequired mb={4}>
            <FormLabel fontSize="sm" fontWeight="500">Contribution Type</FormLabel>
            <Select
              name="contributionTypeId"
              placeholder="Select contribution type"
              value={formData.contributionTypeId}
              onChange={handleChange}
              size="lg"
              fontSize="sm"
              borderRadius="15px"
            >
              {contributionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel fontSize="sm" fontWeight="500">Description</FormLabel>
            <Textarea
              name="description"
              placeholder="Enter contribution description"
              value={formData.description}
              onChange={handleChange}
              size="lg"
              fontSize="sm"
              borderRadius="15px"
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel fontSize="sm" fontWeight="500">Target Amount (leave empty if unlimited)</FormLabel>
            <InputGroup size="lg">
              <Input
                name="targetAmount"
                type="number"
                placeholder="Enter target amount"
                value={formData.targetAmount}
                onChange={handleChange}
                fontSize="sm"
                borderRadius="15px"
              />
              <InputRightAddon children="VND" />
            </InputGroup>
          </FormControl>

          <FormControl isRequired mb={4}>
            <FormLabel fontSize="sm" fontWeight="500">Start Date</FormLabel>
            <Input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              size="lg"
              fontSize="sm"
              borderRadius="15px"
            />
          </FormControl>

          <FormControl isRequired mb={4}>
            <FormLabel fontSize="sm" fontWeight="500">End Date</FormLabel>
            <Input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              size="lg"
              fontSize="sm"
              borderRadius="15px"
              min={new Date().toISOString().split('T')[0]}
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
            Create
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddContributionModal; 
