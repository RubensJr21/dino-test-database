import { type DatabaseType } from "@database/db-instance";
import { transferMethod } from "@database/schema";

type DataInsert = typeof transferMethod.$inferInsert;
type DataSelect = typeof transferMethod.$inferSelect;

export async function get_all(db: DatabaseType) {
	return await db.select().from(transferMethod);
}

export type { DataInsert as btt_infer_insert, DataSelect as btt_infer_select };

