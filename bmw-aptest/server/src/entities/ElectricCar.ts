import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity({ name: "electric_cars" })
export class ElectricCar {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index() @Column({ length: 64 }) 
  Brand!: string;

  @Index() @Column({ length: 128 }) 
  Model!: string;

  @Column("decimal", { precision: 4, scale: 2 })
  AccelSec!: number;

  @Column({ type: "smallint" })
  TopSpeed_KmH!: number;

  @Column({ type: "smallint" })
  Range_Km!: number;

  @Column({ type: "smallint" })
  Efficiency_WhKm!: number;

  @Column({ type: "smallint", nullable: true })
  FastCharge_KmH!: number | null;

  @Column({ type: "enum", enum: ["Yes", "No"] })
  RapidCharge!: "Yes" | "No";

  @Column({ length: 64 })
  PowerTrain!: string;

  @Column({ length: 64 })
  PlugType!: string;

  @Column({ length: 64 })
  BodyStyle!: string;

  @Column({ type: "char", length: 1 })
  Segment!: string;

  @Column({ type: "tinyint" })
  Seats!: number;

  @Index() @Column({ type: "int" })
  PriceEuro!: number;

  @Column({ type: "date" })
  Date!: string;

  @Column({ type: "tinyint", width: 1, default: 1 })
  is_active!: number;
}
