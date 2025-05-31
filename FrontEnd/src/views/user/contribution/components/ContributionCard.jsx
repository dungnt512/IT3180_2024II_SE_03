import React from 'react';
import {
  Box,
  Flex,
  Text,
  Progress,
  Button,
  Badge,
  useDisclosure,
  useColorModeValue,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { MdPayment } from 'react-icons/md';

import ContributeModal from './ContributeModal';

// Card displaying information about a contribution
const ContributionCard = ({ contribution, onRefresh }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.300');
  const brandColor = useColorModeValue('brand.500', 'brand.400');

  // Defensive programming to handle undefined or null contribution
  if (!contribution) {
    return null;
  }

  // Calculate completion percentage if there is a target
  const progressPercentage = contribution.target 
    ? ((contribution.collected || 0) / contribution.target) * 100
    : 100;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No limit';
    return new Date(dateString).toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format money
  const formatMoney = (amount) => {
    return (amount || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  return (
    <>
      <Card borderRadius="20px" variant="elevated" h="100%">
        <CardBody>
          <Flex direction="column" height="100%">
            {/* Title and basic information */}
            <Flex mb="10px" justify="space-between" align="center">
              <Text fontWeight="bold" fontSize="xl" color={textColor}>
                {contribution.name}
              </Text>
              <Badge colorScheme="green" borderRadius="full" px="2">
                Active
              </Badge>
            </Flex>

            {/* Information about contribution type */}
            <Text fontSize="md" color={secondaryTextColor} mb="10px">
              {contribution.type?.name || 'General Contribution'}
            </Text>

            {/* Description */}
            <Text fontSize="sm" color={textColor} mb="15px" height="60px" overflow="hidden">
              {contribution.description || 'No description.'}
            </Text>

            {/* Progress bar */}
            <Box mb="15px">
              {contribution.targetAmount > 0 && (
                <>
                  <Progress 
                    value={Math.min(Math.round(((contribution.totalPaidAmount || contribution.currentAmount || contribution.collectedAmount || 0) / contribution.targetAmount) * 100), 100)} 
                    colorScheme="green" 
                    size="sm" 
                    borderRadius="md" 
                    mb={2}
                    w="100%"
                    bgColor="gray.200"
                  />
                  <Flex justifyContent="space-between" fontSize="sm">
                    <Text fontWeight="medium">{formatMoney(contribution.totalPaidAmount || contribution.currentAmount || contribution.collectedAmount || 0)}</Text>
                    <Text color="gray.500">
                      Target: {formatMoney(contribution.targetAmount || 0)}
                      {contribution.targetAmount > 0 && ` (${Math.min(Math.round(((contribution.totalPaidAmount || contribution.currentAmount || contribution.collectedAmount || 0) / contribution.targetAmount) * 100), 100)}%)`}
                    </Text>
                  </Flex>
                </>
              )}
            </Box>

            {/* Time */}
            <Flex justify="space-between" fontSize="sm" color={secondaryTextColor} mb="20px">
              <Text>Start: {formatDate(contribution.startDate)}</Text>
              <Text>End: {formatDate(contribution.endDate)}</Text>
            </Flex>

            {/* Action button */}
            <Button 
              variant="brand" 
              width="100%" 
              mt="auto"
              leftIcon={<MdPayment />}
              onClick={onOpen}
            >
              Contribute Now
            </Button>
          </Flex>
        </CardBody>
      </Card>

      {/* Contribution modal */}
      <ContributeModal 
        isOpen={isOpen} 
        onClose={onClose} 
        contribution={contribution}
        onRefresh={onRefresh}
      />
    </>
  );
};

export default ContributionCard; 
