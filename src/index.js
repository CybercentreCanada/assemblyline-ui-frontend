import React from "react";
import ReactDOM from "react-dom";
import {
    theme,
    ThemeProvider,
    CSSReset,
    ColorModeProvider, Flex, Box, Heading, Text
} from "@chakra-ui/core";

import Submit from "./submit";
import Header from "./header";

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

function App() {
  return (
    <div>
      <CSSReset />
      <Header />
      <Flex justify="center" px={{sm: "1rem", md: "0"}} py={{sm: "1rem", md: "2rem"}}>
          <Box maxW={{sm: "95%", md: "750px", lg: "970px", xl: "1350px"}}>
            <Submit />
          </Box>
        </Flex>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <TurnOnColorMode>
    <App />
  </TurnOnColorMode>,
  rootElement
);
