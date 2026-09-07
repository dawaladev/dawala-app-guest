'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { getCurrentLocale } from '@/lib/locale'

type ChatRole = 'user' | 'bot'

type ChatMessage = {
  id: string
  role: ChatRole
  text: string
}

type StoredChatState = {
  sessionId: string
  startedAt: number
  messages: ChatMessage[]
}

const STORAGE_KEY = 'dawala-chat-state'
const DAY_MS = 24 * 60 * 60 * 1000
const SITE_NAME = 'Desa Wisata Alamendah'

const copy = {
  id: {
    title: `Asisten ${SITE_NAME}`,
    subtitle: 'Tanya paket wisata, kuliner, atau kontak kapan saja',
    welcome: `Halo! Saya asisten ${SITE_NAME}. Tanya saja soal paket wisata & kuliner, harga, kategori, cara reservasi, atau info kontak.`,
    placeholder: 'Tulis pertanyaan…',
    reset: 'Reset chat',
    close: 'Tutup chat',
    open: 'Buka asisten chat',
    closeFab: 'Tutup asisten chat',
    send: 'Kirim pesan',
    typing: 'Asisten sedang mengetik',
    rateLimited: 'Terlalu banyak pertanyaan. Tunggu sebentar lalu coba lagi.',
    notConfigured:
      'Maaf, layanan chat belum dikonfigurasi. Silakan hubungi kami via email sementara ini.',
    timeout:
      'Asisten belum sempat menjawab karena prosesnya terlalu lama. Silakan kirim ulang pertanyaan yang sama.',
    empty: 'Balasan chat kosong. Coba lagi nanti.',
    generic:
      'Maaf, gagal menghubungi asisten. Silakan coba lagi nanti atau hubungi kami via email.',
  },
  en: {
    title: `${SITE_NAME} Assistant`,
    subtitle: 'Ask about packages, food, or contact anytime',
    welcome: `Hi! I'm the ${SITE_NAME} assistant. Ask about tourism & culinary packages, prices, categories, reservations, or contact info.`,
    placeholder: 'Type your question…',
    reset: 'Reset chat',
    close: 'Close chat',
    open: 'Open chat assistant',
    closeFab: 'Close chat assistant',
    send: 'Send message',
    typing: 'Assistant is typing',
    rateLimited: 'Too many questions. Please wait a moment and try again.',
    notConfigured:
      'Sorry, chat is not configured yet. Please email us for now.',
    timeout:
      'The assistant took too long to reply. Please send the same question again.',
    empty: 'Empty chat reply. Please try again later.',
    generic:
      'Sorry, failed to reach the assistant. Please try again later or email us.',
  },
} as const

type ChatCopy = { [K in keyof (typeof copy)['id']]: string }

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function welcomeMessage(locale: 'id' | 'en'): ChatMessage {
  return {
    id: 'welcome',
    role: 'bot',
    text: copy[locale].welcome,
  }
}

function readStoredState(): StoredChatState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredChatState
    if (
      !parsed?.sessionId ||
      !parsed.startedAt ||
      !Array.isArray(parsed.messages)
    ) {
      return null
    }
    if (Date.now() - parsed.startedAt >= DAY_MS) return null
    return parsed
  } catch {
    return null
  }
}

function writeStoredState(state: StoredChatState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function clearStoredState() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

/** Render markdown ringan: **bold** → tebal, baris baru tetap. */
function FormattedChatText({ text }: { text: string }) {
  const normalized = text.replace(/\*\*\*([\s\S]+?)\*\*\*/g, '**$1**')
  const lines = normalized.split('\n')

  return (
    <>
      {lines.map((line, lineIndex) => (
        <span key={`line-${lineIndex}`}>
          {lineIndex > 0 ? <br /> : null}
          {renderInlineMarkdown(line)}
        </span>
      ))}
    </>
  )
}

function renderInlineMarkdown(line: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(line.slice(lastIndex, match.index))
    }
    nodes.push(
      <strong key={`b-${key++}`} className="font-semibold">
        {match[1]}
      </strong>,
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : [line]
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.5 19.5 4 21l1.2-3.5A8.5 8.5 0 1 1 12 20.5a8.4 8.4 0 0 1-4.5-1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.5 12a7.5 7.5 0 0 1 12.7-5.4M19.5 12a7.5 7.5 0 0 1-12.7 5.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17 4.5v4h-4M7 19.5v-4h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3.4 20.6 22 12 3.4 3.4l-.1 6.7L15 12 3.3 13.9l.1 6.7Z" />
    </svg>
  )
}

