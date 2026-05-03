// apps/bot-wa/utils/session.ts
import { useMultiFileAuthState, AuthenticationState } from '@whiskeysockets/baileys'
import path from 'path'
import fs from 'fs'

const SESSION_DIR = path.join(process.cwd(), 'wa-session')

export async function getSession(): Promise<{
  state: AuthenticationState
  saveCreds: () => Promise<void>
}> {
  // Buat direktori session jika belum ada
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true })
  }
  return useMultiFileAuthState(SESSION_DIR)
}

export function clearSession(): void {
  if (fs.existsSync(SESSION_DIR)) {
    fs.rmSync(SESSION_DIR, { recursive: true, force: true })
    console.log('[WA] Session dihapus')
  }
}

export function sessionExists(): boolean {
  return (
    fs.existsSync(SESSION_DIR) &&
    fs.readdirSync(SESSION_DIR).length > 0
  )
}
