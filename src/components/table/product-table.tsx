'use client';

import React from 'react';
import { Table, TableCaption, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import Image from 'next/image';
import { Product } from '@/types';
import { Link } from 'lucide-react';
import { UpdatePrice, UpdateCost } from './updaters';

export function ProductTable({ products }: { products: Product[] }) {
  const [normalise, setNormalise] = useState(false);
  const groupedProducts = groupProductsByType(products);
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button variant="outline" onClick={() => setNormalise(!normalise)}>
          {normalise ? 'Revert' : 'Normalise'}
        </Button>
      </div>
      <Separator />
      <Table>
        <TableCaption>Products</TableCaption>
        <TableHeader className="bg-background sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-[100px]">Image</TableHead>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Link</TableHead>
            <TableHead className="w-[80px]">GBP Price</TableHead>
            <TableHead className="w-[80px]">USD Price</TableHead>
            <TableHead className="w-[80px]">New USD Price</TableHead>
            <TableHead className="w-[80px]">Margin</TableHead>
            <TableHead className="w-[80px]">Cost</TableHead>
            <TableHead className="w-[80px]">New Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedProducts).map(([type, typeProducts]) => (
            <ProductGroup key={type} type={type} products={typeProducts} normalise={normalise} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ProductRow({ product, normalise }: { product: any; normalise: boolean }) {
  const margin = product.cost ? ((product.price - product.cost) / product.price) * 100 : 0;

  return (
    <TableRow key={product.id}>
      <TableCell>
        <Image src={product.image} alt={product.name} width={50} height={50} className="rounded-md" />
      </TableCell>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell>{product.type}</TableCell>
      <TableCell>
        <Button variant="outline" asChild>
          <a href={`https://admin.shopify.com/store/cornelia-james-ltd/products/${product.id}`} target="_blank" rel="noopener noreferrer">
            <Link className="h-4 w-4" /> View
          </a>
        </Button>
      </TableCell>
      <TableCell>£{Math.round(product.price * 0.745)}</TableCell>
      <TableCell>${Math.round(product.price)}</TableCell>
      <TableCell>
        <UpdatePrice product={product} normalise={normalise} />
      </TableCell>
      <TableCell>{margin.toFixed(0)}%</TableCell>
      <TableCell>${product.cost ? product.cost : '0.00'}</TableCell>
      <TableCell>
        <UpdateCost product={product} />
      </TableCell>
    </TableRow>
  );
}

// Utility function to group products
function groupProductsByType(products: Product[]): { [key: string]: Product[] } {
  return products.reduce(
    (groups, product) => {
      const type = product.type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(product);
      return groups;
    },
    {} as { [key: string]: Product[] }
  );
}

// Component for rendering a product group
function ProductGroup({ type, products, normalise }: { type: string; products: Product[]; normalise: boolean }) {
  return (
    <React.Fragment>
      <TableRow className="bg-muted/30">
        <TableCell colSpan={10} className="text-muted-foreground font-semibold">
          {type} ({products.length} products)
        </TableCell>
      </TableRow>
      {products.map((product) => (
        <ProductRow key={product.id} product={product} normalise={normalise} />
      ))}
    </React.Fragment>
  );
}
