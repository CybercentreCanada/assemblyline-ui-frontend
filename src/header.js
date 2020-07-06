import React from "react";
import { GrUserAdmin } from "react-icons/gr"
import { useHistory } from "react-router-dom"
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
  MenuButton, DarkMode, Image, Divider, IconButton, Link
} from "@chakra-ui/core";
import Robot from "./robot";

const DrawerItems = ({ children }) => (
  <Text w="100%" mt={{ base: 4, md: 0 }} mr={6} display="block">
    {children}
  </Text>
);

const Header = props => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuToggle = () => setShowMenu(!showMenu);
  const { colorMode, toggleColorMode } = useColorMode();

  let bgColor;
  if (colorMode === "dark"){
    bgColor = "gray.700";
  }
  else{
    bgColor = "gray.700";
  }

  const history = useHistory();

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
            <Link mt={4} mr={6} href="/submit.html">Submit</Link>
            <DrawerItems>Submissions</DrawerItems>
            <DrawerItems>Alerts</DrawerItems>
            <DrawerItems>Signatures</DrawerItems>
            <DrawerItems>Help</DrawerItems>
            <Divider/>
                <DrawerItems onClick={() => history.push("/admin/errors.html")}>Error viewer</DrawerItems>
                <DrawerItems onClick={() => history.push("/admin/services.html")}>Services</DrawerItems>
                <DrawerItems onClick={() => history.push("/admin/site_map.html")}>Site map</DrawerItems>
                <DrawerItems onClick={() => history.push("/admin/users.html")}>Users</DrawerItems>
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
        paddingLeft={{sm: "1.5rem", md: 0}}
        paddingRight="1.5rem"
        backgroundColor={bgColor}
        boxShadow={"lg"}
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
          <Image h={{sm: "2rem", md: "2.5rem"}} className="banner" src="/al-robot_dark.svg" alt="Assemblyline Logo"/>
          <Flex align="center" mr={{sm: 0, md: 6}}>
            <Heading as="h1" size="lg" letterSpacing={"-.1rem"} color="white">
              <a href="/">Assemblyline</a>
            </Heading>
          </Flex>
          <Box
            display={{ sm: "none", md: "flex" }}
            width={{ sm: "full", md: "auto" }}
            alignItems="center"
            flexGrow={5}>

            <Button onClick={() => history.push("/submit.html")} variant="ghost">Submit</Button>
            <Button variant="ghost">Submissions</Button>
            <Button variant="ghost">Alerts</Button>
            <Button variant="ghost">Signatures</Button>
            <Button variant="ghost">Help</Button>
          </Box>
        </DarkMode>
        <Box
          width={{ sm: "full", md: "auto" }}
          alignItems="center"
          flexGrow={1}>

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
                <MenuItem onClick={() => history.push("/account.html")} display="block" padding="1rem 4rem">
                  <Flex justify="center" style={{"marginBottom": "1rem"}}>
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
                <MenuItem onClick={() => history.push("/account.html")}>Manage account</MenuItem>
                <MenuItem onClick={() => history.push("/dashboard.html")}>Dashboard</MenuItem>
                <MenuItem onClick={() => history.push("/settings.html")}>Settings</MenuItem>
                <MenuItem onClick={() => history.push("/logout.html")}>Sign out</MenuItem>
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
                <MenuItem onClick={() => history.push("/admin/errors.html")}>Error viewer</MenuItem>
                <MenuItem onClick={() => history.push("/admin/services.html")}>Services</MenuItem>
                <MenuItem onClick={() => history.push("/admin/site_map.html")}>Site map</MenuItem>
                <MenuItem onClick={() => history.push("/admin/users.html")}>Users</MenuItem>
              </MenuGroup>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </>
  );
};

export default Header;
