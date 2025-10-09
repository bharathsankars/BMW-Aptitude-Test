import { Request, Response } from "express";
import { carsService } from "../services/cars.service";
import { querySchema } from "../validators/query";

export async function postQuery(req: Request, res: Response) {
  const parsed = querySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  const data = await carsService.query(parsed.data);
  res.json(data);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Bad id" });
  const car = await carsService.getById(id);
  if (!car) return res.status(404).json({ error: "Not found" });
  res.json(car);
}

export async function softDelete(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Bad id" });
  const ok = await carsService.softDelete(id);
  if (!ok) return res.status(404).json({ error: "Not found or already inactive" });
  res.status(204).end();
}

export async function restore(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Bad id" });
  const ok = await carsService.restore(id);
  if (!ok) return res.status(404).json({ error: "Not found or already active" });
  res.status(204).end();
}

export async function getUniqueValues(req: Request, res: Response) {
  const field = req.params.field;
  if (!field) return res.status(400).json({ error: "Field parameter required" });
  try {
    const values = await carsService.getUniqueValues(field);
    res.json(values);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch unique values" });
  }
}
