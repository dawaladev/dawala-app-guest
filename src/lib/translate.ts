// Translation utility functions

export interface TranslationResult {
  originalText: string
  translatedText: string
  targetLang: string
  success: boolean
}

/**
 * Translate text using Google Translate API
 */
export async function translateText(text: string, targetLang: 'en' | 'id' = 'en'): Promise<TranslationResult> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLang
      })
    })

    if (!response.ok) {
      throw new Error('Translation API error')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Translation error:', error)
    return {
      originalText: text,
      translatedText: text,
      targetLang,
      success: false
    }
  }
}

/**
 * Translate multiple texts in batch
 */
export async function translateBatch(texts: string[], targetLang: 'en' | 'id' = 'en'): Promise<TranslationResult[]> {
  const promises = texts.map(text => translateText(text, targetLang))
  return Promise.all(promises)
}

/**
 * Get translated texts for database fields
 */
export async function getTranslatedDatabaseTexts(
  originalTexts: { namaPaket?: string; deskripsi?: string },
  targetLang: 'en' | 'id' = 'en'
): Promise<{ namaPaketEn?: string; deskripsiEn?: string }> {
  const results: { namaPaketEn?: string; deskripsiEn?: string } = {}

  if (originalTexts.namaPaket) {
    const namaPaketResult = await translateText(originalTexts.namaPaket, targetLang)
    results.namaPaketEn = namaPaketResult.translatedText
  }

  if (originalTexts.deskripsi) {
    const deskripsiResult = await translateText(originalTexts.deskripsi, targetLang)
    results.deskripsiEn = deskripsiResult.translatedText
  }

  return results
}
