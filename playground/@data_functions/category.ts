import { type DatabaseType } from "@database/db-instance";
import { category } from "@database/schema";

export async function get_all(db: DatabaseType) {
  return await db.select().from(category)
}