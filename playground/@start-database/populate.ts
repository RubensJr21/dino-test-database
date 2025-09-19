import config from "@playground/knexfile";
import knex from "knex";

import * as fs from "fs";
import * as path from "path";

export async function populate_system_tables() {
	const db = knex(config);
	const sql_create = fs.readFileSync(
		path.resolve(__dirname, "../../database/system_tables.sql"),
		"utf8"
	);
	const rows = await db.raw(sql_create);

	console.log("STANDARD:", rows);
	await db.destroy();
};