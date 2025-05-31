import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  InputGroup,
  InputRightAddon,
  useToast,
} from '@chakra-ui/react';

import { updateContribution, getContributionTypeFormData } from '../services/contributionService';

const EditContributionModal = ({ isOpen, onClose, contribution, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: '',
    typeId: '',
    description: '',
    target: '',
    startDate: '',
    endDate: '',
  });
  const [contributionTypes, setContributionTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && contribution) {
      setFormData({
        name: contribution.name || '',
        typeId: contribution.type?.id || '',
        description: contribution.description || '',
        target: contribution.target || '',
        startDate: contribution.startDate ? new Date(contribution.startDate).toISOString().split('T')[0] : '',
        endDate: contribution.endDate ? new Date(contribution.endDate).toISOString().split('T')[0] : '',
      });
      fetchContributionTypes();
    }
  }, [isOpen, contribution]);

  const fetchContributionTypes = async () => {
    try {
      const data = await getContributionTypeFormData();
      setContributionTypes(data.types || []);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách loại đóng góp',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên đóng góp',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        target: formData.target ? Number(formData.target) : null,
      };

      await updateContribution(contribution.id, payload);
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật đóng góp',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      onRefresh();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật đóng góp, vui lòng thử lại sau.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Chỉnh Sửa Đóng Góp</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired mb={4}>
            <FormLabel>Tên đóng góp</FormLabel>
            <Input
              name="name"
              placeholder="Nhập tên đóng góp"
              value={formData.name}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Loại đóng góp</FormLabel>
            <Select
              name="typeId"
              placeholder="Chọn loại đóng góp"
              value={formData.typeId}
              onChange={handleChange}
            >
              {contributionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Mô tả</FormLabel>
            <Textarea
              name="description"
              placeholder="Nhập mô tả đóng góp"
              value={formData.description}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Mục tiêu (để trống nếu không giới hạn)</FormLabel>
            <InputGroup>
              <Input
                name="target"
                type="number"
                placeholder="Nhập mục tiêu đóng góp"
                value={formData.target}
                onChange={handleChange}
              />
              <InputRightAddon children="VNĐ" />
            </InputGroup>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Ngày bắt đầu</FormLabel>
            <Input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Ngày kết thúc (để trống nếu không giới hạn)</FormLabel>
            <Input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="brand"
            mr={3}
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Lưu
          </Button>
          <Button onClick={onClose}>Hủy</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditContributionModal; 
