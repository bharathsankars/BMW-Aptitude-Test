import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { carsRouter } from "./routes/cars.routes";

const swaggerSpec = swaggerJSDoc({
  definition: { openapi: "3.0.0", info: { title: "BMW Aptitude Test API", version: "1.0.0" } },
  apis: []
});

export const createApp = () => {
  const app = express();

  app.use(cors({
    origin: true,
    methods: ["GET","POST","DELETE","PATCH","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"],
  }));
  app.use(express.json());            
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ ok: true, service: "bmw-api", version: "1.0.0" }));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/api/cars", carsRouter);    

  return app;
};
