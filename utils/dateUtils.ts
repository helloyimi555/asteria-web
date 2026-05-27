// 日付・期間フォーマットの共通ユーティリティ
// 鑑定のテーマ／期間／日時表示はすべてここを経由する

const THEME_LABELS: Record<string, string> = {
  general:      "総合運",
  work:         "仕事運",
  love:         "恋愛運",
  health:       "健康運",
  money:        "金運",
  relationship: "人間関係",
}

// period の値 → 日本語ラベル。
// コードベースの実 ID（today/week/month/half2/year）と、別名（this_week 等）の両方を受け付ける
const PERIOD_LABELS: Record<string, string> = {
  today:          "今日",
  tomorrow:       "明日",
  week:           "今週",
  this_week:      "今週",
  month:          "今月",
  this_month:     "今月",
  half2:          "今年後半",
  this_half_year: "今年後半",
  year:           "来年",
  next_year:      "来年",
}

/** テーマ ID → 日本語ラベル（未知の値はそのまま返す） */
export function themeLabel(theme: string): string {
  return THEME_LABELS[theme] ?? theme
}

/** 単日の相対表現（今日/明日/昨日）。該当しなければ null */
function relativeDayLabel(isoString: string): string | null {
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return null
  d.setHours(0, 0, 0, 0)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000)
  if (diff === 0)  return "今日"
  if (diff === 1)  return "明日"
  if (diff === -1) return "昨日"
  return null
}

/** 「5月27日」形式（今年は年省略、去年以前は「2025年3月1日」） */
export function formatReadingDate(isoString: string): string {
  if (!isoString) return ""
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ""
  const md = `${d.getMonth() + 1}月${d.getDate()}日`
  return d.getFullYear() === new Date().getFullYear() ? md : `${d.getFullYear()}年${md}`
}

/** 「5月27日 14:32」形式（年の扱いは formatReadingDate に準拠） */
export function formatReadingDateTime(isoString: string): string {
  if (!isoString) return ""
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${formatReadingDate(isoString)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** period の値を自然な日本語に変換（未知の値はそのまま返す） */
export function formatPeriodLabel(period: string): string {
  if (!period) return ""
  return PERIOD_LABELS[period] ?? period
}

/** 「5月27日の総合運」形式（ホーム・マイページ・履歴一覧で使う）
 *  period は将来拡張用に受け取るが、表示は createdAt の日付 + テーマ */
export function formatReadingTitle(theme: string, period: string, createdAt: string): string {
  return `${formatReadingDate(createdAt)}の${themeLabel(theme)}`
}

/** 「今日の運勢」「5月27日〜6月2日の運勢」など（結果ページ上部サブテキストで使う）
 *  period ID が既知ならそれを優先。無ければ start/end の日付から組み立てる。 */
export function formatReadingPeriodText(period?: string, start?: string | null, end?: string | null): string {
  const known = period ? PERIOD_LABELS[period] : undefined
  if (known) return `${known}の運勢`

  if (start) {
    if (!end || start === end) {
      return `${relativeDayLabel(start) ?? formatReadingDate(start)}の運勢`
    }
    return `${formatReadingDate(start)}〜${formatReadingDate(end)}の運勢`
  }
  return "運勢"
}
