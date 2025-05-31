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

const AppartmentModal = ({ isOpen, onClose, mode, userData, onSubmit, error }) => {
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const [formData, setFormData] = useState({
      ...(mode !== 'view' ? { apartmentNumber: '' } : {}),
      ...(mode !== 'view' ? { roomNumber: '' } : {}),
      ...(mode !== 'view' ? { floor: '' } : {}),
      ...(mode !== 'view' ? { area: '' } : {}),
      ...(mode !== 'view' ? { type: '' } : {}),
      ...(mode !== 'view' ? { status: '' } : {}),
      ...(mode === 'view' ? { residents: '' } : {}),
  });

  useEffect(() => {
      console.log("userData in useEffect:", userData);
      if (mode === 'edit' || mode === 'view') {
          setFormData(userData);
      } else {
          setFormData({
              ...(mode !== 'view' ? { apartmentNumber: '' } : {}),
              ...(mode !== 'view' ? { roomNumber: '' } : {}),
              ...(mode !== 'view' ? { floor: '' } : {}),
              ...(mode !== 'view' ? { area: '' } : {}),
              ...(mode !== 'view' ? { type: '' } : {}),
              ...(mode !== 'view' ? { status: '' } : {}),
              ...(mode === 'view' ? { residents: '' } : {}),
          });
      }
  }, [mode, userData]);

  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
          <ModalOverlay />
          <ModalContent>
              <ModalHeader>
                  {mode === 'create'
                      ? 'Create Apartment'
                      : mode === 'edit'
                      ? 'Edit Apartment'
                      : 'Apartment Details'}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                  <Flex direction="row" w="100%" gap="20px">
                      <Box flex="1">
                          <FormControl>
                              {mode !== 'view' && (
                                  <>
                                      <FormLabel
                                          display="flex"
                                          ms="4px"
                                          fontSize="sm"
                                          fontWeight="500"
                                          color={textColor}
                                          mb="8px"
                                      >
                                          Apartment Number<Text color={brandStars}>*</Text>
                                      </FormLabel>
                                      <Input
                                          type="text"
                                          name="apartmentNumber"
                                          isRequired={true}
                                          variant="auth"
                                          fontSize="sm"
                                          ms={{ base: '0px', md: '0px' }}
                                          mb="24px"
                                          fontWeight="500"
                                          size="lg"
                                          value={formData.apartmentNumber}
                                          onChange={handleChange}
                                          isReadOnly={mode === 'edit'}
                                      />
                                  </>
                              )}

                              {mode !== 'view' && (
                                  <>
                                      <FormLabel
                                          display="flex"
                                          ms="4px"
                                          fontSize="sm"
                                          fontWeight="500"
                                          color={textColor}
                                          mb="8px"
                                      >
                                          Room Number<Text color={brandStars}>*</Text>
                                      </FormLabel>
                                      <Input
                                          name="roomNumber"
                                          isRequired={true}
                                          variant="auth"
                                          fontSize="sm"
                                          ms={{ base: '0px', md: '0px' }}
                                          mb="24px"
                                          fontWeight="500"
                                          size="lg"
                                          value={formData.roomNumber}
                                          onChange={handleChange}
                                      />
                                  </>
                              )}

                              {mode !== 'view' ? (
                                  <>
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
                                          placeholder="Select type"
                                      >
                                          <option value="PENHOUSE">PENHOUSE</option>
                                          <option value="STANDARD">STANDARD</option>
                                          <option value="KIOT">KIOT</option>
                                      </Select>
                                  </>
                              ) : (
                                  <>
                                      <FormLabel
                                          display="flex"
                                          ms="4px"
                                          fontSize="sm"
                                          fontWeight="500"
                                          color={textColor}
                                          mb="8px"
                                      >
                                          Type
                                      </FormLabel>
                                      <Input
                                          name="type"
                                          variant="auth"
                                          fontSize="sm"
                                          ms={{ base: '0px', md: '0px' }}
                                          mb="24px"
                                          fontWeight="500"
                                          size="lg"
                                          value={formData.type}
                                          isReadOnly={true}
                                      />
                                  </>
                              )}
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
                                  Floor<Text color={brandStars}>*</Text>
                              </FormLabel>
                              <Input
                                  name="floor"
                                  isRequired={true}
                                  variant="auth"
                                  fontSize="sm"
                                  ms={{ base: '0px', md: '0px' }}
                                  mb="24px"
                                  fontWeight="500"
                                  size="lg"
                                  value={formData.floor}
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
                                  Area (m²)<Text color={brandStars}>*</Text>
                              </FormLabel>
                              <Input
                                  name="area"
                                  isRequired={true}
                                  variant="auth"
                                  fontSize="sm"
                                  ms={{ base: '0px', md: '0px' }}
                                  mb="24px"
                                  fontWeight="500"
                                  size="lg"
                                  value={formData.area}
                                  onChange={handleChange}
                                  isReadOnly={mode === 'view'}
                              />

                              {mode !== 'view' ? (
                                  <>
                                      <FormLabel
                                          display="flex"
                                          ms="4px"
                                          fontSize="sm"
                                          fontWeight="500"
                                          color={textColor}
                                          mb="8px"
                                      >
                                          Status<Text color={brandStars}>*</Text>
                                      </FormLabel>
                                      <Select
                                          name="status"
                                          isRequired={true}
                                          variant="auth"
                                          fontSize="sm"
                                          ms={{ base: '0px', md: '0px' }}
                                          mb="24px"
                                          fontWeight="500"
                                          size="lg"
                                          value={formData.status}
                                          onChange={handleChange}
                                          placeholder="Select status"
                                      >
                                          <option value="OCCUPIED">OCCUPIED</option>
                                          <option value="RENT">RENT</option>
                                          <option value="VACANT">VACANT</option>
                                      </Select>
                                  </>
                              ) : (
                                  <>
                                      <FormLabel
                                          display="flex"
                                          ms="4px"
                                          fontSize="sm"
                                          fontWeight="500"
                                          color={textColor}
                                          mb="8px"
                                      >
                                          Status
                                      </FormLabel>
                                      <Input
                                          name="status"
                                          variant="auth"
                                          fontSize="sm"
                                          ms={{ base: '0px', md: '0px' }}
                                          mb="24px"
                                          fontWeight="500"
                                          size="lg"
                                          value={formData.status}
                                          isReadOnly={true}
                                      />
                                  </>
                              )}

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

export default AppartmentModal;