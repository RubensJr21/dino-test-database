import { create_db } from "./create";
import { populate_system_tables } from "./populate";

(
  async () => {
    await create_db()
    await populate_system_tables()
  }
)()
