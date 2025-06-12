'use client';

import { useTransition, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { updateCost, updatePrice } from '@/app/actions/update-shopify';
import { toast } from 'sonner';

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
  const currencySymbol = product.type === 'Leather Gloves' || product.type === 'Suede Gloves' ? '€' : '$';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder={currencySymbol} {...field} type="number" min={0} className="bg-card w-[80px]" />
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
