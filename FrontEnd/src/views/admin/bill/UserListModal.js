import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Flex,
    Box,
    Text,
    useColorModeValue,
  } from "@chakra-ui/react";
  import { useState } from "react";
  
  const UserListModal = ({ isOpen, onClose, users }) => {
    const textColor = useColorModeValue("secondaryGray.900", "white");
    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);
  
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedUsers = users.slice(startIndex, startIndex + itemsPerPage);
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Resident List</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                    <Th justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">ID</Th>
                    <Th justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Full Name</Th>
                    <Th justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Email</Th>
                    <Th justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Phone</Th>
                    <Th justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Age</Th>
                    <Th justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Gender</Th>
                    <Th justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Apartment</Th>
                
                </Tr>
              </Thead>
              <Tbody>
                {displayedUsers.map((user) => (
                  <Tr key={user.id}>
                    <Td color={textColor} fontSize="sm" fontWeight="700">{user.id}</Td>
                    <Td color={textColor} fontSize="sm" fontWeight="700">{user.fullName}</Td>
                    <Td color={textColor} fontSize="sm" fontWeight="700">{user.email}</Td>
                    <Td color={textColor} fontSize="sm" fontWeight="700">{user.phone}</Td>
                    <Td color={textColor} fontSize="sm" fontWeight="700">{user.age || "N/A"}</Td>
                    <Td color={textColor} fontSize="sm" fontWeight="700">{user.gender || "N/A"}</Td>
                    <Td color={textColor} fontSize="sm" fontWeight="700">{user.apartmentNumbers.join(", ")}</Td>

                  </Tr>
                ))}
              </Tbody>
            </Table>
          </ModalBody>
          <ModalFooter>
  <Flex justify="space-between" w="100%">
    <Box>
      <Text color={textColor} fontSize="sm" fontWeight="700">
        Page {currentPage} of {totalPages}
      </Text>
    </Box>
    <Flex gap={2}>
      <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} isDisabled={currentPage === 1}>
        Previous
      </Button>
      {[...Array(totalPages)].map((_, index) => (
        <Button
        
          key={index + 1}
          onClick={() => setCurrentPage(index + 1)}
          variant={currentPage === index + 1 ? 'darkband' : 'outline'}
          color = 'dark'
        >
          {index + 1}
        </Button>
      ))}
      <Button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} isDisabled={currentPage === totalPages}>
        Next
      </Button>
    </Flex>
  </Flex>
</ModalFooter>

        </ModalContent>
      </Modal>
    );
  };
  
  export default UserListModal;