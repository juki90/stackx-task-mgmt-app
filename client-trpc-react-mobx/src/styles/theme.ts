import { red, teal } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: { main: teal[400] },
        error: { main: red[600], light: red[400] }
    }
});
