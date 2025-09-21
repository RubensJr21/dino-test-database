import { type DatabaseType } from "@database/db-instance";
import { recurrenceType } from "@database/schema";

type DataInsert = typeof recurrenceType.$inferInsert;
type DataSelect = typeof recurrenceType.$inferSelect;

export async function get_all(db: DatabaseType) {
  return await db.select().from(recurrenceType);
}

export type { DataInsert as infer_insert, DataSelect as infer_select };
