import { getSupabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import { notFound } from "next/navigation";
import Barcode from "@/components/Barcode";
import InventoryAdjuster from "@/components/InventoryAdjuster";
import DeleteButton from "@/components/DeleteButton";
import PrintLabelButton from "@/components/PrintLabelButton";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  const p = product as Product;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
        <div className="flex items-center gap-3">
          <PrintLabelButton product={p} />
          <a
            href={`/products/${p.id}/edit`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Edit
          </a>
          <DeleteButton productId={p.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex gap-6">
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                  No image
                </div>
              )}
              <div className="flex-1 space-y-3">
                <div>
                  <span className="text-sm text-gray-500">SKU</span>
                  <p className="font-mono">{p.sku}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Price</span>
                  <p className="text-lg font-semibold">
                    ${Number(p.price).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Current Stock</span>
                  <p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm ${
                        p.quantity === 0
                          ? "bg-red-100 text-red-700"
                          : p.quantity <= 10
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {p.quantity} units
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Drawer</span>
                  <p>
                    {p.drawer_number ? (
                      <a
                        href={`/drawers/${p.drawer_number}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        Drawer {p.drawer_number}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Not assigned
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            {p.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Description</span>
                <p className="text-gray-700 mt-1">{p.description}</p>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Barcode
            </span>
            <div className="mt-2 max-w-xs">
              <Barcode value={p.sku} />
            </div>
          </div>
        </div>

        <div>
          <InventoryAdjuster
            productId={p.id}
            currentQuantity={p.quantity}
          />
        </div>
      </div>
    </div>
  );
}
