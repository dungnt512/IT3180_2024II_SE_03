import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    useColorModeValue,
    Text,
  } from '@chakra-ui/react';
  import { useState, useEffect, useCallback } from 'react';
  import ColumnsTable from "views/admin/dataTables/components/ColumnsTable";
  import {
    columnsDataColumns,
  } from "views/admin/dataTables/variables/columnsData";
  import axios from "axios";
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const ModifiedBillModal = ({ isOpen, onClose}) => {
     const [tableDataColumns, setTableDataColumns] = useState([]);
     const textColor = useColorModeValue('secondaryGray.900', 'white');
     
    // Hàm fetch data
    const fetchData = useCallback(async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("Không tìm thấy token");
            return;
          }
    
          const response = await axios.get(`${API_BASE_URL}/admin/home`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          setTableDataColumns(response.data.data || response.data);
        } catch (error) {
          console.error("Lỗi khi gọi API:", error);
        }
      }, []);
    
      useEffect(() => {
        fetchData();
      }, [fetchData]);
  
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
                      <Text
                        color={textColor}
                        fontSize="22px"
                        fontWeight="700"
                        lineHeight="100%"
                        mr="12px"
                      >
                        Administrative Control Panel
                      </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
                    <ColumnsTable
                    columnsConfig={columnsDataColumns}
                    tableData={tableDataColumns}
                    refreshData={fetchData}
                    />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="whiteBrand"
              color="dark"
              fontSize="sm"
              fontWeight="500"
              borderRadius="10px"
              px="15px"
              py="5px"
              onClick={onClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default ModifiedBillModal;
  