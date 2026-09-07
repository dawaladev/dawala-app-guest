import { config } from '@/lib/config'
import { getPublicContact, type PublicContact } from '@/lib/chat/public-contact'

/** Default 2 menit — AI Agent + memory sering >45s. Override: N8N_CHAT_TIMEOUT_MS */
const DEFAULT_CHAT_TIMEOUT_MS = 120_000

function chatTimeoutMs(): number {
  const raw = Number(process.env.N8N_CHAT_TIMEOUT_MS)
  if (Number.isFinite(raw) && raw >= 30_000 && raw <= 300_000) return raw
  return DEFAULT_CHAT_TIMEOUT_MS
}

function n8nChatWebhookUrl(): string | undefined {
  const value = process.env.N8N_CHAT_WEBHOOK_URL?.trim()
  return value || undefined
}

function n8nWebhookSecret(): string | undefined {
  const value = process.env.N8N_WEBHOOK_SECRET?.trim()
  return value || undefined
}

export type PublicChatPayload = {
  type: 'public_chat'
  message: string
  sessionId: string
  locale?: string
  appUrl: string
  /**
   * Info halaman Kontak (sumber sama dengan /contact).
   * Dikirim di payload karena n8n hosting tidak bisa GET localhost.
   */
  kontak: PublicContact
}

export type PublicChatDispatchResult =
  | { ok: true; reply: string }
  | {
      ok: false
      code: 'NOT_CONFIGURED' | 'UPSTREAM_ERROR' | 'INVALID_REPLY' | 'TIMEOUT'
      error: string
    }

function normalizeAppUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, '')
  if (!trimmed) return 'http://localhost:3000'
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `http://${trimmed}`
}

export async function buildPublicChatPayload(
  message: string,
  sessionId: string,
  locale?: string,
): Promise<PublicChatPayload> {
  const lang = locale === 'en' ? 'en' : 'id'
  return {
    type: 'public_chat',
    message,
    sessionId,
    locale: lang,
    appUrl: normalizeAppUrl(config.app.url),
    kontak: await getPublicContact(lang),
  }
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || null
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return null
}

/**
 * Ambil teks balasan dari berbagai bentuk respons n8n
 * (Respond to Webhook, AI Agent `output`, array item, nested data, dll.).
 */
function extractReply(raw: unknown, depth = 0): string | null {
  if (depth > 6) return null

  const direct = asNonEmptyString(raw)
  if (direct) {
    if (direct === 'Workflow was started') return null
    return direct
  }

  if (Array.isArray(raw)) {
    for (const item of raw) {
      const found = extractReply(item, depth + 1)
      if (found) return found
    }
    return null
  }

  if (!raw || typeof raw !== 'object') return null

  const obj = raw as Record<string, unknown>

  for (const key of ['reply', 'output', 'text', 'answer', 'content', 'message'] as const) {
    if (!(key in obj)) continue
    const value = obj[key]
    const asText = asNonEmptyString(value)
    if (asText) {
      if (key === 'message' && asText === 'Workflow was started') continue
      return asText
    }
    const nested = extractReply(value, depth + 1)
    if (nested) return nested
  }

  if (Array.isArray(obj.output)) {
    const fromOutput = extractReply(obj.output, depth + 1)
    if (fromOutput) return fromOutput
  }

  if (obj.data !== undefined) {
    const fromData = extractReply(obj.data, depth + 1)
    if (fromData) return fromData
  }

  const values = Object.values(obj)
  if (values.length === 1) {
    return extractReply(values[0], depth + 1)
  }

  return null
}

function previewBody(text: string, max = 500): string {
  const trimmed = text.replace(/\s+/g, ' ').trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max)}…`
}

/** Kirim pertanyaan chatbot publik ke webhook n8n dan ambil balasan. */
export async function dispatchPublicChatToN8n(
  message: string,
  sessionId: string,
  locale?: string,
): Promise<PublicChatDispatchResult> {
  const n8nUrl = n8nChatWebhookUrl()
  if (!n8nUrl) {
    return {
      ok: false,
      code: 'NOT_CONFIGURED',
      error: 'N8N_CHAT_WEBHOOK_URL belum dikonfigurasi.',
    }
  }

  const payload = await buildPublicChatPayload(message, sessionId, locale)
  const secret = n8nWebhookSecret()

  try {
    const res = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { 'x-n8n-secret': secret } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(chatTimeoutMs()),
    })

    const text = await res.text().catch(() => '')

    if (!res.ok) {
      const hint404 =
        res.status === 404
          ? ' Workflow belum aktif / path webhook salah — di n8n: Import dawala-public-chat.json → Activate, lalu pakai URL Production /webhook/dawala-chat (bukan webhook-test).'
          : ''
      return {
        ok: false,
        code: 'UPSTREAM_ERROR',
        error: (text || `n8n responded ${res.status}`) + hint404,
      }
    }

    let parsed: unknown = text
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown
      } catch {
        parsed = text
      }
    }

    const reply = extractReply(parsed)
    if (!reply) {
      console.error(
        '[chat] invalid n8n reply. status=%s body=%s',
        res.status,
        previewBody(text || '(empty)'),
      )
      return {
        ok: false,
        code: 'INVALID_REPLY',
        error: 'Respons n8n tidak berisi field reply yang valid.',
      }
    }

    return { ok: true, reply }
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError')
    ) {
      return {
        ok: false,
        code: 'TIMEOUT',
        error: 'Timeout menunggu balasan dari n8n.',
      }
    }

    const cause =
      error instanceof Error && error.cause instanceof Error
        ? `${error.cause.name}: ${error.cause.message}`
        : error instanceof Error && error.cause
          ? String(error.cause)
          : null
    const messageText =
      error instanceof Error ? error.message : 'Gagal menghubungi n8n.'
    console.error('[chat] n8n fetch failed:', {
      url: n8nUrl,
      message: messageText,
      cause,
    })
    return {
      ok: false,
      code: 'UPSTREAM_ERROR',
      error: cause ? `${messageText} (${cause})` : messageText,
    }
  }
}
