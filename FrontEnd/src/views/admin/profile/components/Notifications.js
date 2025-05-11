import { useEffect, useState } from "react";
import { Flex, Text, Box, Badge, useColorModeValue } from "@chakra-ui/react";
import Card from "components/card/Card.js";
import Menu from "components/menu/MainMenu";

export default function Notifications(props) {
  const { ...rest } = props;
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const [notifications, setNotifications] = useState({
    unreadNotifications: [],
    readNotifications: [],
    unreadCount: 0
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${API_BASE_URL}/api/notifications/check`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <Card mb="20px" mt="40px" mx="auto" maxW="410px" {...rest}>
      <Flex align="center" w="100%" justify="space-between" mb="30px">
        <Text
          color={textColorPrimary}
          fontWeight="bold"
          fontSize="2xl"
          mb="4px"
        >
          Notifications
          {notifications.unreadCount > 0 && (
            <Badge ml="2" colorScheme="red">
              {notifications.unreadCount}
            </Badge>
          )}
        </Text>
        <Menu />
      </Flex>

      {/* Unread Notifications */}
      {notifications.unreadNotifications.length > 0 && (
        <Box mb="20px">
          <Text
            color={textColorPrimary}
            fontWeight="bold"
            fontSize="md"
            mb="10px"
          >
            Unread Notifications
          </Text>
          {notifications.unreadNotifications.map((notification) => (
            <Box
              key={notification.id}
              p="10px"
              mb="5px"
              bg="gray.100"
              borderRadius="md"
            >
              <Text fontSize="sm" color={textColorPrimary}>
                {notification.message}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {new Date(notification.createdAt).toLocaleString()}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Read Notifications */}
      {notifications.readNotifications.length > 0 && (
        <Box>
          <Text
            color={textColorPrimary}
            fontWeight="bold"
            fontSize="md"
            mb="10px"
          >
            Read Notifications
          </Text>
          {notifications.readNotifications.map((notification) => (
            <Box
              key={notification.id}
              p="10px"
              mb="5px"
              bg="white"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
            >
              <Text fontSize="sm" color="gray.600">
                {notification.message}
              </Text>
              <Text fontSize="xs" color="gray.400">
                {new Date(notification.createdAt).toLocaleString()}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Empty State */}
      {notifications.unreadNotifications.length === 0 &&
        notifications.readNotifications.length === 0 && (
          <Text color="gray.500" fontSize="sm">
            No notifications available
          </Text>
        )}
    </Card>
  );
}