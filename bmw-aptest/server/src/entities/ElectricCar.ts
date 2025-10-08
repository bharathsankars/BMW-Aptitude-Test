// one table: electric_cars — matches the CSV + a soft-delete flag.

import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity({ name: "electric_cars" })
export class ElectricCar {
  @PrimaryGeneratedColumn()               // numeric id
  id!: number;

  @Index() @Column({ length: 64 })        // fast Brand lookups
  Brand!: string;

  @Index() @Column({ length: 128 })       // fast Model lookups
  Model!: string;

  @Column("decimal", { precision: 4, scale: 2 })  // e.g., 6.20
  AccelSec!: number;

  @Column({ type: "smallint" })
  TopSpeed_KmH!: number;

  @Column({ type: "smallint" })
  Range_Km!: number;

  @Column({ type: "smallint" })
  Efficiency_WhKm!: number;

  @Column({ type: "smallint", nullable: true })   // sometimes empty in CSV
  FastCharge_KmH!: number | null;

  @Column({ type: "enum", enum: ["Yes", "No"] })  // boolean-ish in CSV
  RapidCharge!: "Yes" | "No";

  @Column({ length: 64 })               // AWD/FWD/RWD (keep string for now)
  PowerTrain!: string;

  @Column({ length: 64 })
  PlugType!: string;

  @Column({ length: 64 })
  BodyStyle!: string;

  @Column({ type: "char", length: 1 })  // A/B/C/D…
  Segment!: string;

  @Column({ type: "tinyint" })
  Seats!: number;

  @Index() @Column({ type: "int" })     // common sort/filter
  PriceEuro!: number;

  @Column({ type: "date" })             // parsed from mm/dd/yy
  Date!: string;

  @Column({ type: "tinyint", width: 1, default: 1 }) // soft-delete flag
  is_active!: number;                   // 1 = active, 0 = inactive
}
