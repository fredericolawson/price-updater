'use server';
import { shopifyClient } from '@/lib/shopify-client';
import { createBulkInventoryCostUpdate, UPDATE_INVENTORY_ITEM_COST, UPDATE_VARIANT_PRICE } from '@/lib/graphql/mutations';
import { GET_PRODUCT_VARIANTS } from '@/lib/graphql/queries';
import { revalidatePath } from 'next/cache';

export async function updatePrice({ productId, price }: { productId: string; price: string }) {
  const variants = await getVariants(productId);
  const variantsUpdate = variants.map((variant: any) => ({
    id: variant.id,
    price: price,
  }));

  const data = await shopifyClient.request(UPDATE_VARIANT_PRICE, {
    productId: `gid://shopify/Product/${productId}`,
    variants: variantsUpdate,
  });
  revalidatePath('/');

  const { productVariants, userErrors } = (data as any).productVariantsBulkUpdate;

  return { productVariants, userErrors };
}

// ------------------------------------------------------------

export async function updateCost({ productId, cost }: { productId: string; cost: string }) {
  console.log('updateCost', productId, cost);
  const variants = await getVariants(productId);
  const inventoryItems = variants.map((variant: any) => ({
    id: variant.inventoryItem.id,
    cost: cost,
  }));

  const data = await shopifyClient.request(createBulkInventoryCostUpdate(inventoryItems));
  revalidatePath('/');

  // Handle the aliased response structure (item1, item2, etc.)
  const results = Object.values(data as any);
  const inventoryItemUpdates = results.map((result: any) => result.inventoryItem).filter(Boolean);
  const allUserErrors = results.flatMap((result: any) => result.userErrors || []);

  return {
    inventoryItemUpdates,
    userErrors: allUserErrors,
  };
}

// ------------------------------------------------------------

async function getVariants(productId: string) {
  const getVariants = await shopifyClient.request(GET_PRODUCT_VARIANTS, {
    productId: `gid://shopify/Product/${productId}`,
  });

  const variants = (getVariants as any).product.variants.edges.map((edge: any) => edge.node);
  return variants;
}
