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
    Spinner,
  } from '@chakra-ui/react';
  import { useState, useEffect } from 'react';
  import * as React from 'react';
  import { WarningIcon } from '@chakra-ui/icons';
  import { MdCheckCircle } from 'react-icons/md';
  
  const UserModal = ({ isOpen, onClose, mode, userData, onSubmit, error }) => {
    const brandStars = useColorModeValue('brand.500', 'brand.400');
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const [formData, setFormData] = React.useState({
      ...(mode === 'create'
        ? { name: '', email: '', password: '', status: 'THUONGTRU', phone: '' }
        : {}),
      ...(mode === 'edit' ? { status: 'THUONGTRU' } : {}),
      phone: '',
      ...(mode !== 'view' ? { role: 'ADMIN' } : { status: 'THUONGTRU' }),
      fullName: '',
      age: '',
      apartmentNumbers: '',
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitSuccess, setSubmitSuccess] = React.useState(false);
    const [isFormValid, setIsFormValid] = React.useState(false);
  
    React.useEffect(() => {
      if (mode === 'edit' || mode === 'view') {
        setFormData({
          fullName: userData.fullName || '',
          age: userData.age || '',
          phone: userData.phone || '',
          role: userData.role || 'ADMIN',
          status: userData.status || 'THUONGTRU',
          apartmentNumbers: Array.isArray(userData.apartmentNumbers)
            ? userData.apartmentNumbers.join(',')
            : userData.apartmentNumbers || '',
          ...(mode === 'view' ? { email: userData.email || '' } : {}),
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          role: 'ADMIN',
          fullName: '',
          age: '',
          status: 'THUONGTRU',
          apartmentNumbers: '',
        });
      }
      setIsSubmitting(false);
      setSubmitSuccess(false);
    }, [mode, userData, isOpen]);
  
    React.useEffect(() => {
      const validateForm = () => {
        if (mode === 'create') {
          return (
            formData.name.trim() !== '' &&
            formData.email.trim() !== '' &&
            formData.password.trim() !== '' &&
            formData.phone.trim() !== '' &&
            formData.fullName.trim() !== '' &&
            formData.age !== '' && !isNaN(formData.age) &&
            formData.apartmentNumbers.trim() !== '' &&
            formData.status !== ''
          );
        } else if (mode === 'edit') {
          return (
            formData.fullName.trim() !== '' &&
            formData.age !== '' && !isNaN(formData.age) &&
            formData.phone.trim() !== '' &&
            formData.apartmentNumbers.trim() !== '' &&
            formData.status !== '' &&
            formData.role !== ''
          );
        }
        return true;
      };
      setIsFormValid(validateForm());
    }, [formData, mode]);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!isFormValid) return;
      setIsSubmitting(true);
      const success = await onSubmit(formData);
      if (success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsSubmitting(false);
          setSubmitSuccess(false);
          onClose();
        }, 1000);
      } else {
        setIsSubmitting(false);
      }
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
            <form onSubmit={handleSubmit}>
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
                          type="tel"
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
                      </>
                    )}
                    {(mode === 'edit' || mode === 'view') && (
                      <>
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
                          type="tel"
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
                      </>
                    )}
                    {(mode === 'create' || mode === 'edit') && (
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
                          isDisabled={mode === 'view'}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="USER">USER</option>
                        </Select>
                      </>
                    )}
                    {mode === 'view' && userData.email && (
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
                      isDisabled={mode === 'view'}
                    >
                      <option value="THUONGTRU">THUONGTRU</option>
                      <option value="TAMTRU">TAMTRU</option>
                      <option value="TAMVANG">TAMVANG</option>
                    </Select>
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
                            <WarningIcon boxSize={4} color="red.500" mr={2} />
                            {errMsg}
                          </Text>
                        ))}
                      </Box>
                    )}
                  </FormControl>
                </Box>
              </Flex>
            </form>
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
                onClick={handleSubmit}
                isDisabled={isSubmitting || !isFormValid}
                leftIcon={
                  isSubmitting ? (
                    <Spinner size="sm" />
                  ) : submitSuccess ? (
                    <MdCheckCircle />
                  ) : null
                }
              >
                {isSubmitting ? 'Saving...' : submitSuccess ? 'Success' : 'Save'}
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
              ml={3}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default UserModal;