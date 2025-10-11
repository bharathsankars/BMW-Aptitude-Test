import { AppDataSource } from "../data-source";
import { ElectricCar } from "../entities/ElectricCar";
import { applyQuery, QueryInput } from "../utils/queryBuilder";

export class CarsService {
  private repo = AppDataSource.getRepository(ElectricCar);

  async query(input: QueryInput) {
    const qb = this.repo.createQueryBuilder("electric_cars");
    applyQuery(qb, input);
    const [rows, total] = await qb.getManyAndCount();
    return { rows, total };
  }

  getById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async softDelete(id: number) {
    const found = await this.repo.findOne({ where: { id, is_active: 1 } });
    if (!found) return false;
    await this.repo.update({ id }, { is_active: 0 });
    return true;
  }

  async restore(id: number) {
    const found = await this.repo.findOne({ where: { id, is_active: 0 } });
    if (!found) return false;
    await this.repo.update({ id }, { is_active: 1 });
    return true;
  }

  async getUniqueValues(field: string) {
    const qb = this.repo.createQueryBuilder("electric_cars");
    qb.select(`DISTINCT electric_cars.${field}`, field)
      .where("electric_cars.is_active = 1")
      .orderBy(field, "ASC");
    const result = await qb.getRawMany();
    return result.map(row => row[field]);
  }

  async bulkSoftDelete(ids: number[]) {
    const found = await this.repo.find({ where: ids.map(id => ({ id, is_active: 1 })) });
    if (found.length !== ids.length) return false; // some not found or inactive
    await this.repo.update(ids, { is_active: 0 });
    return true;
  }
}

export const carsService = new CarsService();
