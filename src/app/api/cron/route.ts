import { NextResponse } from 'next/server';
import { updateRates } from '@/app/actions/currency';

export async function GET() {
  try {
    const count = await updateRates();
    return NextResponse.json({ success: true, updated: count });
    // return NextResponse.json({ success: true, updated: 'test' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
