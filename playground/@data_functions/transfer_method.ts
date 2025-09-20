import { type DatabaseType } from "@database/db-instance";
import { transferMethod } from "@database/schema";

export async function get_all(db: DatabaseType) {
  return await db.select().from(transferMethod)
}