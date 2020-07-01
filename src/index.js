import React from "react";
import ReactDOM from "react-dom";
import Menu from "./menu";
import {
  theme,
  ThemeProvider,
  CSSReset,
  ColorModeProvider
} from "@chakra-ui/core";
import Body from "./body";

const breakpoints = ["360px", "768px", "1024px", "1440px"];
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
      <Menu />
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
