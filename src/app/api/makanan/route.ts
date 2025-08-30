import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/postgres'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jenisPaketId = searchParams.get('jenisPaketId')
  
  try {
    console.log('API makanan called - using direct PostgreSQL connection')
    
    let query: string
    let queryParams: (string | number)[] = []
    
    if (jenisPaketId) {
      query = `
        SELECT 
          id,
          nama_makanan as "namaMakanan",
          deskripsi,
          deskripsi_en as "deskripsiEn",
          foto,
          harga,
          jenis_paket_id as "jenisPaketId"
        FROM makanan 
        WHERE jenis_paket_id = $1
        ORDER BY nama_makanan ASC
      `
      queryParams = [parseInt(jenisPaketId)]
    } else {
      query = `
        SELECT 
          id,
          nama_makanan as "namaMakanan",
          deskripsi,
          deskripsi_en as "deskripsiEn",
          foto,
          harga,
          jenis_paket_id as "jenisPaketId"
        FROM makanan 
        ORDER BY nama_makanan ASC
      `
    }
    
    const result = await pool.query(query, queryParams)
    
    console.log(`Returning makanan data: ${result.rows.length} items`)
    return NextResponse.json(result.rows)
    
  } catch (error: unknown) {
    const err = error as Error & { code?: string; detail?: string };
    console.error('Database error in makanan:', {
      message: err.message,
      name: err.name,
      code: err.code,
      detail: err.detail
    })
    
    return NextResponse.json(
      { error: 'Failed to fetch makanan data', details: err.message },
      { status: 500 }
    )
  }
}
