import { SelectQueryBuilder } from "typeorm";
import { ElectricCar } from "../entities/ElectricCar";

type Op = "contains"|"equals"|"startsWith"|"endsWith"|"isEmpty"|"greaterThan"|"lessThan";

export interface QueryInput {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: { field: keyof ElectricCar; dir: "asc"|"desc" }[];
  filters?: { field: keyof ElectricCar; op: Op; value?: string|number }[];
  includeInactive?: boolean;
}

export function applyQuery(qb: SelectQueryBuilder<ElectricCar>, q: QueryInput) {
  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.min(200, Math.max(1, q.pageSize ?? 25));

  if (!q.includeInactive) qb.andWhere("electric_cars.is_active = 1");

  if (q.search?.trim()) {
    qb.andWhere(
      "(electric_cars.Brand LIKE :q OR electric_cars.Model LIKE :q OR electric_cars.PlugType LIKE :q OR electric_cars.BodyStyle LIKE :q)",
      { q: `%${q.search.trim()}%` }
    );
  }

  (q.filters ?? []).forEach((f, i) => {
    const key = `f${i}`;
    const col = `electric_cars.${String(f.field)}`;
    switch (f.op) {
      case "contains":    qb.andWhere(`${col} LIKE :${key}`, { [key]: `%${f.value}%` }); break;
      case "equals":      qb.andWhere(`${col} = :${key}`, { [key]: f.value }); break;
      case "startsWith":  qb.andWhere(`${col} LIKE :${key}`, { [key]: `${f.value}%` }); break;
      case "endsWith":    qb.andWhere(`${col} LIKE :${key}`, { [key]: `%${f.value}` }); break;
      case "isEmpty":     qb.andWhere(`(${col} IS NULL OR ${col} = '')`); break;
      case "greaterThan": qb.andWhere(`${col} > :${key}`, { [key]: f.value }); break;
      case "lessThan":    qb.andWhere(`${col} < :${key}`, { [key]: f.value }); break;
    }
  });

  (q.sort ?? []).forEach(s => {
    qb.addOrderBy(`electric_cars.${String(s.field)}`, s.dir.toUpperCase() as "ASC"|"DESC");
  });

  qb.skip((page - 1) * pageSize).take(pageSize);
  return qb;
}
