// reads CSV -> cleans values -> inserts in batches
import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import { AppDataSource } from "../data-source";
import { ElectricCar } from "../entities/ElectricCar";

const CSV_PATH = path.resolve(__dirname, "../../data/ElectricCarData.csv");

// mm/dd/yy -> YYYY-MM-DD
const toISO = (mdy: string) => {
  if (!mdy) return "1970-01-01";
  const [m, d, y] = mdy.split("/").map(Number);
  const Y = y < 100 ? 2000 + y : y;
  const dt = new Date(Y, (m || 1) - 1, d || 1);
  return dt.toISOString().slice(0, 10);
};

const toIntOrNull = (v: any) => {
  const t = String(v ?? "").trim();
  if (!t) return null;
  const n = Number(t.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

const toNum = (v: any) => {
  const t = String(v ?? "").trim();
  const n = Number(t.replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(n)) throw new Error(`Bad number: ${v}`);
  return n;
};

async function main() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(ElectricCar);

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV not found at ${CSV_PATH}. Put it there and retry.`);
  }

  const parser = fs.createReadStream(CSV_PATH).pipe(parse({ columns: true, trim: true }));
  const batch: ElectricCar[] = [];
  const BATCH = 200;

  for await (const r of parser) {
    batch.push(
      repo.create({
        Brand: String(r.Brand || "").trim(),
        Model: String(r.Model || "").trim(),
        AccelSec: toNum(r.AccelSec),
        TopSpeed_KmH: toIntOrNull(r.TopSpeed_KmH) ?? 0,
        Range_Km: toIntOrNull(r.Range_Km) ?? 0,
        Efficiency_WhKm: toIntOrNull(r.Efficiency_WhKm) ?? 0,
        FastCharge_KmH: toIntOrNull(r.FastCharge_KmH),
        RapidCharge: (String(r.RapidCharge || "No").trim() === "Yes" ? "Yes" : "No") as "Yes" | "No",
        PowerTrain: String(r.PowerTrain || "").trim(),
        PlugType: String(r.PlugType || "").trim(),
        BodyStyle: String(r.BodyStyle || "").trim(),
        Segment: String(r.Segment || "A").trim().slice(0,1),
        Seats: toIntOrNull(r.Seats) ?? 0,
        PriceEuro: toIntOrNull(r.PriceEuro) ?? 0,
        Date: toISO(String(r.Date || "")),
        is_active: 1
      })
    );
    if (batch.length >= BATCH) { await repo.save(batch); batch.length = 0; }
  }
  if (batch.length) await repo.save(batch);

  console.log("✅ Seeding complete.");
  await AppDataSource.destroy();
}

main().catch(e => { console.error("❌ Seed failed:", e); process.exit(1); });
