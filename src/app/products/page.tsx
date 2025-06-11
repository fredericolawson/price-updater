import { GET_PRODUCTS } from '@/lib/graphql/queries';
import { shopifyClient } from '@/lib/shopify-client';
import { ProductTable } from '@/components/product-table';

export default async function ProductsPage() {
  const response: any = await shopifyClient.request(GET_PRODUCTS, {
    query: 'status:ACTIVE AND collection_id:275853803684',
  });

  const processedProducts = processProducts(response.products.edges);

  return <ProductTable products={processedProducts} />;
}

function processProducts(products: any) {
  const mappedProducts = products.map((product: any) => {
    return {
      id: product.node.id.split('/').pop(),
      name: product.node.title.split(' | ')[0],
      type: product.node.productType,
      price: product.node.contextualPricing.maxVariantPricing.price.amount,
      currency: product.node.contextualPricing.maxVariantPricing.price.currencyCode,
    };
  });

  return mappedProducts
    .sort((a: any, b: any) => a.price - b.price)
    .sort((a: any, b: any) => (a.type < b.type ? -1 : a.type > b.type ? 1 : 0));
}
