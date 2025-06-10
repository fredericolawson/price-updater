"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateShopify } from "@/app/actions/update-shopify";
import { toast } from "sonner";

const formSchema = z.object({
  productId: z.string().min(1, {
    message: "Product ID is required",
  }),
  price: z.string().min(1, {
    message: "Price must be greater than 0",
  }),
});

export function UpdateForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "8651893047460",
      price: "100",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const { productVariants, userErrors } = await updateShopify(values);
      if (userErrors.length > 0) {
        console.error(userErrors);
        toast.error("Error updating price");
      } else {
        toast.success("Price updated successfully");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product ID</FormLabel>
              <FormControl>
                <Input placeholder="1234567890" {...field} />
              </FormControl>
              <FormDescription>
                This is the ID of the product you want to update.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input placeholder="10.00" {...field} />
              </FormControl>
              <FormDescription>
                This is the price you want to update the variant to.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update Price"}
        </Button>
      </form>
    </Form>
  );
}
