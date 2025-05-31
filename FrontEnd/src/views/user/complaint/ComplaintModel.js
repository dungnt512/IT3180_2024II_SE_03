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
  
  const ComplaintModal = ({ isOpen, onClose, mode, complaintData, onSubmit, error }) => {
    const brandStars = useColorModeValue('brand.500', 'brand.400');
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const [formData, setFormData] = useState({
      title: '',
      content: '',
      type: 'Security',
    });
  
    useEffect(() => {
      if (mode === 'edit' || mode === 'view') {
        setFormData(complaintData);
      } else {
        setFormData({
          title: '',
          content: '',
          type: 'Security',
        });
      }
    }, [mode, complaintData]);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <
  
  ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {mode === 'create'
              ? 'Create Complaint'
              : mode === 'edit'
                ? 'Edit Complaint'
                : 'Complaint Details'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="row" w="100%" gap="20px">
              <Box flex="1">
                <FormControl>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Title<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    type="text"
                    name="title"
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                    value={formData.title}
                    onChange={handleChange}
                    isReadOnly={mode === 'view'}
                  />
  
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Type<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Select
                    name="type"
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                    value={formData.type}
                    onChange={handleChange}
                    isReadOnly={mode === 'view'}
                  >
                    <option value="Security">Security</option>
                    <option value="Technical">Technical</option>
                    <option value="Noise-Order">Noise-Order</option>
                    <option value="Resident Rights">Resident Rights</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>
              </Box>
  
              <Box flex="1">
                <FormControl>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    color={textColor}
                    mb="8px"
                  >
                    Content<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    type="text"
                    name="content"
                    isRequired={true}
                    variant="auth"
                    fontSize="sm"
                    ms={{ base: '0px', md: '0px' }}
                    mb="24px"
                    fontWeight="500"
                    size="lg"
                    value={formData.content}
                    onChange={handleChange}
                    isReadOnly={mode === 'view'}
                  />
  
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
                          <WarningIcon boxSize={4} color="red.500" mr={2} />
                          {errMsg}
                        </Text>
                      ))}
                    </Box>
                  )}
                </FormControl>
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
  
  export default ComplaintModal;