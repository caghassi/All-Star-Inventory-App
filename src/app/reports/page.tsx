import { isConfigured } from "@/lib/supabase";
import { getProducts, getInventoryLogs } from "@/lib/report-queries";
import ReportsTabs from "@/components/ReportsTabs";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  if (!isConfigured) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
        Supabase not configured.
      </div>
    );
  }

  const [products, inventoryLogs] = await Promise.all([
    getProducts(),
    getInventoryLogs(90),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Reports & Analytics
      </h1>
      <ReportsTabs products={products} inventoryLogs={inventoryLogs} />
    </div>
  );
}
