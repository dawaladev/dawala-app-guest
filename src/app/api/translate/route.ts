import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang = 'en' } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Skip translation if text is too short or empty
    if (text.trim().length < 3) {
      return NextResponse.json({
        originalText: text,
        translatedText: text,
        targetLang,
        success: true
      })
    }

    // Use Google Translate API (free tier) with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error('Google Translate API error')
      }

      const data = await response.json()
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const translatedText = data[0].map((item: [string, string, string?, number?]) => item[0]).join('')
        
        return NextResponse.json({
          originalText: text,
          translatedText: translatedText,
          targetLang,
          success: true
        })
      } else {
        // Fallback to original text if translation fails
        return NextResponse.json({
          originalText: text,
          translatedText: text,
          targetLang,
          success: true
        })
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }

  } catch (error) {
    console.error('Translation error:', error)
    
    // Fallback to original text if translation fails
    try {
      const { text: fallbackText, targetLang: fallbackLang = 'en' } = await request.json()
      return NextResponse.json({
        originalText: fallbackText,
        translatedText: fallbackText,
        targetLang: fallbackLang,
        success: true
      })
    } catch {
      return NextResponse.json({
        originalText: 'Translation failed',
        translatedText: 'Translation failed',
        targetLang: 'en',
        success: true
      })
    }
  }
}
