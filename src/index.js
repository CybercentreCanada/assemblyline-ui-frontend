import React from "react";
import ReactDOM from "react-dom";
import {
  theme,
  ThemeProvider,
  CSSReset,
  ColorModeProvider
} from "@chakra-ui/core";

import Body from "./body";
import Header from "./header";

const breakpoints = ["300px", "768px", "1024px", "1440px"];
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
      <Body />
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
