"use server";

import { getSupabase } from "./supabase";
import { redirect } from "next/navigation";

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

  const { error } = await supabase.from("products").insert({
    name,
    sku,
    description,
    quantity,
    price,
    image_url,
  });

  if (error) {
    return { error: error.message };
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
