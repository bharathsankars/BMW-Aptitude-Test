//builds the Express app, plugs in middlewares, and defines basic routes.

import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

//  OpenAPI doc
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "BMW Aptitude Test API", version: "1.0.0" }
  },
  apis: [] //  will add routes later
});

export const createApp = () => {
  //  create the Express app instance
  const app = express();

  //  allow cross-origin requests
  app.use(cors());

  //  parse incoming requests as JSON
  app.use(express.json());

  //  log HTTP requests
  app.use(morgan("dev"));

  // health check
  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "bmw-api", version: "1.0.0" });
  });

  //  serve OpenAPI docs
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  return app;
};
