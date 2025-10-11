import { http } from "./http";
import type { QueryInput, QueryResult, ColumnConfig } from "../types/query";
import type { ElectricCar } from "../types/car";

export async function queryCars(input: QueryInput): Promise<QueryResult<ElectricCar>> {
  const res = await http.post("/api/cars/query", input);
  return res.data;
}

export async function getCar(id: number): Promise<ElectricCar> {
  const res = await http.get(`/api/cars/${id}`);
  return res.data;
}

export async function deleteCar(id: number): Promise<void> {
  await http.delete(`/api/cars/${id}`);
}

export async function restoreCar(id: number): Promise<void> {
  await http.patch(`/api/cars/${id}/restore`, {});
}

export async function getUniqueValues(field: string): Promise<string[]> {
  const res = await http.get(`/api/cars/unique/${field}`);
  return res.data;
}

export async function bulkDelete(ids: number[]): Promise<void> {
  await http.delete("/api/cars/bulk", { data: { ids } });
}

export async function getColumns(): Promise<ColumnConfig[]> {
  const res = await http.get("/api/cars/columns");
  return res.data;
}
