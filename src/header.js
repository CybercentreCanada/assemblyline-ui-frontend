import React from "react";
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
  MenuButton, DarkMode, Divider, Link
} from "@chakra-ui/core";

const Header = props => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuToggle = () => setShowMenu(!showMenu);
  const { colorMode, toggleColorMode } = useColorMode();

  let bgColor, textColor;
  if (colorMode === "dark"){
    bgColor = "gray.600";
    textColor = "gray.200";
  }
  else{
    bgColor = "gray.200";
    textColor = "gray.600"
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
          <DrawerBody overflowY="scroll">
            <label style={{fontSize: "80%"}}><b>Submissions</b></label>
            <Link display="block" py={2} href="/submit.html">Submit files</Link>
            <Link display="block" py={2} href="/submissions.html">View Submissions</Link>
            <Divider/>
            <label style={{fontSize: "80%"}}><b>Alerts</b></label>
            <Link display="block" py={2} href="/alerts.html">View Alerts</Link>
            <Link display="block" py={2} href="/worflows.html">Manage Workflows</Link>
            <Divider/>
            <label style={{fontSize: "80%"}}><b>Signatures</b></label>
            <Link display="block" py={2} href="/signatures.html">Manage signatures</Link>
            <Link display="block" py={2} href="/sources.html">Manage sources</Link>
            <Divider/>
            <label style={{fontSize: "80%"}}><b>Search</b></label>
            <Link display="block" py={2} href="/search.html">All Indexes</Link>
            <Link display="block" py={2} href="/search.html?search_scope=alert">Alert Indexes</Link>
            <Link display="block" py={2} href="/search.html?search_scope=file">File Indexes</Link>
            <Link display="block" py={2} href="/search.html?search_scope=result">result Indexes</Link>
            <Link display="block" py={2} href="/search.html?search_scope=signature">Signature Indexes</Link>
            <Link display="block" py={2} href="/search.html?search_scope=submission">Submission Indexes</Link>
            <Divider/>
            <label style={{fontSize: "80%"}}><b>Help</b></label>
            
            <Divider/>
            <label style={{fontSize: "80%"}}><b>Administration</b></label>
            <Link display="block" py={2} href="/admin/errors.html">Error viewer</Link>
            <Link display="block" py={2} href="/admin/services.html">Services</Link>
            <Link display="block" py={2} href="/admin/site_map.html">Site map</Link>
            <Link display="block" py={2} href="/admin/users.html">Users</Link>
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
          <Flex align="center" mr={{sm: 0, md: 6}}>
            <Heading as="h1" size="lg" letterSpacing={"-.15rem"} color="white">
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
        
          <Menu>
            <MenuButton>
              <Avatar
                height={{sm: "2rem", md: "2.5rem"}}
                width={{sm: "2rem", md: "2.5rem"}}
                backgroundColor="gray.600"
                color="gray.200"
                name="Steve Garon"
                src="https://s.gravatar.com/avatar/d02d91817faa8beb4d272ae2ac708859?s=256"/>
            </MenuButton>
            <MenuList>
              <MenuGroup>
                <MenuItem onClick={() => history.push("/account.html")} display="flex" padding="1rem">
                  <Avatar
                    size="lg"
                    name="Steve Garon"
                    backgroundColor={bgColor}
                    color={textColor}
                    src="https://s.gravatar.com/avatar/d02d91817faa8beb4d272ae2ac708859?s=256"/>
                  <Box pl="0.5rem">
                    <Text fontSize="sm" isTruncated><b>Steve Garon</b></Text>
                    <Text fontSize="xs" isTruncated>Steve.Garon@cyber.gc.ca</Text>
                  </Box>
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
      </Flex>
    </>
  );
};

export default Header;
