import { Router } from "express";
import { postQuery, getById, softDelete, restore, getUniqueValues, bulkSoftDelete, getColumns } from "../controllers/cars.controller";

export const carsRouter = Router();
carsRouter.post("/query", postQuery);
carsRouter.get("/columns", getColumns);
carsRouter.get("/:id", getById);
carsRouter.delete("/:id", softDelete);
carsRouter.delete("/bulk", bulkSoftDelete);
carsRouter.patch("/:id/restore", restore);
carsRouter.get("/unique/:field", getUniqueValues);
