import React, { useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  useDisclosure,
  useToast,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdMoreVert } from 'react-icons/md';

import { deleteContributionType } from '../services/contributionService';
import EditContributionTypeModal from './EditContributionTypeModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const ContributionTypeTable = ({ contributionTypes = [], onRefresh, isLoading = false }) => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const bgTable = useColorModeValue('white', 'navy.700');
  const bgTableHeader = useColorModeValue('gray.50', 'whiteAlpha.100');
  const toast = useToast();
  
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const [selectedType, setSelectedType] = useState(null);

  const handleEditClick = (type) => {
    setSelectedType(type);
    onEditOpen();
  };

  const handleDeleteClick = (type) => {
    setSelectedType(type);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!selectedType) return;
    
    try {
      await deleteContributionType(selectedType.id);
      toast({
        title: 'Success',
        description: 'Contribution type deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Cannot delete contribution type, please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Flex justify="center" align="center" width="100%" py={10}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      );
    }

    return (
      <Box 
        bg={bgTable}
        boxShadow="0px 2px 5.5px rgba(0, 0, 0, 0.02)"
        borderRadius="16px"
        overflow="hidden"
      >
        <Box overflowX="auto">
          <Table variant="simple" color="gray.500" mb="0">
            <Thead bg={bgTableHeader}>
              <Tr>
                <Th borderColor={borderColor} color="gray.400">
                  NAME
                </Th>
                <Th borderColor={borderColor} color="gray.400">
                  DESCRIPTION
                </Th>
                <Th borderColor={borderColor} color="gray.400">
                  STATUS
                </Th>
                <Th borderColor={borderColor} color="gray.400">
                  ACTIONS
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {contributionTypes.length > 0 ? (
                contributionTypes.map((type, index) => (
                  <Tr key={index}>
                    <Td borderColor={borderColor}>
                      <Text color={textColor} fontWeight="bold">
                        {type.name}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text color={textColor}>
                        {type.description || 'No description.'}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme={type.isActive ? 'green' : 'gray'}
                        borderRadius="full"
                      >
                        {type.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Flex gap={2}>
                        <IconButton
                          icon={<MdEdit />}
                          colorScheme="brand"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(type)}
                          aria-label="Edit"
                        />
                        <IconButton
                          icon={<MdDelete />}
                          colorScheme="red"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(type)}
                          aria-label="Delete"
                        />
                      </Flex>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={4} textAlign="center">
                    <Text fontSize="md" py={4}>
                      No contribution type data available
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>
    );
  };

  return (
    <>
      {renderContent()}

      {selectedType && (
        <>
          <EditContributionTypeModal
            isOpen={isEditOpen}
            onClose={onEditClose}
            contributionType={selectedType}
            onRefresh={onRefresh}
          />

          <DeleteConfirmationModal
            isOpen={isDeleteOpen}
            onClose={onDeleteClose}
            onConfirm={handleDelete}
            title="Delete Contribution Type"
            message="Are you sure you want to delete this contribution type? This action cannot be undone."
          />
        </>
      )}
    </>
  );
};

export default ContributionTypeTable; 