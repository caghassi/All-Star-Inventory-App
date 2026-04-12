import { getSupabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import { notFound } from "next/navigation";
import Barcode from "@/components/Barcode";
import DrawerTrueUp from "@/components/DrawerTrueUp";
import { DRAWER_COUNT, drawerBarcodeValue } from "@/lib/drawers";

export const dynamic = "force-dynamic";

export default async function DrawerDetailPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const drawerNumber = parseInt(number, 10);

  if (
    Number.isNaN(drawerNumber) ||
    drawerNumber < 1 ||
    drawerNumber > DRAWER_COUNT
  ) {
    notFound();
  }

  const supabase = getSupabase();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("drawer_number", drawerNumber)
    .order("name");

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Failed to load drawer contents: {error.message}
      </div>
    );
  }

  const items = (products as Product[]) ?? [];
  const totalUnits = items.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <a
            href="/drawers"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← All drawers
          </a>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Drawer {drawerNumber}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {items.length} item{items.length === 1 ? "" : "s"} · {totalUnits}{" "}
            unit{totalUnits === 1 ? "" : "s"} total
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
            Drawer Label
          </p>
          <Barcode value={drawerBarcodeValue(drawerNumber)} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          <p>No products assigned to this drawer yet.</p>
          <p className="text-sm mt-2">
            Edit a product and select Drawer {drawerNumber} to add it here.
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Inventory True-Up</h2>
            <p className="text-xs text-gray-600 mt-1">
              Enter the actual count for each item and tap Set. Changes are
              logged with reason "Drawer {drawerNumber} true-up".
            </p>
          </div>
          <ul className="divide-y divide-gray-100">
            {items.map((product) => (
              <li
                key={product.id}
                className="px-4 py-3 flex items-center gap-4 flex-wrap"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                    No img
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <a
                    href={`/products/${product.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline block truncate"
                  >
                    {product.name}
                  </a>
                  <p className="text-xs text-gray-500 font-mono truncate">
                    {product.sku}
                  </p>
                </div>
                <DrawerTrueUp
                  product={product}
                  drawerNumber={drawerNumber}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
