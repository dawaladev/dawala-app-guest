import pool from '@/lib/postgres'
import { config } from '@/lib/config'
import { getPublicContact } from '@/lib/chat/public-contact'

const MAX_PACKAGES = 40
const MAX_BODY_CHARS = 280

function collapseWs(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function clip(value: string, max = MAX_BODY_CHARS): string {
  const text = collapseWs(value)
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatGeneratedAt(date = new Date()): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(date)
}

type JenisPaketRow = {
  id: number
  namaPaket: string
  namaPaketEn: string | null
}

type MakananRow = {
  id: number
  namaMakanan: string
  deskripsi: string | null
  deskripsiEn: string | null
  harga: number
  jenisPaketId: number
}

/**
 * Dump katalog (paket + kategori + info situs) untuk GET /api/chat/context.
 * Tidak di-inject ke prompt LLM — n8n memakai tool Postgres.
 */
export async function buildPublicChatContextText(): Promise<{
  text: string
  generatedAt: string
}> {
  const now = new Date()
  const kontak = await getPublicContact('id')

  let jenisPaket: JenisPaketRow[] = []
  let makanan: MakananRow[] = []

  try {
    const [jenisResult, makananResult] = await Promise.all([
      pool.query(`
        SELECT
          id,
          nama_paket as "namaPaket",
          nama_paket_en as "namaPaketEn"
        FROM jenis_paket
        ORDER BY nama_paket ASC
      `),
      pool.query(
        `
        SELECT
          id,
          nama_makanan as "namaMakanan",
          deskripsi,
          deskripsi_en as "deskripsiEn",
          harga,
          jenis_paket_id as "jenisPaketId"
        FROM makanan
        ORDER BY nama_makanan ASC
        LIMIT $1
      `,
        [MAX_PACKAGES],
      ),
    ])
    jenisPaket = jenisResult.rows as JenisPaketRow[]
    makanan = makananResult.rows as MakananRow[]
  } catch (error) {
    console.error('[chat/context] DB error:', error)
  }

  const kategoriById = new Map(jenisPaket.map((j) => [j.id, j]))

  const lines: string[] = [
    '# Konteks website Desa Wisata Alamendah (Dawala)',
    `Dibuat: ${formatGeneratedAt(now)} (WIB)`,
    'Aturan untuk asisten: jawab HANYA dari data di bawah. Jika tidak ada, bilang tidak tahu. Jangan mengarang harga, nama paket, atau info kontak.',
    '',
    '## Identitas & kontak',
    `- Nama situs: ${config.app.name}`,
    '- Tagline: Desa wisata & kuliner di Kabupaten Bandung',
    `- Email: ${kontak.email}`,
    `- Telepon: ${kontak.phone}`,
    `- Lokasi: ${kontak.location}`,
    `- Jam layanan telepon: ${kontak.phoneHours}`,
    `- Website: ${config.app.url}`,
    `- Halaman Kontak: ${kontak.contactPageUrl}`,
    '',
    '## Tentang desa',
    '- Desa Wisata Alamendah menawarkan pengalaman autentik kehidupan pedesaan: wisata alam, budaya, edukasi, dan kuliner tradisional.',
    '- Aktivitas: wisata budaya (seni & tradisi), wisata alam (tracking, bird watching), wisata edukasi (workshop pedesaan).',
    '- Akomodasi: penginapan dengan pemandangan pegunungan, udara sejuk, fasilitas modern bernuansa tradisional.',
    '',
    '## Cara reservasi',
    `- ${kontak.reservation}`,
    '- Atau hubungi telepon / kunjungi halaman Kontak di website.',
    '',
  ]

  lines.push('## Kategori paket')
  if (jenisPaket.length === 0) {
    lines.push('- (belum ada data kategori)')
  } else {
    for (const j of jenisPaket) {
      const en = j.namaPaketEn ? ` / ${j.namaPaketEn}` : ''
      lines.push(`- ${j.namaPaket}${en} (id:${j.id})`)
    }
  }
  lines.push('')

  lines.push(`## Paket wisata & kuliner (maks ${MAX_PACKAGES})`)
  if (makanan.length === 0) {
    lines.push('- (belum ada data paket)')
  } else {
    for (const m of makanan) {
      const kategori = kategoriById.get(m.jenisPaketId)
      const kategoriLabel = kategori
        ? kategori.namaPaket
        : `kategori#${m.jenisPaketId}`
      const desc = clip(m.deskripsi || m.deskripsiEn || '-')
      lines.push(
        `- ${m.namaMakanan} | ${formatRupiah(Number(m.harga) || 0)} | ${kategoriLabel}`,
      )
      lines.push(`  Deskripsi: ${desc}`)
      if (m.deskripsiEn && m.deskripsi) {
        lines.push(`  EN: ${clip(m.deskripsiEn)}`)
      }
    }
  }

  return {
    text: lines.join('\n'),
    generatedAt: now.toISOString(),
  }
}
