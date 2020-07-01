import React from "react";
import {
  Box,
  Heading,
  Flex,
  Text,
  Avatar,
  useColorMode,
  Divider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
  DrawerFooter,
  Switch
} from "@chakra-ui/core";

const MenuItems = ({ children }) => (
  <Text mt={{ base: 4, md: 0 }} mr={6} display="block" color="white">
    {children}
  </Text>
);

const DrawerItems = ({ children }) => (
  <Text mt={{ base: 4, md: 0 }} mr={6} display="block">
    {children}
  </Text>
);

const Menu = props => {
  const [showMenu, setShowMenu] = React.useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const menuToggle = () => setShowMenu(!showMenu);
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <>
      <Drawer
        isOpen={showMenu}
        placement="left"
        onClose={menuToggle}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Menu
          </DrawerHeader>
          <DrawerBody>
            <DrawerItems>Submit</DrawerItems>
            <DrawerItems>Submissions</DrawerItems>
            <DrawerItems>Alerts</DrawerItems>
            <DrawerItems>Signatures</DrawerItems>
            <DrawerItems>Help</DrawerItems>
          </DrawerBody>
          <DrawerFooter/>
        </DrawerContent>
      </Drawer>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding="0.5rem"
        paddingLeft="1.5rem"
        paddingRight="1.5rem"
        bg="gray.700"
        {...props}>

        <Box display={{ sm: "block", md: "none" }} onClick={menuToggle}>
          <svg
            fill="white"
            width="16px"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg">
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </Box>

        <Flex align="center" mr={{sm: 0, md: 6}}>
          <Heading as="h1" size="lg" letterSpacing={"-.1rem"} color="white">
            Assemblyline
          </Heading>
        </Flex>

        <Avatar
            size="sm"
            display={{ sm: "block", md: "none"  }}
            name="Steve Garon"
            src="https://s.gravatar.com/avatar/15925199802f2e849415dcb146df9085"
            onClick={onOpen}/>

        <Box
          display={{ sm: "none", md: "flex" }}
          width={{ sm: "full", md: "auto" }}
          alignItems="center"
          flexGrow={1}>
          <MenuItems>Submit</MenuItems>
          <MenuItems>Submissions</MenuItems>
          <MenuItems>Alerts</MenuItems>
          <MenuItems>Signatures</MenuItems>
          <MenuItems>Help</MenuItems>
        </Box>
        <Avatar
            display={{ sm: "none", md: "flex" }}
            name="Steve Garon"
            src="https://s.gravatar.com/avatar/15925199802f2e849415dcb146df9085"
            onClick={onOpen} />
      </Flex>

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            Steve Garon
            <Divider />
          </DrawerHeader>
          <DrawerBody>
            <Flex onClick={toggleColorMode}>
              <Text marginRight="1rem">Dark Mode</Text>
              <Switch isChecked={colorMode === "dark"} onChange={toggleColorMode}/>
            </Flex>
          </DrawerBody>
          <DrawerFooter/>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Menu;
