import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, Route} from "react-router-dom";
import {theme, ThemeProvider, CSSReset, ColorModeProvider, Flex, Box} from "@chakra-ui/core";
import { mode } from "@chakra-ui/theme-tools"

import Header from "./header";
import LoginScreen from "./login"
import Submit from "./submit";

const breakpoints = ["300px", "768px", "992px", "1440px"];
breakpoints.sm = breakpoints[0];
breakpoints.md = breakpoints[1];
breakpoints.lg = breakpoints[2];
breakpoints.xl = breakpoints[3];

const newTheme = {
  ...theme,
  breakpoints
};

function TurnOnColorMode({ children }) {
  return (
    <ThemeProvider theme={newTheme}>
      <ColorModeProvider>{children}</ColorModeProvider>
    </ThemeProvider>
  );
}

function AppData(){
    return (
      <>
        <Header />
        <Flex justify="center" px={{sm: "1rem", md: "0"}} py={{sm: "1rem", md: "2rem"}}>
          <Box maxW={{sm: "95%", md: "750px", lg: "970px", xl: "1350px"}}>
            <Route exact={true} path="/" component={Submit}/>
            <Route path="/submit.html" component={Submit}/>
          </Box>
        </Flex>
      </>
    );
}

function App() {
  const [user, setUser] = useState({});
  useEffect(()=> {
    fetch('/api/whoami').then(res => res.json()).then(data => {
      setUser(data);
    })
  }, []);
  let renderedApp;
  if (Object.keys(user).length === 0 ){
    renderedApp = <AppData/>;
  }
  else{
    renderedApp = <LoginScreen/>;
  }
  return (
    <BrowserRouter>
      <CSSReset />
      {renderedApp}
    </BrowserRouter>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <TurnOnColorMode>
    <App />
  </TurnOnColorMode>,
  rootElement
);
