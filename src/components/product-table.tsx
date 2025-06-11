'use client';

import { Table, TableCaption, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { useTransition, useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormControl, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { updateCost, updatePrice } from '@/app/actions/update-shopify';
import { toast } from 'sonner';
import { Separator } from './ui/separator';
import Image from 'next/image';
import { Product } from '@/types';
import { ExternalLink, Link } from 'lucide-react';

export function ProductTable({ products }: { products: Product[] }) {
  const [normalise, setNormalise] = useState(false);
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
        <TableHeader>
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
          {products.map((product: any) => (
            <ProductRow key={product.id} product={product} normalise={normalise} />
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

export function UpdatePrice({ product, normalise }: { product: any; normalise: boolean }) {
  const [isPending, startTransition] = useTransition();

  const price = normalise ? Math.round((product.price * 1.3) / 5) * 5 : '';

  const formSchema = z.object({
    price: z.string().min(1, {
      message: 'Price must be greater than 0',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: '',
    },
  });

  // Update form when normalise changes
  useEffect(() => {
    form.reset({
      price: price.toString(),
    });
  }, [normalise, price, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const { productVariants, userErrors } = await updatePrice({
        productId: product.id,
        price: values.price,
      });
      if (userErrors.length > 0) {
        console.error(userErrors);
        toast.error('Error updating price');
      } else {
        toast.success('Price updated successfully');
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="$" {...field} type="number" min={0} className="bg-card w-[80px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Updating...' : 'Update Price'}
        </Button>
      </form>
    </Form>
  );
}

export function UpdateCost({ product }: { product: any }) {
  const [isPending, startTransition] = useTransition();

  const formSchema = z.object({
    cost: z.string().min(1, {
      message: 'Cost must be greater than 0',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cost: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const { inventoryItemUpdates, userErrors } = await updateCost({
        productId: product.id,
        cost: values.cost,
      });
      if (userErrors.length > 0) {
        console.error(userErrors);
        toast.error('Error updating cost');
      } else {
        console.log(inventoryItemUpdates);
        toast.success('Cost updated successfully');
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="$" {...field} type="number" min={0} className="bg-card w-[80px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="outline" disabled={isPending}>
          {isPending ? 'Updating...' : 'Update Cost'}
        </Button>
      </form>
    </Form>
  );
}
