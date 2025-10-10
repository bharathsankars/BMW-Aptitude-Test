// app routes + top bar
import { AppBar, Toolbar, Typography, Container, Box, Divider } from "@mui/material";
import { Routes, Route, Link } from "react-router-dom";
import EVGridPage from "./pages/EVGridPage";
import EVDetailPage from "./pages/EVDetailPage";

export default function App() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              color: "primary.main",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "1.25rem",
              letterSpacing: "-0.025em",
            }}
          >
            BMW • Electric Cars
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ flex: 1, py: 4 }}>
        <Routes>
          <Route path="/" element={<EVGridPage />} />
          <Route path="/detail/:id" element={<EVDetailPage />} />
        </Routes>
      </Container>

      <Divider />
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          backgroundColor: "background.paper",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © 2023 BMW Group. All rights reserved. | Electric Vehicle Data Platform
        </Typography>
      </Box>
    </Box>
  );
}
