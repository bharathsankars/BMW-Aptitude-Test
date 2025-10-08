// server/src/validators/query.ts
import { z } from "zod";
import { fieldLiterals, type Field } from "../utils/fields";

const fieldEnum = z.enum(fieldLiterals);

export const querySchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(200).optional(),
  search: z.string().optional(),
  includeInactive: z.boolean().optional(),
  sort: z
    .array(z.object({
      field: fieldEnum,
      dir: z.enum(["asc","desc"])
    }))
    .optional(),
  filters: z
    .array(z.object({
      field: fieldEnum,
      op: z.enum(["contains","equals","startsWith","endsWith","isEmpty","greaterThan","lessThan"]),
      value: z.union([z.string(), z.number()]).optional()
    }))
    .optional()
});
