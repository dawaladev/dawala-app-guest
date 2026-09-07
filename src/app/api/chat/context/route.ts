import { NextResponse } from 'next/server'
import { buildPublicChatContextText } from '@/lib/chat/build-public-chat-context'

/**
 * GET /api/chat/context
 * Dump katalog untuk debug. Chatbot n8n tidak memakai endpoint ini —
 * AI Agent mengambil paket langsung dari Postgres via tool.
 */
export async function GET() {
  try {
    const context = await buildPublicChatContextText()
    return NextResponse.json({
      ok: true,
      data: context,
    })
  } catch (error) {
    console.error('[api/chat/context]', error)
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'CONTEXT_ERROR', message: 'Gagal membangun konteks chat.' },
      },
      { status: 500 },
    )
  }
}
