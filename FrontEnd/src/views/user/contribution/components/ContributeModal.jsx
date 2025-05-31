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
  InputGroup,
  InputRightAddon,
  Text,
  Flex,
  Divider,
  useToast,
  FormErrorMessage,
  Box,
  Alert,
  AlertIcon,
  Select,
} from '@chakra-ui/react';

import {
  getContributeFormData,
  contributeToContribution,
} from 'views/admin/contributions/services/contributionService';

const ContributeModal = ({ isOpen, onClose, contribution, onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contributionFormData, setContributionFormData] = useState(null);
  const [error, setError] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [formValues, setFormValues] = useState({
    amount: '',
    apartmentNumber: '',
  });
  const toast = useToast();

  useEffect(() => {
    if (isOpen && contribution) {
      fetchContributeFormData();
    }
  }, [isOpen, contribution]);

  const fetchContributeFormData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getContributeFormData(contribution.id);
      setContributionFormData(data);

      // If there's just one apartment, select it by default
      if (data.apartments && data.apartments.length === 1) {
        setFormValues({
          ...formValues,
          apartmentNumber: data.apartments[0].apartmentNumber
        });
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
      if (error.response && error.response.data) {
        // Handle specific errors from backend
        if (error.response.data === "Không tìm thấy thông tin căn hộ" || error.response.data === "No apartment information found") {
          setError("No apartment found. You need to be associated with at least one apartment to contribute.");
        } else {
          setError(error.response.data || "Failed to load form data, please try again later.");
        }
      } else {
        setError("Failed to load form data, please try again later.");
      }

      toast({
        title: 'Error',
        description: error.response?.data === "Không tìm thấy thông tin căn hộ" || error.response?.data === "No apartment information found"
          ? "No apartment found. You need to be associated with at least one apartment to contribute."
          : error.response?.data || 'Failed to load form data, please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    // Validate
    if (!formValues.amount || formValues.amount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid contribution amount',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formValues.apartmentNumber && contributionFormData?.apartments?.length > 0) {
      toast({
        title: 'Error',
        description: 'Please select an apartment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        contributionId: contribution.id,
        amount: Number(formValues.amount),
        apartmentNumber: formValues.apartmentNumber,
      };

      const response = await contributeToContribution(payload);
      setInvoice({
        id: response,
        contributionName: contribution.title || contribution.name,
        amount: Number(formValues.amount),
        createdDate: new Date(),
        transferContent: `CONTRIBUTION_${response}`
      });

      toast({
        title: 'Success',
        description: 'Your contribution was successful!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data || 'Failed to process contribution, please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormValues({
      amount: '',
      apartmentNumber: '',
    });
    setError(null);
    onClose();
    if (invoice) {
      onRefresh();
    }
  };

  const formatMoney = (amount) => {
    return amount.toLocaleString('en-US') + ' USD';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unlimited';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {invoice ? 'Contribution Receipt' : `Contribute: ${contribution?.title || contribution?.name}`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          {invoice ? (
            <Box>
              <Alert status="success" mb={4}>
                <AlertIcon />
                Contribution successful! Please make payment using the information below.
              </Alert>

              <Flex direction="column" gap={3}>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Invoice ID:</Text>
                  <Text>{invoice.id}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Contribution:</Text>
                  <Text>{invoice.contributionName}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Amount:</Text>
                  <Text>{formatMoney(invoice.amount)}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Created:</Text>
                  <Text>{formatDate(invoice.createdDate)}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Status:</Text>
                  <Text color="orange.500">Pending Payment</Text>
                </Flex>

                <Divider my={2} />

                <Text fontWeight="bold" mb={2}>Payment Information:</Text>
                <Box bg="gray.50" p={3} borderRadius="md">
                  <Text>Bank: {invoice.bankInfo?.bankName || 'Vietcombank'}</Text>
                  <Text>Account Number: {invoice.bankInfo?.accountNumber || '1234567890'}</Text>
                  <Text>Account Name: {invoice.bankInfo?.accountName || 'BLUEMOON APARTMENT'}</Text>
                  <Text fontWeight="semibold">Payment Reference: {invoice.transferContent}</Text>
                </Box>
              </Flex>
            </Box>
          ) : (
            !error && (
              <Box>
                <Flex direction="column" gap={3} mb={4}>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Contribution Name:</Text>
                    <Text>{contribution?.title || contribution?.name}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Type:</Text>
                    <Text>{contribution?.contributionTypeName || contribution?.type?.name || 'General Contribution'}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Collected:</Text>
                    <Text>{formatMoney(contribution?.totalAmount || contribution?.collected || 0)}</Text>
                  </Flex>
                  {(contribution?.targetAmount || contribution?.target) && (
                    <Flex justify="space-between">
                      <Text fontWeight="bold">Target:</Text>
                      <Text>{formatMoney(contribution?.targetAmount || contribution?.target)}</Text>
                    </Flex>
                  )}
                  {(contribution?.targetAmount || contribution?.target) && (
                    <Flex justify="space-between">
                      <Text fontWeight="bold">Remaining:</Text>
                      <Text>{formatMoney(Math.max(0, (contribution?.targetAmount || contribution?.target) - (contribution?.totalAmount || contribution?.collected || 0)))}</Text>
                    </Flex>
                  )}
                </Flex>

                <Divider my={4} />

                {contributionFormData?.apartments && contributionFormData.apartments.length > 0 && (
                  <FormControl isRequired mb={4}>
                    <FormLabel>Select Apartment</FormLabel>
                    <Select
                      name="apartmentNumber"
                      value={formValues.apartmentNumber}
                      onChange={handleInputChange}
                      placeholder="Select apartment"
                    >
                      {contributionFormData.apartments.map((apt) => (
                        <option key={apt.id} value={apt.apartmentNumber}>
                          {apt.apartmentNumber}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <FormControl isRequired>
                  <FormLabel>Contribution Amount</FormLabel>
                  <InputGroup>
                    <Input
                      name="amount"
                      type="number"
                      placeholder="Enter contribution amount"
                      value={formValues.amount}
                      onChange={handleInputChange}
                    />
                    <InputRightAddon children="USD" />
                  </InputGroup>
                </FormControl>
              </Box>
            )
          )}
        </ModalBody>

        <ModalFooter>
          {invoice ? (
            <Button variant="brand" onClick={handleClose}>
              Close
            </Button>
          ) : (
            !error && (
              <>
                <Button
                  variant="brand"
                  mr={3}
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText="Processing"
                  isDisabled={isLoading}
                >
                  Contribute
                </Button>
                <Button onClick={handleClose}>Cancel</Button>
              </>
            )
          )}
          {error && (
            <Button variant="ghost" onClick={handleClose}>
              Close
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ContributeModal; 
