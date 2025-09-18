import dotenv from "dotenv";
import type { Knex } from "knex";

dotenv.config({ path: ".env.local" });

const config: Knex.Config = {
	client: "pg",
	connection: process.env.DB_URL,
};

export default config;
