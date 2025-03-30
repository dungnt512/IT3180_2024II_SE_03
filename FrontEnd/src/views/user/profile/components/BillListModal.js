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
  
  const BillListModal = ({ isOpen, onClose, users }) => {
    const textColor = useColorModeValue("secondaryGray.900", "white");
    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  
    const sortedUsers = [...users].sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      let valueA = a[sortConfig.key];
      let valueB = b[sortConfig.key];
      
      if (sortConfig.key === "dueDate") {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }
      
      if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  
    const requestSort = (key) => {
      let direction = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      }
      setSortConfig({ key, direction });
    };
  
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Your Bill List</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400" cursor="pointer" onClick={() => requestSort("billType")}>
                    Bill Type
                  </Th>
                  <Th justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400" cursor="pointer" onClick={() => requestSort("amount")}>
                    Amount
                  </Th>
                  <Th justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400" cursor="pointer" onClick={() => requestSort("dueDate")}>
                    Due Date
                  </Th>
                  <Th justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400" cursor="pointer" onClick={() => requestSort("description")}>
                    Description
                  </Th>
                  <Th justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400" cursor="pointer" onClick={() => requestSort("status")}>
                    Status
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {displayedUsers.map((user) => (
                  <Tr key={user.id}>
                    <Td color={textColor} fontSize="sm" fontWeight="700">{user.billType}</Td>
                    <Td color={textColor} fontSize="sm" fontWeight="700">{user.amount}</Td>
                    <Td color={textColor} fontSize="sm" fontWeight="700">{user.dueDate}</Td>
                    <Td color={textColor} fontSize="sm" fontWeight="700">{user.description}</Td>
                    <Td color={textColor} fontSize="sm" fontWeight="700">{user.status || "N/A"}</Td>
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
                    variant={currentPage === index + 1 ? "solid" : "outline"}
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
  
  export default BillListModal;
  