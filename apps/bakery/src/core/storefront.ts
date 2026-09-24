import { createSupabaseBrowserClient } from "tupiniquim-database";
import type { CartItem } from "../business/types";
import { products } from "../business/products";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

const client = url && publishableKey
  ? createSupabaseBrowserClient({ url, publishableKey, authStorageKey: "tupiniquim-bakery-auth" })
  : null;

function mapCartItem(item: CartItem) {
  const product = products.find((p) => p.id === item.productId);
  if (!product) throw new Error(`Produto desconhecido no carrinho: ${item.productId}`);

  const options = item.variations.map((selected) => {
    const group = product.variations?.find((variation) => variation.name === selected.name);
    const value = group?.options.find((option) => option.label === selected.label);
    if (!group || !value) throw new Error(`Variação inválida para ${product.slug}`);
    return { group_id: group.id, value_id: value.id };
  });

  const extras = item.extras.map((selected) => {
    const extra = product.extras?.find((candidate) => candidate.name === selected.name);
    if (!extra) throw new Error(`Extra inválido para ${product.slug}`);
    return { id: extra.id };
  });

  return { slug: product.slug, quantity: item.qty, options, extras };
}

export interface StorefrontCheckoutInput {
  tenantSlug: string;
  items: CartItem[];
  customer: Record<string, unknown>;
  fulfillment: Record<string, unknown>;
  fulfillmentType: "delivery" | "pickup";
  notes?: string;
  idempotencyKey: string;
}

export interface StorefrontCheckoutResult {
  id: string;
  order_number: number;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  replayed: boolean;
}

export async function submitStorefrontOrder(input: StorefrontCheckoutInput): Promise<StorefrontCheckoutResult> {
  if (!client) {
    throw new Error("Checkout online indisponível: configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.");
  }

  const { data, error } = await client.rpc("create_storefront_order", {
    p_tenant_slug: input.tenantSlug,
    p_items: input.items.map(mapCartItem),
    p_customer: input.customer,
    p_fulfillment: input.fulfillment,
    p_fulfillment_type: input.fulfillmentType,
    p_idempotency_key: input.idempotencyKey,
    p_notes: input.notes ?? null,
  });

  if (error) throw new Error(`Não foi possível registrar o pedido: ${error.message}`);
  return data as StorefrontCheckoutResult;
}
