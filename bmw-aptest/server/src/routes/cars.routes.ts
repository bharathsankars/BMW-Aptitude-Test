import { Router } from "express";
import { postQuery, getById, softDelete, restore, getUniqueValues } from "../controllers/cars.controller";

export const carsRouter = Router();
carsRouter.post("/query", postQuery);
carsRouter.get("/:id", getById);
carsRouter.delete("/:id", softDelete);
carsRouter.patch("/:id/restore", restore);
carsRouter.get("/unique/:field", getUniqueValues);
