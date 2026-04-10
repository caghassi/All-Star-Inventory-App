export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  category?: string;
  quantity: number;
  price: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProductInsert = Omit<Product, "id" | "created_at" | "updated_at">;
export type ProductUpdate = Partial<ProductInsert>;

export interface InventoryLog {
  id: string;
  product_id: string;
  change_amount: number;
  previous_qty: number;
  new_qty: number;
  reason: string | null;
  created_at: string;
}

export interface InventoryLogWithProduct extends InventoryLog {
  product_name: string;
  product_sku: string;
}
