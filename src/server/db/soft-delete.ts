import { isNull, and, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/**
 * Adds `AND deleted_at IS NULL` to filter out soft-deleted rows.
 * Usage: db.select().from(users).where(notDeleted(users.deletedAt))
 * Or combine: where(and(notDeleted(users.deletedAt), eq(users.id, 1)))
 */
export function notDeleted(deletedAtCol: PgColumn): SQL {
  return isNull(deletedAtCol);
}

/**
 * Wraps an optional existing condition with soft-delete filter.
 */
export function withSoftDelete(deletedAtCol: PgColumn, condition?: SQL): SQL {
  return condition ? and(notDeleted(deletedAtCol), condition)! : notDeleted(deletedAtCol);
}
