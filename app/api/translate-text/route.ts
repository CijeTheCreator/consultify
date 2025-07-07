// app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server"
import { LingoDotDevEngine } from "lingo.dev/sdk"

const lingoDotDev = new LingoDotDevEngine({
  apiKey: process.env.LINGO_DEV_API_KEY || "your-api-key-here",
})

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLanguage, targetLanguage } = await request.json()

    // Validate required fields
    if (!text || !sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing required fields: text, sourceLanguage, targetLanguage" },
        { status: 400 }
      )
    }

    // Perform translation using lingo.dev
    const result = await lingoDotDev.localizeText(text, {
      sourceLocale: sourceLanguage,
      targetLocale: targetLanguage,
    })

    return NextResponse.json({ translatedText: result })
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    )
  }
}
