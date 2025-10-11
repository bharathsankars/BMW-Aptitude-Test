// server/src/utils/fields.ts
export const fieldLiterals = [
  "id","Brand","Model","AccelSec","TopSpeed_KmH","Range_Km","Efficiency_WhKm",
  "FastCharge_KmH","RapidCharge","PowerTrain","PlugType","BodyStyle","Segment",
  "Seats","PriceEuro","Date","is_active",
] as const;

export type Field = typeof fieldLiterals[number];

export type ColumnConfig = {
  field: Field;
  headerName: string;
  type: "text" | "number";
  format?: string; // e.g., "km", "€", "s"
};

export const displayColumns: ColumnConfig[] = [
  { field: "Brand", headerName: "Brand", type: "text" },
  { field: "Model", headerName: "Model", type: "text" },
  { field: "AccelSec", headerName: "0–100 (s)", type: "number", format: "s" },
  { field: "TopSpeed_KmH", headerName: "Top Speed (km/h)", type: "number", format: "km/h" },
  { field: "Range_Km", headerName: "Range (km)", type: "number", format: "km" },
  { field: "Efficiency_WhKm", headerName: "Efficiency (Wh/km)", type: "number", format: "Wh/km" },
  { field: "FastCharge_KmH", headerName: "Fast Charge (km/h)", type: "number", format: "km/h" },
  { field: "RapidCharge", headerName: "RapidCharge", type: "text" },
  { field: "PowerTrain", headerName: "PowerTrain", type: "text" },
  { field: "PlugType", headerName: "PlugType", type: "text" },
  { field: "BodyStyle", headerName: "BodyStyle", type: "text" },
  { field: "Segment", headerName: "Segment", type: "text" },
  { field: "Seats", headerName: "Seats", type: "number" },
  { field: "PriceEuro", headerName: "Price (€)", type: "number", format: "€" },
  { field: "Date", headerName: "Released Date", type: "text" },
];
