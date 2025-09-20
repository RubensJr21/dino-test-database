import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import * as schema from "./schema";

const dbPath = path.resolve(__dirname, "dino.sqlite");

export const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });