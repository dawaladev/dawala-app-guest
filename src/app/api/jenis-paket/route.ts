import { NextResponse } from 'next/server'
import pool from '@/lib/postgres'

export async function GET() {
  try {
    console.log('API jenis-paket called - using direct PostgreSQL connection')
    console.log('Database URL exists:', !!process.env.DATABASE_URL)
    
    const client = await pool.connect()
    
    try {
      const result = await client.query(`
        SELECT 
          id,
          nama_paket as "namaPaket",
          nama_paket_en as "namaPaketEn"
        FROM jenis_paket 
        ORDER BY nama_paket ASC
      `)
      
      console.log('Successfully fetched jenis paket:', result.rows.length, 'items')
      console.log('Jenis paket data:', result.rows)
      return NextResponse.json(result.rows)
    } finally {
      client.release()
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Database error in jenis-paket:', {
      message: err.message,
      name: err.name,
      code: (err as any).code,
      detail: (err as any).detail
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch jenis paket', 
        details: err.message || 'Unknown error',
        type: err.name || 'Unknown'
      },
      { status: 500 }
    )
  }
}
