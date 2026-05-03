// apps/bot-tg/middleware/auth.ts
import { Context, MiddlewareFn } from 'telegraf'

const ADMIN_IDS = process.env.TELEGRAM_ADMIN_IDS?.split(',').map(Number) || []

/**
 * Middleware untuk cek admin
 */
export function adminOnly(): MiddlewareFn<Context> {
  return async (ctx, next) => {
    const userId = ctx.from?.id
    if (!userId || !ADMIN_IDS.includes(userId)) {
      await ctx.reply('⛔ Akses ditolak. Perintah ini hanya untuk admin.')
      return
    }
    return next()
  }
}

/**
 * Middleware logging
 */
export function logger(): MiddlewareFn<Context> {
  return async (ctx, next) => {
    const start = Date.now()
    const user = ctx.from
    const update = ctx.updateType
    console.log(`[TG] ${update} dari ${user?.username || user?.id} (${user?.first_name})`)
    await next()
    const ms = Date.now() - start
    console.log(`[TG] Response time: ${ms}ms`)
  }
}
