// must match backend's whitelist
export const allowedFields = [
  "id","Brand","Model","AccelSec","TopSpeed_KmH","Range_Km","Efficiency_WhKm",
  "FastCharge_KmH","RapidCharge","PowerTrain","PlugType","BodyStyle","Segment",
  "Seats","PriceEuro","Date","is_active"
] as const;

export type Field = typeof allowedFields[number];

export type ColumnConfig = {
  field: Field;
  headerName: string;
  type: "text" | "number";
  format?: string;
};

export type QueryInput = {
  page?: number;
  pageSize?: number;
  search?: string;
  includeInactive?: boolean;
  sort?: { field: Field; dir: "asc" | "desc" }[];
  filters?: { field: Field; op: "contains" | "equals" | "startsWith" | "endsWith" | "isEmpty" | "greaterThan" | "lessThan"; value?: string | number; }[];
};

export type QueryResult<T> = { rows: T[]; total: number };
