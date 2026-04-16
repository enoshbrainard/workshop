import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    primary: {
      main: "#0f3d62",
      dark: "#0a2740",
      light: "#2e628c"
    },
    secondary: {
      main: "#3f6f8c"
    },
    warning: {
      main: "#b7791f"
    },
    background: {
      default: "#edf2f7",
      paper: "#ffffff"
    },
    success: {
      main: "#1f7a5a"
    },
    text: {
      primary: "#142433",
      secondary: "#607080"
    }
  },
  shape: {
    borderRadius: 16
  },
  typography: {
    fontFamily: '"Aptos", "Segoe UI", "Helvetica Neue", sans-serif',
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.03em"
    },
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.03em"
    },
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.03em"
    },
    h5: {
      fontWeight: 700
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
      letterSpacing: "0.01em"
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(20, 36, 51, 0.08)"
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
          minHeight: 44
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 24px 60px rgba(13, 32, 52, 0.08)"
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined"
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: "#ffffff"
        }
      }
    }
  }
});
