import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Grid,
  Avatar,
} from "@mui/material";
import EvStationIcon from "@mui/icons-material/EvStation";
import EuroIcon from "@mui/icons-material/Euro";
import SpeedIcon from "@mui/icons-material/Speed";
import SettingsIcon from "@mui/icons-material/Settings";
import PowerIcon from "@mui/icons-material/Power";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";
import { getCar } from "../api/cars";
import type { ElectricCar } from "../types/car";

export default function EVDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [car, setCar] = useState<ElectricCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) {
        setError("No car ID provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedCar = await getCar(Number(id));
        setCar(fetchedCar);
      } catch {
        setError("Failed to load car details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleBack = () => navigate(-1);

  if (loading) {
    return (
      <Card elevation={2}>
        <CardContent sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress size={48} thickness={4} />
          <Typography variant="body1" sx={{ mt: 3, color: "text.secondary" }}>
            Loading car details...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error || !car) {
    return (
      <Card elevation={2}>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Alert severity="error" sx={{ mb: 3, maxWidth: 400, mx: "auto" }}>
            {error || "Car not found."}
          </Alert>
          <Button variant="contained" onClick={handleBack} size="large">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const detailItems: { label: string; value: string | number; icon: React.ReactNode }[] = [
    { label: "Range", value: `${car.Range_Km} km`, icon: <EvStationIcon /> },
    { label: "Price", value: `€${car.PriceEuro.toLocaleString()}`, icon: <EuroIcon /> },
    { label: "0–100 km/h", value: `${car.AccelSec} seconds`, icon: <SpeedIcon /> },
    { label: "Powertrain", value: car.PowerTrain, icon: <SettingsIcon /> },
    { label: "Plug Type", value: car.PlugType, icon: <PowerIcon /> },
    { label: "Body Style", value: car.BodyStyle, icon: <SettingsIcon /> },
    { label: "Seats", value: car.Seats, icon: <AirlineSeatReclineNormalIcon /> },
    { label: "Rapid Charge", value: car.RapidCharge, icon: <EvStationIcon /> },
    { label: "Release Date", value: car.Date, icon: <CalendarTodayIcon /> },
  ];

  return (
    <Card elevation={2} sx={{ maxWidth: 1200, mx: "auto", my: 4, border: '1px solid', borderColor: 'grey.300' }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        {/* Header */}
        <Stack
          direction="column"
          alignItems="center"
          sx={{ mb: 4, textAlign: "center" }}
        >
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="flex-start"
            sx={{ width: "100%", mb: 2 }}
          >
            <Button
              variant="outlined"
              onClick={handleBack}
              size="large"
              sx={{ minWidth: 120 }}
            >
              Go Back
            </Button>
          </Stack>

          <Typography
            variant="h3"
            component="h1"
            fontWeight={700}
            sx={{ mb: 0.5, lineHeight: 1.2 }}
          >
            {car.Brand} {car.Model}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontWeight: 400 }}
          >
            Electric Vehicle Details
          </Typography>
        </Stack>

        <Divider sx={{ mb: 4 }} />

        {/* Specifications */}
        <Box>
          <Typography
            variant="h5"
            component="h2"
            fontWeight={600}
            sx={{ mb: 3, color: "text.primary" }}
          >
            Specifications
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              backgroundColor: "grey.50",
              borderColor: "grey.200",
              borderRadius: 2,
            }}
          >
          <Box component="dl" sx={{ m: 0 }}>
            {detailItems.map(({ label, value, icon }) => (
              <Stack
                key={label}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  mb: 2.5,
                  "&:last-child": { mb: 0 },
                  py: 1.5,
                  px: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  backgroundColor: "grey.50",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 140 }}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 28, height: 28 }}>
                    {icon}
                  </Avatar>
                  <Typography
                    variant="subtitle1"
                    component="dt"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    {label}
                  </Typography>
                </Stack>
                <Typography
                  variant="body1"
                  component="dd"
                  fontWeight={600}
                  color="text.primary"
                  sx={{ textAlign: "right" }}
                >
                  {value}
                </Typography>
              </Stack>
            ))}
          </Box>
          </Paper>
        </Box>
      </CardContent>
    </Card>
  );
}
