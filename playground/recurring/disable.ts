import * as rec from "@data_functions/recurring";
import { db } from "@database/db-instance";

export async function disable(recurring_id: rec.infer_select["id"]) {
  await rec.disable(db, {
    id: recurring_id,
    end_date: new Date(),
  })
}