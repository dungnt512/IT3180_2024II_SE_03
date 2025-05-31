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
  Text,
  Flex,
  Divider,
  Box,
  Badge,
  useToast,
  Spinner,
  Progress,
} from '@chakra-ui/react';

import { getUserContributionById } from 'views/admin/contributions/services/contributionService';

const ContributionDetailsModal = ({ isOpen, onClose, contribution }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && contribution) {
      fetchContributionDetails();
    }
  }, [isOpen, contribution]);

  const fetchContributionDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getUserContributionById(contribution.id);
      setDetails(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not load contribution details, please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'VND' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unlimited';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate progress percentage if there's a target
  const getProgressPercentage = () => {
    if (!details) return 0;

    const target = details.targetAmount || details.target;
    const collected = details.totalAmount || details.collected || 0;

    return target ? Math.min((collected / target) * 100, 100) : 100;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Contribution Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Flex justify="center" align="center" height="200px">
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : details ? (
            <Box>
              <Flex justify="space-between" align="center" mb={3}>
                <Text fontSize="xl" fontWeight="bold">{details.title || details.name}</Text>
                <Badge 
                  colorScheme={details.status === 'ACTIVE' || details.status === 'open' ? 'green' : 'gray'} 
                  borderRadius="full" 
                  px={2}
                >
                  {details.status === 'ACTIVE' || details.status === 'open' ? 'Open' : 'Closed'}
                </Badge>
              </Flex>

              <Text color="gray.600" mb={4}>{details.description}</Text>

              <Divider my={4} />

              <Flex direction="column" gap={3} mb={4}>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Contribution Type:</Text>
                  <Text>{details.contributionTypeName || details.type?.name || 'General Contribution'}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Your Contribution:</Text>
                  <Text fontWeight="bold" color="brand.500">
                    {formatMoney(details.userContribution || 0)}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Total Collected:</Text>
                  <Text>{formatMoney(details.totalAmount || details.collected || 0)}</Text>
                </Flex>
                {(details.targetAmount || details.target) && (
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Target:</Text>
                    <Text>{formatMoney(details.targetAmount || details.target)}</Text>
                  </Flex>
                )}
                <Flex justify="space-between">
                  <Text fontWeight="bold">Start Date:</Text>
                  <Text>{formatDate(details.startDate)}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontWeight="bold">End Date:</Text>
                  <Text>{formatDate(details.endDate)}</Text>
                </Flex>
              </Flex>

              {/* Progress */}
              <Box mb={4}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm">Progress</Text>
                  <Text fontSize="sm">
                    {(details.targetAmount || details.target) 
                      ? `${Math.round(getProgressPercentage())}%` 
                      : 'Unlimited'}
                  </Text>
                </Flex>
                <Progress 
                  value={getProgressPercentage()} 
                  size="sm" 
                  colorScheme="brand" 
                  borderRadius="full" 
                />
              </Box>

              {/* Transaction history */}
              {details.transactions && details.transactions.length > 0 && (
                <>
                  <Text fontWeight="bold" mt={6} mb={3}>Your Transaction History</Text>
                  <Box borderWidth="1px" borderRadius="lg" p={3}>
                    {details.transactions.map((transaction, index) => (
                      <Box key={index} mb={index !== details.transactions.length - 1 ? 3 : 0}>
                        <Flex justify="space-between">
                          <Text fontWeight="semibold">
                            {formatDate(transaction.date || transaction.createdAt)}
                          </Text>
                          <Text fontWeight="bold" color="brand.500">
                            {formatMoney(transaction.amount)}
                          </Text>
                        </Flex>
                        <Text fontSize="sm" color="gray.500">
                          {transaction.status === 'COMPLETED' 
                            ? 'Completed' 
                            : 'Pending'}
                        </Text>
                        {index !== details.transactions.length - 1 && <Divider my={2} />}
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          ) : (
            <Text>No contribution details found.</Text>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="brand" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ContributionDetailsModal; 
