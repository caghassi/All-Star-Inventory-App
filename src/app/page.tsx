import { getSupabase, isConfigured } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import ProductList from "@/components/ProductList";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!isConfigured) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
        <h2 className="font-semibold text-lg mb-2">Supabase not configured</h2>
        <p className="text-sm">
          Copy <code className="bg-yellow-100 px-1 rounded">.env.local.example</code> to{" "}
          <code className="bg-yellow-100 px-1 rounded">.env.local</code> and add your Supabase
          project URL and anon key, then restart the dev server.
        </p>
      </div>
    );
  }

  const supabase = getSupabase();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Failed to load products: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500 mt-1">
          {(products as Product[]).length} product
          {(products as Product[]).length !== 1 ? "s" : ""} in inventory
        </p>
      </div>
      <ProductList products={products as Product[]} />
    </div>
  );
}
