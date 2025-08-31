import { NextResponse } from 'next/server'
import pool from '@/lib/postgres'

export async function GET() {
  try {
    console.log('API settings called - using direct PostgreSQL connection')
    
    const query = `
      SELECT 
        email,
        no_telp as "noTelp"
      FROM settings 
      ORDER BY id DESC 
      LIMIT 1
    `
    
    const result = await pool.query(query)
    
    if (result.rows.length === 0) {
      // Return default values if no settings found
      return NextResponse.json({
        email: 'dawaladev@gmail.com',
        noTelp: '628123456789'
      })
    }
    
    console.log(`Returning settings data:`, result.rows[0])
    return NextResponse.json(result.rows[0])
    
  } catch (error: unknown) {
    const err = error as Error & { code?: string; detail?: string };
    console.error('Database error in settings:', {
      message: err.message,
      name: err.name,
      code: err.code,
      detail: err.detail
    })
    
    // Return default values on error
    return NextResponse.json({
      email: 'dawaladev@gmail.com',
      noTelp: '628123456789'
    })
  }
}
