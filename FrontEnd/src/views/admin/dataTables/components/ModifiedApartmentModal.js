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
  import AppartmentTable from "views/admin/dataTables/components/AppartmentTable";
  import {
    columnsAppartmentDataColumns,
  } from "views/admin/dataTables/variables/columnsData";
  import axios from "axios";
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const ModifiedAppartmentModal = ({ isOpen, onClose}) => {
    const [tableApartmentDataColumns, setApartmentTableDataColumns] = useState([]);
     const textColor = useColorModeValue('secondaryGray.900', 'white');
    const fetchApartmentData = useCallback(async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("Không tìm thấy token");
            return;
          }
    
          const response = await axios.get(`${API_BASE_URL}/api/admin/apartment-list`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          setApartmentTableDataColumns(response.data.data || response.data);
        } catch (error) {
          console.error("Lỗi khi gọi API:", error);
        }
      }, []);
          useEffect(() => {
            fetchApartmentData();
          }, [fetchApartmentData]);
  
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
                   <AppartmentTable
                     columnsConfig={columnsAppartmentDataColumns}
                     tableData={tableApartmentDataColumns}
                     refreshData={fetchApartmentData}
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
  
  export default ModifiedAppartmentModal;
  