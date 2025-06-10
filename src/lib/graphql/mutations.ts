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