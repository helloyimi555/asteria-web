"use client"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

let _client: SupabaseClient | null = null

/** ブラウザ用の Supabase クライアントを返す（環境変数未設定なら null） */
export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  if (_client) return _client
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      // メール確認リンク経由のセッションは URL から検出する
      detectSessionInUrl: true,
      persistSession:     true,
      autoRefreshToken:   true,
    },
  })
  return _client
}
