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
  import BillTable from "views/admin/dataTables/components/BillTable";
  import {
    columnsBillDataColumns,
  } from "views/admin/dataTables/variables/columnsData";
  import axios from "axios";
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const ModifiedBillModal = ({ isOpen, onClose}) => {
    const [billTableDataColumns, setBillTableDataColumns] = useState([]);
     const textColor = useColorModeValue('secondaryGray.900', 'white');
     const fetchBillData = useCallback(async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("Không tìm thấy token");
            return;
          }
    
          const response = await axios.get(`${API_BASE_URL}/api/admin/bills`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          setBillTableDataColumns(response.data.data || response.data);
        } catch (error) {
          console.error("Lỗi khi gọi API:", error);
        }
      }, []);
    
      useEffect(() => {
        fetchBillData();
      }, [fetchBillData]);
  
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
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
                   <BillTable
                     columnsConfig={columnsBillDataColumns}
                     tableData={billTableDataColumns}
                     refreshData={fetchBillData}
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
  
