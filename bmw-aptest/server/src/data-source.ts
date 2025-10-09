import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";
import { ElectricCar } from "./entities/ElectricCar";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  entities: [ElectricCar],     // <-- use our entity
  synchronize: false,           // <-- TEMP enable so TypeORM creates table 
  logging: false,
});
