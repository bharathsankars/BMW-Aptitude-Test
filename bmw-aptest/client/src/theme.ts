import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0066b1" }, // BMW Blue
    secondary: { main: "#333333" }, // Dark Grey
    grey: { 100: "#f7f9fc", 200: "#e6e8eb", 300: "#d1d5db" } as any,
    background: { default: "#f8f9fa", paper: "#ffffff" },
    text: { primary: "#1a1a1a", secondary: "#666666" },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: [
      "Inter",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 700, fontSize: "2.5rem" },
    h2: { fontWeight: 600, fontSize: "2rem" },
    h3: { fontWeight: 600, fontSize: "1.75rem" },
    h4: { fontWeight: 600, fontSize: "1.5rem" },
    h5: { fontWeight: 700, fontSize: "1.25rem" },
    h6: { fontWeight: 600, fontSize: "1.125rem" },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.5 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderBottom: "1px solid #e6e8eb",
          backgroundColor: "#ffffff",
          color: "#1a1a1a",
        },
      },
    },
    MuiToolbar: { styleOverrides: { root: { minHeight: 72, paddingLeft: 24, paddingRight: 24 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e6e8eb",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.15)" },
        },
        contained: { boxShadow: "0 2px 8px rgba(0,102,177,0.3)" },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          background: "#fff",
          borderRadius: 8,
          "& .MuiOutlinedInput-root": { borderRadius: 8 },
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 6 } } },
    MuiDivider: { styleOverrides: { root: { borderColor: "#e6e8eb" } } },
    MuiTableCell: { styleOverrides: { root: { borderBottom: "1px solid #e6e8eb" } } },
  },
});
