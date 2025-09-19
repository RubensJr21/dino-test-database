import config from "@playground/knexfile";
import knex from "knex";

import * as fs from "fs";
import * as path from "path";

export async function create_db() {
	const db = knex(config);
	console.log(config)
	const sql_create = fs.readFileSync(
		path.resolve(__dirname, "../../database/create.sql"),
		"utf8"
	);
	const rows = await db.raw(sql_create);

	console.log("STANDARD:", rows);
	await db.destroy();
};