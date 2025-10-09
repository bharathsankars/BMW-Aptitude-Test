import { Typography, Paper, Stack, Divider, Box } from "@mui/material";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";
import GenericDataGrid from "../components/GenericDataGrid";

export default function EVGridPage() {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2}}>
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
        <ElectricCarIcon sx={{ fontSize: 40, color: "primary.main" }} />
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Electric Vehicles Catalog
          </Typography>
        </Box>
      </Stack>
      <Divider sx={{ my: 3 }} />
      <GenericDataGrid />
    </Paper>
  );
}
