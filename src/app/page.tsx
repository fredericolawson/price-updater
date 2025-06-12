import { GET_PRODUCTS } from '@/lib/graphql/queries';
import { shopifyClient } from '@/lib/shopify-client';
import { ProductTable } from '@/components/table/product-table';
import { Product } from '@/types';
import { convertFromUSD, convertToUSD } from './actions/currency';

export default async function ProductsPage() {
  const query = 'status:ACTIVE AND collection_id:275853803684';
  const response: any = await shopifyClient.request(GET_PRODUCTS, { query });

  const processedProducts = await processProducts(response.products.edges);
  const sortedProducts = sortProducts(processedProducts);

  return <ProductTable products={sortedProducts} />;
}

async function processProducts(products: any) {
  const mappedProducts = products.map(async (rawProduct: any) => {
    const product = {
      id: rawProduct.node.id.split('/').pop(),
      name: rawProduct.node.title.split(' | ')[0],
      type: rawProduct.node.productType,
      price: rawProduct.node.contextualPricing.maxVariantPricing.price.amount,
      priceGbp: 0,
      currency: rawProduct.node.contextualPricing.maxVariantPricing.price.currencyCode,
      image: rawProduct.node.featuredMedia.preview.image.url,
      cost: rawProduct.node.variants.nodes[0].inventoryItem.unitCost?.amount,
    };
    const { result: priceGbp } = await convertFromUSD({ usdAmount: product.price, toCurrency: 'GBP' });
    product.priceGbp = priceGbp || 0;
    product.cost = await getCost(product);
    return product as Product;
  });

  return Promise.all(mappedProducts);
}

async function getCost(product: Product) {
  if (!product.cost) return 0;
  if (product.type !== 'Leather Gloves' && product.type !== 'Suede Gloves') return product.cost;

  const { result } = await convertToUSD({ amount: product.cost, fromCurrency: 'EUR' });
  return result;
}

function sortProducts(products: Product[]) {
  return products.sort((a: any, b: any) => a.price - b.price).sort((a: any, b: any) => (a.type < b.type ? -1 : a.type > b.type ? 1 : 0));
}
