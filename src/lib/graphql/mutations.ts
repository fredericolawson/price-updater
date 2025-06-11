import gql from 'graphql-tag';

export const UPDATE_VARIANT_PRICE = gql`
  mutation UpdateVariantPrice($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants {
        id
        price
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_INVENTORY_ITEM_COST = gql`
  mutation UpdateInventoryItemCost($id: ID!, $input: InventoryItemInput!) {
    inventoryItemUpdate(id: $id, input: $input) {
      inventoryItem {
        id
        unitCost {
          amount
          currencyCode
        }
        updatedAt
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

// Function to create a bulk inventory cost update mutation with aliased calls
export function createBulkInventoryCostUpdate(items: Array<{ id: string; cost: string }>) {
  const mutationFields = items
    .map((item, index) => {
      return `
    item${index + 1}: inventoryItemUpdate(
      id: "${item.id}",
      input: { cost: "${item.cost}" }
    ) {
      inventoryItem {
        id
        unitCost {
          amount
          currencyCode
        }
        updatedAt
      }
      userErrors {
        field
        message
      }
    }`;
    })
    .join('\n');

  return gql`
    mutation BulkInventoryCostUpdate {
      ${mutationFields}
    }
  `;
}
