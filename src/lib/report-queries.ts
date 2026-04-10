import { getSupabase } from "./supabase";
import type { Product, InventoryLogWithProduct } from "./types";

export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("name");
  return (data as Product[]) ?? [];
}

export async function getInventoryLogs(
  days: number = 30
): Promise<InventoryLogWithProduct[]> {
  const supabase = getSupabase();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("inventory_log")
    .select("*, products(name, sku)")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(500);

  if (!data) return [];

  return data.map((log: Record<string, unknown>) => {
    const product = log.products as { name: string; sku: string } | null;
    return {
      id: log.id as string,
      product_id: log.product_id as string,
      change_amount: log.change_amount as number,
      previous_qty: log.previous_qty as number,
      new_qty: log.new_qty as number,
      reason: log.reason as string | null,
      created_at: log.created_at as string,
      product_name: product?.name ?? "Deleted Product",
      product_sku: product?.sku ?? "N/A",
    };
  });
}

export function computeSummary(products: Product[]) {
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce(
    (sum, p) => sum + p.quantity * Number(p.price),
    0
  );
  return { totalProducts, totalUnits, totalValue };
}

export function computeCategoryBreakdown(products: Product[]) {
  const map = new Map<
    string,
    { category: string; productCount: number; totalUnits: number; totalValue: number }
  >();

  for (const p of products) {
    const cat = p.category || "Uncategorized";
    const existing = map.get(cat) ?? {
      category: cat,
      productCount: 0,
      totalUnits: 0,
      totalValue: 0,
    };
    existing.productCount++;
    existing.totalUnits += p.quantity;
    existing.totalValue += p.quantity * Number(p.price);
    map.set(cat, existing);
  }

  return Array.from(map.values()).sort((a, b) => b.totalValue - a.totalValue);
}
