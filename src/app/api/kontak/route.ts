import { NextRequest, NextResponse } from 'next/server'
import { getPublicContact } from '@/lib/chat/public-contact'

/**
 * GET /api/kontak
 * Info kontak yang sama dengan halaman Kontak — dipakai tool n8n.
 */
export async function GET(request: NextRequest) {
  const locale =
    request.nextUrl.searchParams.get('locale') === 'en' ? 'en' : 'id'

  return NextResponse.json({
    ok: true,
    data: await getPublicContact(locale),
  })
}
