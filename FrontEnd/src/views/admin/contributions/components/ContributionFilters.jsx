import React from 'react';
import {
  Box,
  Flex,
  Select,
  FormControl,
  FormLabel,
  Input,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';

const ContributionFilters = ({ filters, setFilters, contributionTypes = [] }) => {
  const bg = useColorModeValue('white', 'navy.700');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const handleStatusChange = (e) => {
    setFilters({ ...filters, status: e.target.value });
  };

  const handleTypeChange = (e) => {
    setFilters({ ...filters, type: e.target.value });
  };

  const handleDateChange = (e) => {
    setFilters({ ...filters, date: e.target.value });
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      date: null,
    });
  };

  return (
    <Box
      bg={bg}
      borderRadius="16px"
      p="16px"
      boxShadow="0px 2px 5.5px rgba(0, 0, 0, 0.02)"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="500">Trạng thái</FormLabel>
          <Select
            value={filters.status}
            onChange={handleStatusChange}
            size="sm"
            borderRadius="15px"
          >
            <option value="all">Tất cả</option>
            <option value="open">Đang mở</option>
            <option value="closed">Đã kết thúc</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel fontSize="sm" fontWeight="500">Loại đóng góp</FormLabel>
          <Select
            value={filters.type}
            onChange={handleTypeChange}
            size="sm"
            borderRadius="15px"
          >
            <option value="all">Tất cả</option>
            {contributionTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel fontSize="sm" fontWeight="500">Ngày</FormLabel>
          <Input
            type="date"
            value={filters.date || ''}
            onChange={handleDateChange}
            size="sm"
            borderRadius="15px"
          />
        </FormControl>

        <Button
          variant="outline"
          colorScheme="brand"
          alignSelf="flex-end"
          onClick={handleClearFilters}
          size="sm"
          borderRadius="15px"
        >
          Xóa lọc
        </Button>
      </Flex>
    </Box>
  );
};

export default ContributionFilters; 