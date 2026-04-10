import { getSupabase, isConfigured } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import BatchPrintClient from "@/components/BatchPrintClient";

export const dynamic = "force-dynamic";

export default async function PrintPage() {
  if (!isConfigured) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
        Supabase not configured.
      </div>
    );
  }

  const supabase = getSupabase();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Batch Print Labels
      </h1>
      <BatchPrintClient products={(products as Product[]) ?? []} />
    </div>
  );
}
