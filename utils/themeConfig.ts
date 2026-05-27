// テーマ（鑑定の種類）のラベル・アイコン・カラーの単一情報源
// ラベルや色が必要な箇所はすべて getThemeConfig を経由する

export interface ThemeConfig {
  label: string
  icon:  string
  color: string  // アクセント / カードの左ボーダー色
  bg:    string  // アイコン背景（半透明）
}

const THEME_CONFIG: Record<string, ThemeConfig> = {
  general:      { label: "総合運",   icon: "✦", color: "#C9A554", bg: "rgba(201,165,84,.15)" },
  work:         { label: "仕事運",   icon: "⬡", color: "#70B4FF", bg: "rgba(112,180,255,.15)" },
  love:         { label: "恋愛運",   icon: "♡", color: "#F07098", bg: "rgba(240,112,152,.15)" },
  health:       { label: "健康運",   icon: "◎", color: "#70DDA8", bg: "rgba(112,221,168,.15)" },
  money:        { label: "金運",     icon: "¥", color: "#F0C75E", bg: "rgba(240,199,94,.15)" },
  relationship: { label: "人間関係", icon: "✿", color: "#A37DFF", bg: "rgba(163,125,255,.15)" },
}

const FALLBACK: ThemeConfig = { label: "鑑定", icon: "✦", color: "#C9A554", bg: "rgba(201,165,84,.15)" }

/** テーマ ID → 設定（未知の値はゴールド系のフォールバック、label は元の値を尊重） */
export function getThemeConfig(theme: string): ThemeConfig {
  return THEME_CONFIG[theme] ?? { ...FALLBACK, label: theme || "鑑定" }
}
