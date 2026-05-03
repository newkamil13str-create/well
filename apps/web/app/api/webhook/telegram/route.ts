// apps/web/app/api/webhook/telegram/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Telegram webhook handler (untuk produksi — pakai webhooks bukan polling)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) return NextResponse.json({ ok: true })

    // Forward ke bot instance
    // Jika pakai polling di bot-tg/index.ts, webhook ini tidak diperlukan
    // Webhook hanya dipakai jika deploy dengan bot.telegram.setWebhook(url)
    console.log('[TG_WEBHOOK]', JSON.stringify(body).substring(0, 200))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[TG_WEBHOOK_ERR]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
