import { createClient } from "@supabase/supabase-js";

const requiredEnv = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const productIds = {
  starter: requiredEnv("POLAR_PRODUCT_ID_STARTER"),
  pro: requiredEnv("POLAR_PRODUCT_ID_PRO"),
  creator_plus: requiredEnv("POLAR_PRODUCT_ID_CREATOR_PLUS"),
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
for (const [slug, productId] of Object.entries(productIds)) {
  if (!uuidPattern.test(productId)) {
    throw new Error(`Invalid Polar product ID for ${slug}`);
  }
}

const supabase = createClient(
  requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

for (const [slug, polarProductId] of Object.entries(productIds)) {
  const { data, error } = await supabase
    .from("subscription_plans")
    .update({ polar_product_id: polarProductId, updated_at: new Date().toISOString() })
    .eq("slug", slug)
    .select("slug,polar_product_id")
    .single();

  if (error) throw new Error(`Could not synchronize ${slug}: ${error.message}`);
  if (data.polar_product_id !== polarProductId) throw new Error(`Verification failed for ${slug}`);
  console.log(`Synchronized Polar product for ${slug}`);
}
