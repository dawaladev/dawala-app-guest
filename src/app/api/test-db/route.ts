import { NextResponse } from 'next/server'
import pool from '@/lib/postgres'

export async function GET() {
  try {
    console.log('Testing database connection and table structure')
    
    // Test connection
    const connectionResult = await pool.query('SELECT NOW()')
    console.log('Database connected successfully:', connectionResult.rows[0])
    
    // Check table structure
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    
    console.log('Available tables:', tablesResult.rows)
    
    // Check makanan table structure
    const makananStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'makanan'
      ORDER BY ordinal_position
    `)
    
    console.log('Makanan table structure:', makananStructure.rows)
    
    // Check jenis_paket table structure
    const jenisPaketStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'jenis_paket'
      ORDER BY ordinal_position
    `)
    
    console.log('Jenis paket table structure:', jenisPaketStructure.rows)
    
    return NextResponse.json({
      connection: 'success',
      timestamp: connectionResult.rows[0],
      tables: tablesResult.rows,
      makananColumns: makananStructure.rows,
      jenisPaketColumns: jenisPaketStructure.rows
    })
    
  } catch (error: any) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { error: 'Database test failed', details: error.message },
      { status: 500 }
    )
  }
}
