import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Tagged-template SQL client. Usage:
//   const rows = await sql`select * from leads where status = ${status}`;
let cached: NeonQueryFunction<false, false> | null = null;

export function sql(): NeonQueryFunction<false, false> {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  cached = neon(url);
  return cached;
}

// Convenience for places that want to call it like a tagged template without
// re-calling `sql()` every time.
export const db: NeonQueryFunction<false, false> = new Proxy(
  (() => {}) as unknown as NeonQueryFunction<false, false>,
  {
    apply(_t, _this, args: unknown[]) {
      // @ts-expect-error - passthrough to the neon tagged template
      return sql()(...args);
    },
    get(_t, prop) {
      const client = sql() as unknown as Record<string | symbol, unknown>;
      return client[prop];
    },
  }
);
