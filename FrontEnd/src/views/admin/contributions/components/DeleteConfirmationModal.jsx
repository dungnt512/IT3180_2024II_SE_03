import React from 'react';
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
} from '@chakra-ui/react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title || 'Confirm Delete'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{message || 'Are you sure you want to delete this item?'}</Text>
        </ModalBody>

        <ModalFooter>
          <Button 
            variant="darkBrand" 
            color="white" 
            mr={3} 
            onClick={onConfirm}
          >
            Delete
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteConfirmationModal; 