import {
    Flex,
    Box,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Spinner,
    Button,
    useDisclosure,
} from '@chakra-ui/react';
import * as React from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import Card from 'components/card/Card';
import NotificationModal from './NotifModal';

const columnHelper = createColumnHelper();

export default function NotiTable({ tableData }) {
    const [residentNames, setResidentNames] = React.useState([]);
    const [selectedMessage, setSelectedMessage] = React.useState('');
    const [isResidentModalOpen, setIsResidentModalOpen] = React.useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = React.useState(false);
    const [data, setData] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isTimeout, setIsTimeout] = React.useState(false);
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
    const { isOpen, onOpen, onClose } = useDisclosure();

    React.useEffect(() => {
        setIsLoading(true);
        setIsTimeout(false);

        // Set timeout for 30 seconds
        const timeoutId = setTimeout(() => {
            if (isLoading) {
                setIsLoading(false);
                setIsTimeout(true);
            }
        }, 30000);

        // Process tableData
        if (Array.isArray(tableData)) {
            setData(tableData);
            setIsLoading(false);
            clearTimeout(timeoutId);
        } else {
            console.warn('tableData is not an array, skipping update');
            setIsLoading(false);
            clearTimeout(timeoutId);
        }

        // Cleanup timeout on unmount
        return () => clearTimeout(timeoutId);
    }, [tableData]);

    const handleViewResidents = (residents) => {
        setResidentNames(residents.map((r) => r.fullName));
        setIsResidentModalOpen(true);
    };

    const handleViewMessage = (message) => {
        setSelectedMessage(message);
        setIsMessageModalOpen(true);
    };

    const columns = React.useMemo(
        () => [
            columnHelper.accessor('id', {
                header: () => (
                    <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
                        ID
                    </Text>
                ),
                cell: (info) => (
                    <Text color={textColor} fontSize="sm" fontWeight="700">
                        {info.getValue()}
                    </Text>
                ),
            }),
            columnHelper.accessor('residents', {
                header: () => (
                    <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
                        RESIDENTS
                    </Text>
                ),
                cell: (info) => {
                    const residents = info.getValue();
                    const fullNames = residents.map((r) => r.fullName).join(', ');
                    const maxLength = 100;
                    return (
                        <Text color={textColor} fontSize="sm" fontWeight="700">
                            {fullNames.length > maxLength ? (
                                <>
                                    {fullNames.substring(0, maxLength)}...
                                    <Text
                                        as="span"
                                        color="blue.500"
                                        cursor="pointer"
                                        ml="4px"
                                        onClick={() => handleViewResidents(residents)}
                                    >
                                        View more
                                    </Text>
                                </>
                            ) : (
                                fullNames
                            )}
                        </Text>
                    );
                },
            }),
            columnHelper.accessor('message', {
                header: () => (
                    <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
                        MESSAGE
                    </Text>
                ),
                cell: (info) => {
                    const message = info.getValue();
                    const maxLength = 100;
                    return (
                        <Text color={textColor} fontSize="sm" fontWeight="700">
                            {message.length > maxLength ? (
                                <>
                                    {message.substring(0, maxLength)}...
                                    <Text
                                        as="span"
                                        color="blue.500"
                                        cursor="pointer"
                                        ml="4px"
                                        onClick={() => handleViewMessage(message)}
                                    >
                                        View more
                                    </Text>
                                </>
                            ) : (
                                message
                            )}
                        </Text>
                    );
                },
            }),
            columnHelper.accessor('createdAt', {
                header: () => (
                    <Text fontSize={{ sm: '10px', Wlg: '12px' }} color="gray.400">
                        CREATED AT
                    </Text>
                ),
                cell: (info) => (
                    <Text color={textColor} fontSize="sm" fontWeight="700">
                        {new Date(info.getValue()).toLocaleString()}
                    </Text>
                ),
            }),
        ],
        [textColor],
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Card flexDirection="column" w="100%" px="0px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
            <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
                <Text color={textColor} fontSize="22px" fontWeight="700" lineHeight="100%">
                    Notification Table
                </Text>
                <Button
                    variant="darkBrand"
                    color="white"
                    fontSize="sm"
                    fontWeight="500"
                    borderRadius="10px"
                    px="15px"
                    py="5px"
                    onClick={onOpen}
                >
                    Send Notification
                </Button>
            </Flex>
            {isLoading ? (
                <Flex justify="center" align="center" py="20px" minH="200px" flexDirection="column" gap="4">
                    <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
                    <Text color={textColor} fontSize="md">
                        Loading notification data...
                    </Text>
                </Flex>
            ) : isTimeout ? (
                <Flex justify="center" align="center" py="20px" minH="200px" flexDirection="column" gap="4">
                    <Text color={textColor} fontSize="md" fontWeight="600">
                        No data available
                    </Text>
                </Flex>
            ) : (
                <Table variant="simple" color="gray.500" mb="24px" mt="12px">
                    <Thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Th key={header.id} pe="10px" borderColor={borderColor}>
                                        <Flex
                                            justifyContent="space-between"
                                            align="center"
                                            fontSize={{ sm: '10px', lg: '12px' }}
                                            color="gray.400"
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </Flex>
                                    </Th>
                                ))}
                            </Tr>
                        ))}
                    </Thead>
                    <Tbody>
                        {table.getRowModel().rows.map((row) => (
                            <Tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <Td
                                        key={cell.id}
                                        fontSize={{ sm: '14px' }}
                                        minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                                        borderColor="transparent"
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Td>
                                ))}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
            <Modal isOpen={isResidentModalOpen} onClose={() => setIsResidentModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Resident Names</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>{residentNames.join(', ')}</Text>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Message Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>{selectedMessage}</Text>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <NotificationModal isOpen={isOpen} onClose={onClose} />
        </Card>
    );
}