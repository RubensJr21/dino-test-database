/*
-- ======================
-- TABELA: standard
-- OBS:
--   > As seguintes tabelas precisam ter dados:
--     - transaction_instrument 
--     - category
-- ======================
*/

import config from "@playground/knexfile";
import knex from "knex";

(
  async () => {
    const db = knex(config);
    const rows = await db("standard as s")
      .join("item_value as iv", "s.fk_id_item_value", "iv.id")
      .select("s.id", "iv.scheduled_at", "iv.amount")
      .limit(5);

    console.log("STANDARD:", rows);
    await db.destroy()
  }
)();