/** Floating chatbot pojok kanan bawah. */
export default function FloatingChatWidget() {
  const pathname = usePathname()
  const locale = getCurrentLocale(pathname)
  const t = copy[locale]
  const panelTitleId = useId()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const startedAtRef = useRef<number>(Date.now())
  const hydratedRef = useRef(false)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    const stored = readStoredState()
    if (stored && stored.messages.length > 0) {
      startedAtRef.current = stored.startedAt
      setSessionId(stored.sessionId)
      setMessages(stored.messages)
    } else {
      const nextId = createId()
      const startedAt = Date.now()
      startedAtRef.current = startedAt
      const initial = [welcomeMessage(locale)]
      setSessionId(nextId)
      setMessages(initial)
      writeStoredState({ sessionId: nextId, startedAt, messages: initial })
    }
    hydratedRef.current = true
  }, [locale])

  useEffect(() => {
    if (!hydratedRef.current || !sessionId || messages.length === 0) return
    writeStoredState({
      sessionId,
      startedAt: startedAtRef.current,
      messages,
    })
  }, [messages, sessionId])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, sending, open])

  function resetChat() {
    clearStoredState()
    const nextId = createId()
    const startedAt = Date.now()
    startedAtRef.current = startedAt
    const initial = [welcomeMessage(locale)]
    setSessionId(nextId)
    setMessages(initial)
    setDraft('')
    setSending(false)
    writeStoredState({ sessionId: nextId, startedAt, messages: initial })
    return nextId
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    let activeSessionId = sessionId
    let baseMessages = messages

    if (Date.now() - startedAtRef.current >= DAY_MS) {
      clearStoredState()
      activeSessionId = createId()
      const startedAt = Date.now()
      startedAtRef.current = startedAt
      baseMessages = [welcomeMessage(locale)]
      setSessionId(activeSessionId)
      writeStoredState({
        sessionId: activeSessionId,
        startedAt,
        messages: baseMessages,
      })
    }

    const userMessage: ChatMessage = { id: createId(), role: 'user', text }
    setMessages([...baseMessages, userMessage])
    setDraft('')
    setSending(true)

    try {
      const result = await requestChatReply(
        text,
        activeSessionId || createId(),
        locale,
        t,
      )
      if (result.sessionId && result.sessionId !== activeSessionId) {
        setSessionId(result.sessionId)
      }
      setMessages((prev) => [
        ...prev,
        { id: createId(), role: 'bot', text: result.reply },
      ])
    } catch (error) {
      const fallback =
        error instanceof Error && error.message ? error.message : t.generic
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'bot',
          text: fallback,
        },
      ])
    } finally {
      setSending(false)
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          className="pointer-events-auto flex h-[min(32rem,calc(100dvh-6.5rem))] w-[min(22.5rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_18px_50px_-18px_rgba(22,101,52,0.45)]"
          role="dialog"
          aria-modal="false"
          aria-labelledby={panelTitleId}
        >
          <header className="flex items-start justify-between gap-2 bg-green-600 px-4 py-3.5 text-white">
            <div className="min-w-0">
              <p
                id={panelTitleId}
                className="text-base font-bold leading-tight"
              >
                {t.title}
              </p>
              <p className="mt-0.5 text-xs text-white/80">{t.subtitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                disabled={sending}
                className="inline-flex h-8 w-8 min-h-8 min-w-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/15 disabled:opacity-40"
                aria-label={t.reset}
                title={t.reset}
              >
                <ResetIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 min-h-8 min-w-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/15"
                aria-label={t.close}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3.5 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === 'user'
                    ? 'flex justify-end'
                    : 'flex justify-start'
                }
              >
                <div
                  className={
                    message.role === 'user'
                      ? 'max-w-[85%] rounded-2xl rounded-br-md bg-green-600 px-3.5 py-2.5 text-sm leading-relaxed text-white'
                      : 'max-w-[85%] rounded-2xl rounded-bl-md border border-gray-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-gray-800 shadow-sm'
                  }
                >
                  <FormattedChatText text={message.text} />
                </div>
              </div>
            ))}
            {sending ? (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-500 shadow-sm"
                  aria-live="polite"
                  aria-label={t.typing}
                >
                  <span className="inline-flex gap-1" aria-hidden>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-600/70" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-600/70 [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-600/70 [animation-delay:240ms]" />
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 bg-white p-3"
          >
            <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-600/20">
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t.placeholder}
                disabled={sending}
                className="max-h-28 min-h-[2.25rem] flex-1 resize-none bg-transparent px-1 py-1.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:opacity-60"
                aria-label={t.placeholder}
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="inline-flex h-9 w-9 min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg bg-green-600 text-white transition-opacity hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={t.send}
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-[0_12px_28px_-8px_rgba(22,101,52,0.65)] transition-transform hover:scale-[1.03] hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-label={open ? t.closeFab : t.open}
      >
        {open ? (
          <CloseIcon className="h-6 w-6" />
        ) : (
          <ChatIcon className="h-7 w-7" />
        )}
      </button>
    </div>
  )
}

async function requestChatReply(
  message: string,
  sessionId: string,
  locale: 'id' | 'en',
  t: ChatCopy,
): Promise<{ reply: string; sessionId?: string }> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId, locale }),
  })

  const payload = (await response.json().catch(() => null)) as {
    ok?: boolean
    data?: { reply?: string; sessionId?: string }
    error?: { code?: string; message?: string }
  } | null

  if (!response.ok || !payload?.ok) {
    const code = payload?.error?.code
    if (code === 'RATE_LIMITED') throw new Error(t.rateLimited)
    if (code === 'CHAT_NOT_CONFIGURED') throw new Error(t.notConfigured)
    if (code === 'CHAT_TIMEOUT') throw new Error(t.timeout)
    throw new Error(payload?.error?.message ?? t.generic)
  }

  if (!payload.data?.reply) {
    throw new Error(t.empty)
  }

  return {
    reply: payload.data.reply,
    sessionId: payload.data.sessionId,
  }
}
