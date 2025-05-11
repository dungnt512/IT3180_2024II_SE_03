import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Flex,
  Box,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { WarningIcon } from '@chakra-ui/icons'; 

const ChangePassModal = ({ isOpen, onClose, mode, userData, onSubmit, error }) => {
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const [formData, setFormData] = useState({
    ...(mode === 'create' ? { oldPassword: '' } : {}), 
    ...(mode === 'create' ? { newPassword: '' } : {}), 
  });
  useEffect(() => {
    if (mode === 'edit' || mode === 'view') {
      setFormData(userData);
    } else {
      setFormData({
        ...(mode === 'create' ? { oldPassword: '' } : {}), 
        ...(mode === 'create' ? { newPassword: '' } : {}), 
      });
    }
  }, [mode, userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {mode === 'create'
            ? 'Change your password'
            : mode === 'edit'
              ? 'Edit User'
              : 'User Details'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="row" w="100%" gap="20px">
            <Box flex="1">
              <FormControl>
                {mode === 'create' && (
                  <>
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                      mb="8px"
                    >
                      Old Password<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Input
                      type="password"
                      name="oldPassword"
                      isRequired={true}
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: '0px', md: '0px' }}
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                      value={formData.oldPassword}
                      onChange={handleChange}
                      isReadOnly={mode === 'view'}
                    />
                  </>
                )}

                {mode === 'create' && (
                  <>
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                      mb="8px"
                    >
                      New Password<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Input
                      type="password"
                      name="newPassword"
                      isRequired={true}
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: '0px', md: '0px' }}
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                  </>
                )}

              </FormControl>
                              {error && (
                                <Box ms="4px" mb="8px">
                                  {error.map((errMsg, index) => (
                                    <Text
                                      key={index}
                                      fontSize="sm"
                                      fontWeight="bold"
                                      color="red.500"
                                      display="flex"
                                      alignItems="center"
                                    >
                                      <WarningIcon boxSize={4} color="red.500" mr={2} />{' '}
                                      {/* Icon cảnh báo */}
                                      {errMsg}
                                    </Text>
                                  ))}
                                </Box>
                              )}
            </Box>
           </Flex>
        </ModalBody>

        <ModalFooter>
          {mode !== 'view' && (
            <Button
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="10px"
              px="15px"
              py="5px"
              onClick={() => onSubmit(formData)}
            >
              Save
            </Button>
          )}
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

export default ChangePassModal;
