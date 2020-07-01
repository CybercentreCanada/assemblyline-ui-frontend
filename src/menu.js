import React from "react";
import {
  Box,
  Heading,
  Flex,
  Text,
  Avatar,
  useColorMode,
  IconButton
} from "@chakra-ui/core";

const MenuItems = ({ children }) => (
  <Text mt={{ base: 4, md: 0 }} mr={6} display="block" color="white">
    {children}
  </Text>
);

const Menu = props => {
  const [show, setShow] = React.useState(false);
  const handleToggle = () => setShow(!show);
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="0.5rem"
      paddingLeft="1.5rem"
      paddingRight="1.5rem"
      bg="gray.900"
      {...props}
    >
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg" letterSpacing={"-.1rem"} color="white">
          Assemblyline
        </Heading>
      </Flex>

      <Box display={{ sm: "block", md: "none" }} onClick={handleToggle}>
        <svg
          fill="white"
          width="12px"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </Box>

      <Box
        display={{ sm: show ? "block" : "none", md: "flex" }}
        width={{ sm: "full", md: "auto" }}
        alignItems="center"
        flexGrow={1}
      >
        <MenuItems>Submit</MenuItems>
        <MenuItems>Submissions</MenuItems>
        <MenuItems>Alerts</MenuItems>
        <MenuItems>Signatures</MenuItems>
        <MenuItems>Help</MenuItems>
      </Box>

      <IconButton
        onClick={toggleColorMode}
        aria-label="Toggle color mode"
        icon={colorMode === "light" ? "moon" : "sun"}
        marginRight="1rem"
        size="sm"
      />

      <Avatar
        name="Steve Garon"
        src="https://s.gravatar.com/avatar/15925199802f2e849415dcb146df9085"
      />
    </Flex>
  );
};

export default Menu;
