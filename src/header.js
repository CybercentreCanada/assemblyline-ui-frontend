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
  MenuButton, DarkMode,
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
            <DrawerItems><a href="submit.html">Submit</a></DrawerItems>
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
        padding="0.4rem"
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
              <a href="/">Assemblyline</a>
            </Heading>
          </Flex>
          <Box
            display={{ sm: "none", md: "flex" }}
            width={{ sm: "full", md: "auto" }}
            alignItems="center"
            flexGrow={1}>

            <Button as="a" href="/submit.html" variant="ghost">Submit</Button>
            <Button variant="ghost">Submissions</Button>
            <Button variant="ghost">Alerts</Button>
            <Button variant="ghost">Signatures</Button>
            <Button variant="ghost">Help</Button>
          </Box>
        </DarkMode>
        <Menu>
            <MenuButton>
              <Avatar
                height={{sm: "2rem", md: "2.5rem"}}
                width={{sm: "2rem", md: "2.5rem"}}
                name="Steve Garon"
                src="https://s.gravatar.com/avatar/15925199802f2e849415dcb146df9085"/>
            </MenuButton>
            <MenuList>
              <MenuGroup>
                <MenuItem as="a" href="/account.html" display="block" padding="1rem 4rem">
                  <Flex justify="center" style={{"margin-bottom": "1rem"}}>
                      <Avatar
                        size="xl"
                        name="Steve Garon"
                        src="https://s.gravatar.com/avatar/15925199802f2e849415dcb146df9085"/>
                  </Flex>
                  <Text textAlign="center"><b>Steve Garon</b></Text>
                  <Text textAlign="center" fontSize="sm">steve.garon@gmail.com</Text>
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Profile">
                <MenuItem as="a" href="/account.html">Manage account</MenuItem>
                <MenuItem as="a" href="/dashboard.html">Dashboard</MenuItem>
                <MenuItem as="a" href="/settings.html">Settings</MenuItem>
                <MenuItem as="a" href="/logout.html">Sign out</MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Theming">
                <MenuItem onClick={toggleColorMode}>
                  <Text marginRight="1rem">Dark Mode</Text>
                  <Switch isChecked={colorMode === "dark"} onChange={toggleColorMode}/>
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Administration">
                <MenuItem as="a" href="/admin/errors.html">Error viewer</MenuItem>
                <MenuItem as="a" href="/admin/services.html">Services</MenuItem>
                <MenuItem as="a" href="/admin/site_map.html">Site map</MenuItem>
                <MenuItem as="a" href="/admin/users.html">Users</MenuItem>
              </MenuGroup>
            </MenuList>
          </Menu>

      </Flex>
    </>
  );
};

export default Header;
