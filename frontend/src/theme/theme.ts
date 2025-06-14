import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0a192f'
    }
  }
}); 

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0a192f'
    }
  }
});
