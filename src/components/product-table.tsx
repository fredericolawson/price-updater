'use client';

import { Table, TableCaption, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { useTransition, useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormControl, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { updateShopify } from '@/app/actions/update-shopify';
import { toast } from 'sonner';
import { Separator } from './ui/separator';

export function ProductTable({ products }: { products: any }) {
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
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>New Price</TableHead>
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
  return (
    <TableRow key={product.id}>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell>{product.type}</TableCell>
      <TableCell>
        <Button variant="outline" asChild>
          <a href={`https://admin.shopify.com/store/cornelia-james-ltd/products/${product.id}`} target="_blank" rel="noopener noreferrer">
            View
          </a>
        </Button>
      </TableCell>
      <TableCell>
        {product.price} {product.currency}
      </TableCell>
      <TableCell>
        <ProductForm product={product} normalise={normalise} />
      </TableCell>
    </TableRow>
  );
}

export function ProductForm({ product, normalise }: { product: any; normalise: boolean }) {
  const [isPending, startTransition] = useTransition();

  const price = normalise ? Math.round((product.price * 1.3) / 5) * 5 : product.price;

  const formSchema = z.object({
    price: z.string().min(1, {
      message: 'Price must be greater than 0',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: price,
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
      const { productVariants, userErrors } = await updateShopify({
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
                <Input placeholder="10.00" {...field} type="number" min={0} className="bg-card" />
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
