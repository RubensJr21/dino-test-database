import { type DatabaseType } from "@database/db-instance";
import { category } from "@database/schema";
import { eq } from "drizzle-orm";

type DataInsert = typeof category.$inferInsert;
type DataSelect = typeof category.$inferSelect;

export async function get_all(db: DatabaseType) {
	return await db.select().from(category);
}

export async function get_by_code(db: DatabaseType, code: DataSelect["code"]) {
	return (
		await db.select().from(category).where(eq(category.code, code))
	).shift();
}

export type { DataInsert as infer_insert, DataSelect as infer_select };

