import { useEffect, useState, useCallback } from 'react';
import {
  Avatar,
  Button,
  Flex,
  Icon,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  useColorMode,
} from '@chakra-ui/react';
import { jwtDecode } from 'jwt-decode';
import { FaTrash, FaCheckCircle } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
// Custom Components
import { SearchBar } from 'components/navbar/searchBar/SearchBar';
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import PropTypes from 'prop-types';
// Assets
import navImage from 'assets/img/layout/Navbar.png';
import { MdNotificationsNone, MdInfoOutline } from 'react-icons/md';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { FaEthereum } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import routes from 'routes';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export default function HeaderLinks(props) {
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const toast = useToast();

  // Chakra Color Mode
  const navbarIcon = useColorModeValue('gray.400', 'white');
  let menuBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorBrand = useColorModeValue('brand.700', 'brand.400');
  const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');
  const ethBg = useColorModeValue('secondaryGray.300', 'navy.900');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)',
  );
  const borderButton = useColorModeValue('secondaryGray.500', 'whiteAlpha.200');

  // Notification state
  const [notifications, setNotifications] = useState({
    unreadNotifications: [],
    readNotifications: [],
    unreadCount: 0,
  });
  const [deletingIds, setDeletingIds] = useState({});

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/notifications/check`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      // Check for new notifications
      const newUnread = data.unreadNotifications.filter(
        (newNotif) => !notifications.unreadNotifications.some(
          (oldNotif) => oldNotif.id === newNotif.id
        )
      );
      if (newUnread.length > 0) {
        toast({
          title: `You have ${newUnread.length} new notification${newUnread.length > 1 ? 's' : ''}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }

      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [notifications.unreadNotifications, toast]);

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();

    // Poll every 3 minutes (180,000 ms)
    const interval = setInterval(fetchNotifications, 180000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchNotifications]);

  // Handle mark all read
  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_BASE_URL}/api/notifications/mark-as-read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update UI: Move all unread to read
      setNotifications((prev) => ({
        unreadNotifications: [],
        readNotifications: [
          ...prev.unreadNotifications,
          ...prev.readNotifications,
        ],
        unreadCount: 0,
      }));

      toast({
        title: 'Notifications marked as read',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: 'Error marking notifications as read',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (id, event) => {
    event.stopPropagation(); // Prevent menu from closing
    setDeletingIds((prev) => ({ ...prev, [id]: 'deleting' }));

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/notifications/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      // Show checkmark briefly before removing
      setDeletingIds((prev) => ({ ...prev, [id]: 'success' }));
      setTimeout(() => {
        setNotifications((prev) => ({
          unreadNotifications: prev.unreadNotifications.filter((n) => n.id !== id),
          readNotifications: prev.readNotifications.filter((n) => n.id !== id),
          unreadCount: prev.unreadNotifications.some((n) => n.id === id)
            ? prev.unreadCount - 1
            : prev.unreadCount,
        }));
        setDeletingIds((prev) => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      }, 1000);

      toast({
        title: 'Notification deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      setDeletingIds((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      toast({
        title: 'Error deleting notification',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleNotificationClick = async (message, id, event) => {
    event.stopPropagation(); // Prevent menu from closing
  
    const token = localStorage.getItem('token');
    if (!token) return;
  
    let role = null;
  
    try {
      const decoded = jwtDecode(token);
      role = decoded.role || decoded?.authorities?.[0]?.authority || null;
    } catch (error) {
      console.error('Invalid token:', error);
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/mark-as-read/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error('Failed to mark notification as read');
  
      // Update UI
      setNotifications((prev) => {
        const notification = prev.unreadNotifications.find((n) => n.id === id);
        if (!notification) return prev;
        return {
          unreadNotifications: prev.unreadNotifications.filter((n) => n.id !== id),
          readNotifications: [...prev.readNotifications, { ...notification, read: true }],
          unreadCount: prev.unreadCount - 1,
        };
      });
  
      // Hiển thị toast trước
      toast({
        title: 'Redirecting to complaint page...',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
  
      // Sau khi toast kết thúc mới điều hướng nếu là complaint
      if (message.toLowerCase().includes('complaint')) {
        setTimeout(() => {
          if (role === 'ROLE_ADMIN') {
            // window.location.reload();
            navigate('/admin/complaint');
          } else {
            // window.location.reload();
            navigate('/user/complaint');
          }
        }, 2000); // Delay đúng bằng thời gian toast
      }
  
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error marking notification as read',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });

      if (message.toLowerCase().includes('complaint')) {
        setTimeout(() => {
          if (role === 'ROLE_ADMIN') {
            // window.location.reload();
            navigate('/admin/complaint');
          } else {
            // window.location.reload();
            navigate('/user/complaint');
          }
        }, 2000); // Delay đúng bằng thời gian toast
      }
    }
  };
  

  const handleLogout = async () => {
    try {
      toast({
        title: 'Logout successful!',
        description: 'You will be redirected shortly...',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      setTimeout(() => {
        localStorage.clear();
        navigate('/auth/sign-in');
      }, 2000);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <Flex
      w={{ sm: '100%', md: 'auto' }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
      p="10px"
      borderRadius="30px"
      boxShadow={shadow}
    >
      <SearchBar
        mb={() => {
          if (secondary) {
            return { base: '10px', md: 'unset' };
          }
          return 'unset';
        }}
        me="10px"
        borderRadius="30px"
      />
      <Flex
        bg={ethBg}
        display={secondary ? 'flex' : 'none'}
        borderRadius="30px"
        ms="auto"
        p="6px"
        align="center"
        me="6px"
      ></Flex>
      <SidebarResponsive routes={routes} />
      <Menu>
        <MenuButton p="0px" position="relative">
          <Icon
            mt="6px"
            as={MdNotificationsNone}
            color={navbarIcon}
            w="18px"
            h="18px"
            me="10px"
          />
          {notifications.unreadCount > 0 && (
            <Flex
              position="absolute"
              top="-2px"
              right="5px"
              bg="red.500"
              borderRadius="full"
              w="16px"
              h="16px"
              align="center"
              justify="center"
            >
              <Text fontSize="xs" color="white">
                {notifications.unreadCount}
              </Text>
            </Flex>
          )}
        </MenuButton>
        <MenuList
          boxShadow={shadow}
          p="20px"
          borderRadius="20px"
          bg={menuBg}
          border="none"
          mt="22px"
          me={{ base: '30px', md: 'unset' }}
          minW={{ base: 'unset', md: '400px', xl: '450px' }}
          maxW={{ base: '360px', md: 'unset' }}
        >
          <Flex w="100%" mb="20px" justify="space-between" align="center">
            <Text fontSize="md" fontWeight="600" color={textColor}>
              Notifications
            </Text>
            {notifications.unreadCount > 0 && (
              <Text
                fontSize="sm"
                fontWeight="500"
                color={textColorBrand}
                cursor="pointer"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </Text>
            )}
          </Flex>
          <Flex flexDirection="column" maxH="300px" overflowY="auto">
            {notifications.unreadNotifications.length === 0 &&
              notifications.readNotifications.length === 0 && (
                <Text fontSize="sm" color="gray.500">
                  No notifications
                </Text>
              )}
            {notifications.unreadNotifications.map((notification) => (
              <MenuItem
                key={notification.id}
                _hover={{ bg: 'gray.50' }}
                _focus={{ bg: 'gray.50' }}
                px="14px"
                py="8px"
                borderRadius="8px"
                mb="5px"
                bg="gray.100"
                position="relative"
                onClick={(e) => handleNotificationClick(notification.message, notification.id, e)}
              >
                <Flex direction="column">
                  <Text fontSize="sm" fontWeight="600" color={textColor}>
                    {notification.message}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Text>
                </Flex>
                <Icon
                  as={
                    deletingIds[notification.id] === 'deleting'
                      ? CgSpinner
                      : deletingIds[notification.id] === 'success'
                      ? FaCheckCircle
                      : FaTrash
                  }
                  color={
                    deletingIds[notification.id] === 'success'
                      ? 'green.500'
                      : 'gray.500'
                  }
                  w="16px"
                  h="16px"
                  position="absolute"
                  right="14px"
                  top="50%"
                  transform="translateY(-50%)"
                  cursor="pointer"
                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                  animation={
                    deletingIds[notification.id] === 'deleting'
                      ? 'spin 1s linear infinite'
                      : undefined
                  }
                />
              </MenuItem>
            ))}
            {notifications.readNotifications.map((notification) => (
              <MenuItem
                key={notification.id}
                _hover={{ bg: 'gray.50' }}
                _focus={{ bg: 'gray.50' }}
                px="14px"
                py="8px"
                borderRadius="8px"
                mb="5px"
                position="relative"
                onClick={(e) => handleNotificationClick(notification.message, notification.id, e)}
              >
                <Flex direction="column">
                  <Text fontSize="sm" color="gray.600">
                    {notification.message}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Text>
                </Flex>
                <Icon
                  as={
                    deletingIds[notification.id] === 'deleting'
                      ? CgSpinner
                      : deletingIds[notification.id] === 'success'
                      ? FaCheckCircle
                      : FaTrash
                  }
                  color={
                    deletingIds[notification.id] === 'success'
                      ? 'green.500'
                      : 'gray.500'
                  }
                  w="16px"
                  h="16px"
                  position="absolute"
                  right="14px"
                  top="50%"
                  transform="translateY(-50%)"
                  cursor="pointer"
                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                  animation={
                    deletingIds[notification.id] === 'deleting'
                      ? 'spin 1s linear infinite'
                      : undefined
                  }
                />
              </MenuItem>
            ))}
          </Flex>
        </MenuList>
      </Menu>

      <Menu>
        <MenuButton p="0px">
          <Icon
            mt="6px"
            as={MdInfoOutline}
            color={navbarIcon}
            w="18px"
            h="18px"
            me="10px"
          />
        </MenuButton>
        <MenuList
          box personallyShadow={shadow}
          p="20px"
          me={{ base: '30px', md: 'unset' }}
          borderRadius="20px"
          bg={menuBg}
          border="none"
          mt="22px"
          minW={{ base: 'unset' }}
          maxW={{ base: '360px', md: 'unset' }}
        >
          <Image src={navImage} borderRadius="16px" mb="28px" />
          <Flex flexDirection="column">
            <Link w="100%" href="https://horizon-ui.com/pro">
              <Button w="100%" h="44px" mb="10px" variant="brand">
                Buy Horizon UI PRO
              </Button>
            </Link>
            <Link
              w="100%"
              href="https://horizon-ui.com/documentation/docs/introduction"
            >
              <Button
                w="100%"
                h="44px"
                mb="10px"
                border="1px solid"
                bg="transparent"
                borderColor={borderButton}
              >
                See Documentation
              </Button>
            </Link>
            <Link
              w="100%"
              href="https://github.com/horizon-ui/horizon-ui-chakra-ts"
            >
              <Button
                w="100%"
                h="44px"
                variant="no-hover"
                color={textColor}
                bg="transparent"
              >
                Try Horizon Free
              </Button>
            </Link>
          </Flex>
        </MenuList>
      </Menu>

      <Button
        variant="no-hover"
        bg="transparent"
        p="0px"
        minW="unset"
        minH="unset"
        h="18px"
        w="max-content"
        onClick={toggleColorMode}
      >
        <Icon
          me="10px"
          h="18px"
          w="18px"
          color={navbarIcon}
          as={colorMode === 'light' ? IoMdMoon : IoMdSunny}
        />
      </Button>
      <Menu>
        <MenuButton p="0px">
          <Avatar
            _hover={{ cursor: 'pointer' }}
            color="white"
            name="Adela Parkson"
            bg="#11047A"
            size="sm"
            w="40px"
            h="40px"
          />
        </MenuButton>
        <MenuList
          boxShadow={shadow}
          p="0px"
          mt="10px"
          borderRadius="20px"
          bg={menuBg}
          border="none"
        >
          <Flex w="100%" mb="0px">
            <Text
              ps="20px"
              pt="16px"
              pb="10px"
              w="100%"
              borderBottom="1px solid"
              borderColor={borderColor}
              fontSize="sm"
              fontWeight="700"
              color={textColor}
            >
              👋 Hey, my friend!
            </Text>
          </Flex>
          <Flex flexDirection="column" p="10px">
            <MenuItem
              _hover={{ bg: 'none' }}
              _focus={{ bg: 'none' }}
              borderRadius="8px"
              px="14px"
            >
              <Text fontSize="sm">Profile Settings</Text>
            </MenuItem>
            <MenuItem
              _hover={{ bg: 'none' }}
              _focus={{ bg: 'none' }}
              borderRadius="8px"
              px="14px"
            >
              <Text fontSize="sm">Newsletter Settings</Text>
            </MenuItem>
            <MenuItem
              _hover={{ bg: 'none' }}
              _focus={{ bg: 'none' }}
              color="red.400"
              borderRadius="8px"
              px="14px"
              onClick={handleLogout}
            >
              <Text fontSize="sm">Log out</Text>
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};

// Add CSS for spinning animation
const styles = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);