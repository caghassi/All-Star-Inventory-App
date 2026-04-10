export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  quantity: number;
  price: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProductInsert = Omit<Product, "id" | "created_at" | "updated_at">;
export type ProductUpdate = Partial<ProductInsert>;
