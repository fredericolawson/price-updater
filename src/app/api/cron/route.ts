import { NextResponse } from 'next/server';
import { updateRates } from '@/app/actions/currency';

async function handleRequest() {
  try {
    const count = await updateRates();
    return NextResponse.json({ success: true, updated: count });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  return handleRequest();
}

export async function POST() {
  return handleRequest();
}
