export type ElectricCar = {
  id: number;
  Brand: string;
  Model: string;
  AccelSec: number;
  TopSpeed_KmH: number;
  Range_Km: number;
  Efficiency_WhKm: number;
  FastCharge_KmH: number | null;
  RapidCharge: "Yes" | "No";
  PowerTrain: string;
  PlugType: string;
  BodyStyle: string;
  Segment: string;
  Seats: number;
  PriceEuro: number;
  Date: string;       // YYYY-MM-DD
  is_active: number; 
};
