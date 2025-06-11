'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Update rates from Fixer API
export async function updateRates() {
  const response = await fetch(`https://api.fixer.io/latest?access_key=${process.env.FIXER_API_KEY}&base=USD`);
  const data = await response.json();

  if (!data.success) throw new Error('Failed to fetch rates');

  const rates = Object.entries(data.rates).map(([currency, rate]) => ({
    currency_code: currency,
    usd_rate: rate,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('exchange_rates').upsert(rates, { onConflict: 'currency_code' });

  if (error) throw error;
  return rates.length;
}

// Convert USD to other currency
export async function convertFromUSD({ usdAmount, toCurrency }: { usdAmount: number; toCurrency: string }) {
  try {
    const { data } = await supabase.from('exchange_rates').select('usd_rate').eq('currency_code', toCurrency.toUpperCase()).single();

    const result = usdAmount * data?.usd_rate;
    return { success: true, result: Math.round(result * 100) / 100 };
  } catch (error) {
    return { success: false, error: 'Currency not found' };
  }
}

// Convert other currency to USD
export async function convertToUSD({ amount, fromCurrency }: { amount: number; fromCurrency: string }) {
  try {
    const { data } = await supabase.from('exchange_rates').select('usd_rate').eq('currency_code', fromCurrency.toUpperCase()).single();

    const result = amount / data?.usd_rate;
    return { success: true, result: Math.round(result * 100) / 100 };
  } catch (error) {
    return { success: false, error: 'Currency not found' };
  }
}
