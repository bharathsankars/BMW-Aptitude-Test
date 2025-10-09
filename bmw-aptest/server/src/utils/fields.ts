// server/src/utils/fields.ts
export const fieldLiterals = [
  "id","Brand","Model","AccelSec","TopSpeed_KmH","Range_Km","Efficiency_WhKm",
  "FastCharge_KmH","RapidCharge","PowerTrain","PlugType","BodyStyle","Segment",
  "Seats","PriceEuro","Date","is_active",
] as const;

export type Field = typeof fieldLiterals[number];
