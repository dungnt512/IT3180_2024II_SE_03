import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Flex,
  Box,
  Text,
  useColorModeValue,
  Image,
  Spinner,
  IconButton,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { CopyIcon } from '@chakra-ui/icons';
import axios from 'axios';

const PaymentModal = ({ isOpen, onClose, id }) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const [qrData, setQrData] = useState({ qrCodeUrl: '', referenceCode: '' });
  const [billData, setBillData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchQrCode = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication failed: No token found!');
      }

      const [qrResponse, billResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/qrcode/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/bills/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setQrData({
        qrCodeUrl: qrResponse.data.qrCodeUrl || '',
        referenceCode: qrResponse.data.referenceCode || '',
      });
      setBillData(billResponse.data);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      setQrData({ qrCodeUrl: '', referenceCode: '' });
      setBillData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !id) return;
    fetchQrCode();
  }, [isOpen, id]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrData.qrCodeUrl;
    link.download = `payment-qr-${qrData.referenceCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text fontSize="lg" fontWeight="700" color={textColor}>
            Payment QR Code
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" align="center" gap="20px">
            {error ? (
              <Text fontSize="sm" fontWeight="500" color="red.500">
                {error}
              </Text>
            ) : (
              <>
                {isLoading ? (
                  <Spinner
                    size="xl"
                    color={textColor}
                    thickness="4px"
                    speed="0.65s"
                  />
                ) : (
                  <>
                    {billData && (
                      <Box textAlign="center" w="100%">
                        <Text
                          fontSize="md"
                          fontWeight="700"
                          color={textColor}
                          mb="8px"
                        >
                          Bạn đang thanh toán cho bill sau:
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          Căn hộ: {billData.apartmentNumber}
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          Loại phí: {billData.billType}
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          Số tiền: {billData.amount.toLocaleString()} ₫
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          Hạn thanh toán: {billData.dueDate}
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          Mô tả: {billData.description}
                        </Text>
                      </Box>
                    )}
                    {qrData.qrCodeUrl ? (
                      <Box>
                        <Image
                          src={qrData.qrCodeUrl}
                          alt="Payment QR Code"
                          boxSize="200px"
                          objectFit="contain"
                          borderRadius="10px"
                        />
                      </Box>
                    ) : (
                      <Text fontSize="sm" fontWeight="500" color={textColor}>
                        No QR code available
                      </Text>
                    )}
                    {qrData.referenceCode && (
                      <Box textAlign="center">
                        <Text
                          fontSize="sm"
                          fontWeight="700"
                          color={textColor}
                          mb="8px"
                        >
                          Reference Code: {qrData.referenceCode}
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="500"
                          color={textColor}
                          maxW="400px"
                        >
                          Scan the QR code above with your banking app to make the payment. Please include the reference code in your transaction for verification.
                        </Text>
                      </Box>
                    )}
                    <Box textAlign="left" w="100%">
                      <Text
                        fontSize="md"
                        fontWeight="700"
                        color={textColor}
                        mb="8px"
                      >
                        Người dùng có thể chuyển khoản theo định danh sau:
                      </Text>
                      <Text fontSize="sm" color={textColor}>
                        Ngân hàng: MBBank
                      </Text>
                      <Flex align="center">
                        <Text fontSize="sm" color={textColor}>
                          Số tài khoản: 0353856748
                        </Text>
                        <IconButton
                          icon={<CopyIcon />}
                          size="xs"
                          ml="8px"
                          onClick={() => copyToClipboard('0353856748')}
                        />
                      </Flex>
                      <Text fontSize="sm" color={textColor}>
                        Chủ tài khoản: NGUYEN TAN DUNG
                      </Text>
                      <Flex align="center">
                        <Text fontSize="sm" color={textColor}>
                          Số tiền: {billData?.amount.toLocaleString() || '50'} ₫
                        </Text>
                        <IconButton
                          icon={<CopyIcon />}
                          size="xs"
                          ml="8px"
                          onClick={() =>
                            copyToClipboard(
                              billData?.amount.toString() || '50',
                            )
                          }
                        />
                      </Flex>
                      <Flex align="center">
                        <Text fontSize="sm" color={textColor}>
                          Nội dung chuyển khoản:{' '}
                          {qrData.referenceCode
                            ? `${qrData.referenceCode} ${billData?.description || ''}`
                            : 'Reference Code + Description'}
                        </Text>
                        <IconButton
                          icon={<CopyIcon />}
                          size="xs"
                          ml="8px"
                          onClick={() =>
                            copyToClipboard(
                              qrData.referenceCode
                                ? `${qrData.referenceCode} ${billData?.description || ''}`
                                : 'Reference Code + Description',
                            )
                          }
                        />
                      </Flex>
                    </Box>
                  </>
                )}
              </>
            )}
          </Flex>
        </ModalBody>
        <ModalFooter>
          {qrData.qrCodeUrl && (
            <>
              <Button
                variant="darkBrand"
                color="white"
                fontSize="sm"
                fontWeight="500"
                borderRadius="10px"
                px="15px"
                py="5px"
                onClick={fetchQrCode}
                isLoading={isLoading}
                mr="8px"
              >
                Regenerate QR Code
              </Button>
              <Button
                variant="darkBrand"
                color="white"
                fontSize="sm"
                fontWeight="500"
                borderRadius="10px"
                px="15px"
                py="5px"
                onClick={handleDownload}
                isDisabled={isLoading || !qrData.qrCodeUrl}
                mr="8px"
              >
                Download QR Code
              </Button>
            </>
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

export default PaymentModal;