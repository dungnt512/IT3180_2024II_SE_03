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

const UserModal = ({ isOpen, onClose, mode, userData, onSubmit, error }) => {
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const [formData, setFormData] = useState({
    ...(mode === 'create' ? { name: '' } : {}), 
    ...(mode !== 'edit' ? { email: '' } : {}), 
    phone: '',
    ...(mode !== 'view' ? { role: 'ADMIN' } : {}), 
    fullName: '',
    age: '',
    apartmentNumbers: [],
    ...(mode === 'create' ? { password: '' } : {}), 
  });
  useEffect(() => {
    if (mode === 'edit' || mode === 'view') {
      setFormData(userData);
    } else {
      setFormData({
        ...(mode === 'create' ? { name: '' } : {}), 
        ...(mode !== 'edit' ? { email: '' } : {}), 
        phone: '',
        ...(mode !== 'view' ? { role: 'ADMIN' } : {}), 
        fullName: '',
        age: '',
        apartmentNumbers: [],
        ...(mode === 'create' ? { password: '' } : {}),
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
            ? 'Create User'
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
                      Username<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Input
                      type="text"
                      name="name"
                      isRequired={true}
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: '0px', md: '0px' }}
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                      value={formData.name}
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
                      Password<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Input
                      type="password"
                      name="password"
                      isRequired={true}
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: '0px', md: '0px' }}
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </>
                )}

                {mode !== 'edit' && (
                  <>
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                      mb="8px"
                    >
                      Email<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Input
                      type="email"
                      name="email"
                      isRequired={true}
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: '0px', md: '0px' }}
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                      value={formData.email}
                      onChange={handleChange}
                      isReadOnly={mode === 'view'}
                    />
                  </>
                )}

                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px"
                >
                  Phone<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  name="phone"
                  isRequired={true}
                  variant="auth"
                  fontSize="sm"
                  ms={{ base: '0px', md: '0px' }}
                  mb="24px"
                  fontWeight="500"
                  size="lg"
                  value={formData.phone}
                  onChange={handleChange}
                  isReadOnly={mode === 'view'}
                />

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
                      Role<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Select
                      name="role"
                      isRequired={true}
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: '0px', md: '0px' }}
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                      value={formData.role}
                      onChange={handleChange}
                      isReadOnly={mode === 'view'}
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="USER">USER</option>
                    </Select>
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
                  Full name<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  name="fullName"
                  isRequired={true}
                  variant="auth"
                  fontSize="sm"
                  ms={{ base: '0px', md: '0px' }}
                  mb="24px"
                  fontWeight="500"
                  size="lg"
                  value={formData.fullName}
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
                  Age<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  type="number"
                  name="age"
                  isRequired={true}
                  variant="auth"
                  fontSize="sm"
                  ms={{ base: '0px', md: '0px' }}
                  mb="24px"
                  fontWeight="500"
                  size="lg"
                  value={formData.age}
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
                  Apartment Numbers<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  type="text"
                  name="apartmentNumbers"
                  isRequired={true}
                  variant="auth"
                  fontSize="sm"
                  ms={{ base: '0px', md: '0px' }}
                  mb="24px"
                  fontWeight="500"
                  size="lg"
                  value={formData.apartmentNumbers}
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
                        <WarningIcon boxSize={4} color="red.500" mr={2} />{' '}
                        {/* Icon cảnh báo */}
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

export default UserModal;
