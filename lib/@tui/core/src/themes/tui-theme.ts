import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface ZIndex {
    tui: {
      superOverlay: number;
    };
  }
}

export {};
