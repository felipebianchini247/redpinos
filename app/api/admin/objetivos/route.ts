// app/api/admin/objetivos/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import { getObjetivosContent } from '@/lib/content';

export async function GET() {
  const token = cookies().get('admin_session')?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(getObjetivosContent());
}
