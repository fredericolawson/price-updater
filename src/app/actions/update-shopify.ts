"use server";
import { shopifyClient } from '@/lib/shopify-client';
import { UPDATE_VARIANT_PRICE } from '@/lib/graphql/mutations';
import { GET_PRODUCT_VARIANTS } from '@/lib/graphql/queries';

export async function updateShopify({ productId, price }: { productId: string; price: string }) {

	const getVariants = await shopifyClient.request(GET_PRODUCT_VARIANTS, {
		productId: `gid://shopify/Product/${productId}`
	});

	const variants = (getVariants as any).product.variants.edges.map((edge: any) => edge.node);
	const variantsUpdate = variants.map((variant: any) => ({
		id: variant.id,
		price: price
	}));

  
	const data = await shopifyClient.request(UPDATE_VARIANT_PRICE, {
    productId: `gid://shopify/Product/${productId}`,
    variants: variantsUpdate
  });

	const { productVariants, userErrors } = (data as any).productVariantsBulkUpdate;

	return { productVariants, userErrors };
}
