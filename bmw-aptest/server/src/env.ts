import * as dotenv from "dotenv";
dotenv.config();

function required(name: string, fallback?: string) {
  //pull value from env or use fallback
  const val = process.env[name] ?? fallback;
  if (val === undefined || val === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return val;
}

export const env = {

  PORT: parseInt(required("PORT", "4000"), 10),

  // database connection
  DB_HOST: required("DB_HOST", "127.0.0.1"),
  DB_PORT: parseInt(required("DB_PORT", "3306"), 10),
  DB_USER: required("DB_USER", "bmw"),
  DB_PASS: required("DB_PASS", "bmw"),
  DB_NAME: required("DB_NAME", "bmw"),
};
