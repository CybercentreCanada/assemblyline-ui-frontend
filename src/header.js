import React from "react";
import {
  Box,
  Heading,
  Flex,
  Text,
  Avatar,
  useColorMode,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  Switch,
  Menu,
  Button,
  MenuList,
  MenuGroup,
  MenuDivider,
  MenuItem,
  MenuButton, DarkMode
} from "@chakra-ui/core";

const DrawerItems = ({ children }) => (
  <Text mt={{ base: 4, md: 0 }} mr={6} display="block">
    {children}
  </Text>
);

const Header = props => {
  const [showMenu, setShowMenu] = React.useState(false);
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
        backgroundColor="gray.700"
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

        <DarkMode>
          <Flex align="center" mr={{sm: 0, md: 6}}>
            <Heading as="h1" size="lg" letterSpacing={"-.1rem"} color="white">
              Assemblyline
            </Heading>
          </Flex>
          <Box
            display={{ sm: "none", md: "flex" }}
            width={{ sm: "full", md: "auto" }}
            alignItems="center"
            flexGrow={1}>

            <Button variant="ghost">Submit</Button>
            <Button variant="ghost">Submissions</Button>
            <Button variant="ghost">Alerts</Button>
            <Button variant="ghost">Signatures</Button>
            <Button variant="ghost">Help</Button>
          </Box>
        </DarkMode>
        <Menu>
            <MenuButton>
              <Avatar
                size="sm"
                display={{ sm: "block", md: "none"  }}
                name="Steve Garon"
                src="https://s.gravatar.com/avatar/15925199802f2e849415dcb146df9085"/>
              <Avatar
                size="md"
                display={{ sm: "none", md: "block"  }}
                name="Steve Garon"
                src="https://s.gravatar.com/avatar/15925199802f2e849415dcb146df9085"/>
            </MenuButton>
            <MenuList>
              <MenuGroup title="Profile">
                <MenuItem>My Account</MenuItem>
                <MenuItem>Settings</MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Theming">
                <MenuItem onClick={toggleColorMode}>
                  <Text marginRight="1rem">Dark Mode</Text>
                  <Switch isChecked={colorMode === "dark"} onChange={toggleColorMode}/>
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Help">
                <MenuItem>Docs</MenuItem>
                <MenuItem>FAQ</MenuItem>
              </MenuGroup>
            </MenuList>
          </Menu>

      </Flex>
    </>
  );
};

export default Header;
