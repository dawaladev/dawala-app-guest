import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, clientKeyFromRequest } from '@/lib/rate-limit'
import { dispatchPublicChatToN8n } from '@/lib/chat/dispatch-public-chat'

/** Izinkan request panjang (AI Agent n8n bisa >1 menit). */
export const maxDuration = 180

const publicChatSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  sessionId: z.string().trim().min(1).max(120).optional(),
  locale: z.enum(['id', 'en']).optional(),
})

function createSessionId() {
  return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * POST /api/chat
 * Bridge floating chatbot → webhook n8n (N8N_CHAT_WEBHOOK_URL).
 */
export async function POST(request: NextRequest) {
  const rate = checkRateLimit(
    `public-chat:${clientKeyFromRequest(request)}`,
    20,
    60_000,
  )
  if (!rate.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Terlalu banyak permintaan. Coba lagi sebentar.',
          retryAfterSec: rate.retryAfterSec,
        },
      },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Body JSON tidak valid.' },
      },
      { status: 400 },
    )
  }

  const parsed = publicChatSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Data tidak valid.',
        },
      },
      { status: 400 },
    )
  }

  const sessionId = parsed.data.sessionId ?? createSessionId()
  const result = await dispatchPublicChatToN8n(
    parsed.data.message,
    sessionId,
    parsed.data.locale,
  )

  if (!result.ok) {
    if (result.code === 'NOT_CONFIGURED') {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'CHAT_NOT_CONFIGURED',
            message:
              'Layanan chat belum dikonfigurasi. Set N8N_CHAT_WEBHOOK_URL di environment.',
          },
        },
        { status: 503 },
      )
    }
    if (result.code === 'TIMEOUT') {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'CHAT_TIMEOUT',
            message:
              'Asisten masih sibuk. Mohon tunggu sebentar lalu kirim ulang pertanyaan yang sama.',
          },
        },
        { status: 504 },
      )
    }
    if (result.code === 'INVALID_REPLY') {
      console.error('[api/chat] invalid n8n reply:', result.error)
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'CHAT_INVALID_REPLY',
            message: 'Respons asisten tidak valid. Coba lagi nanti.',
          },
        },
        { status: 502 },
      )
    }
    console.error('[api/chat] upstream:', result.error)
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'CHAT_UPSTREAM_ERROR',
          message: 'Gagal menghubungi asisten. Coba lagi nanti.',
        },
      },
      { status: 502 },
    )
  }

  return NextResponse.json({
    ok: true,
    data: {
      reply: result.reply,
      sessionId,
    },
  })
}
