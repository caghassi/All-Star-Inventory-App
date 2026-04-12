import { getSupabase, isConfigured } from "@/lib/supabase";
import Barcode from "@/components/Barcode";
import { DRAWER_COUNT, drawerBarcodeValue } from "@/lib/drawers";

export const dynamic = "force-dynamic";

export default async function DrawersPage() {
  if (!isConfigured) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
        Supabase not configured.
      </div>
    );
  }

  const supabase = getSupabase();
  const { data: products, error } = await supabase
    .from("products")
    .select("drawer_number, quantity");

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Failed to load drawers: {error.message}
      </div>
    );
  }

  // Aggregate counts per drawer
  const stats = new Map<number, { productCount: number; totalUnits: number }>();
  for (let i = 1; i <= DRAWER_COUNT; i++) {
    stats.set(i, { productCount: 0, totalUnits: 0 });
  }
  for (const row of (products ?? []) as Array<{
    drawer_number: number | null;
    quantity: number;
  }>) {
    if (row.drawer_number && stats.has(row.drawer_number)) {
      const s = stats.get(row.drawer_number)!;
      s.productCount += 1;
      s.totalUnits += row.quantity;
    }
  }

  const drawers = Array.from({ length: DRAWER_COUNT }, (_, i) => i + 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Drawers</h1>
        <p className="text-sm text-gray-600 mt-1">
          Print these barcode labels and stick them on each drawer. Scan a
          drawer label to see its contents and perform an inventory true-up.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {drawers.map((n) => {
          const s = stats.get(n)!;
          return (
            <a
              key={n}
              href={`/drawers/${n}`}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all bg-white"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Drawer {n}
                </h2>
                <span className="text-xs text-gray-500">
                  {s.productCount} item{s.productCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {s.totalUnits} unit{s.totalUnits === 1 ? "" : "s"} total
              </div>
              <div className="bg-gray-50 rounded p-2">
                <Barcode value={drawerBarcodeValue(n)} />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
