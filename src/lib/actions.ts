"use server";

import { getSupabase } from "./supabase";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Product } from "./types";

export async function createProduct(formData: FormData) {
  const supabase = getSupabase();
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const description = (formData.get("description") as string) || null;
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const price = parseFloat(formData.get("price") as string);
  const imageFile = formData.get("image") as File | null;

  let image_url: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const path = `${sku}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, imageFile);

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(path);
      image_url = publicUrl;
    }
  }

  const { data: product, error } = await supabase
    .from("products")
    .insert({ name, sku, description, quantity, price, image_url })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Log initial stock
  if (quantity > 0 && product) {
    await supabase.from("inventory_log").insert({
      product_id: product.id,
      change_amount: quantity,
      previous_qty: 0,
      new_qty: quantity,
      reason: "Initial stock",
    });
  }

  redirect("/");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = getSupabase();
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const description = (formData.get("description") as string) || null;
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const price = parseFloat(formData.get("price") as string);
  const imageFile = formData.get("image") as File | null;
  const existingImageUrl = formData.get("existing_image_url") as string | null;

  // Fetch current product for inventory logging
  const { data: current } = await supabase
    .from("products")
    .select("quantity")
    .eq("id", id)
    .single();

  let image_url = existingImageUrl;

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const path = `${sku}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, imageFile);

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(path);
      image_url = publicUrl;
    }
  }

  const { error } = await supabase
    .from("products")
    .update({ name, sku, description, quantity, price, image_url })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  // Log quantity change if it changed
  if (current && current.quantity !== quantity) {
    await supabase.from("inventory_log").insert({
      product_id: id,
      change_amount: quantity - current.quantity,
      previous_qty: current.quantity,
      new_qty: quantity,
      reason: "Manual edit",
    });
  }

  redirect("/");
}

export async function deleteProduct(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function adjustQuantity(
  productId: string,
  delta: number,
  reason: string
) {
  const supabase = getSupabase();

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("quantity")
    .eq("id", productId)
    .single();

  if (fetchError || !product) {
    return { error: "Product not found" };
  }

  const newQty = Math.max(0, product.quantity + delta);

  const { error: updateError } = await supabase
    .from("products")
    .update({ quantity: newQty })
    .eq("id", productId);

  if (updateError) {
    return { error: updateError.message };
  }

  await supabase.from("inventory_log").insert({
    product_id: productId,
    change_amount: newQty - product.quantity,
    previous_qty: product.quantity,
    new_qty: newQty,
    reason: reason || "Scan adjustment",
  });

  revalidatePath("/");
  return { success: true, newQty };
}

export async function getProductBySku(
  sku: string
): Promise<Product | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("sku", sku)
    .single();

  if (error || !data) return null;
  return data as Product;
}
