import gql from 'graphql-tag';

export const GET_PRODUCT_VARIANTS = gql`
  query getProductVariants($productId: ID!) {
    product(id: $productId) {
      variants(first: 250) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query getProducts($query: String) {
    products(first: 250, sortKey: PRODUCT_TYPE, query: $query) {
      edges {
        node {
          id
          title
          productType
          contextualPricing(context: { country: US }) {
            maxVariantPricing {
              price {
                amount
                currencyCode
              }
            }
          }
          featuredMedia {
            preview {
              image {
                url
              }
            }
          }
        }
      }
    }
  }
`;
