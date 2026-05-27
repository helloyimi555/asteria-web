// 日付・期間フォーマットの共通ユーティリティ
// 鑑定のテーマ／期間／日時表示はすべてここを経由する
import { getThemeConfig } from "./themeConfig"

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

/** テーマ ID → 日本語ラベル（themeConfig を単一情報源として委譲） */
export function themeLabel(theme: string): string {
  return getThemeConfig(theme).label
}

/** period_start / period_end の日付範囲から period ID を推定する。
 *  鑑定作成時の getPeriodDates が決定論的に範囲を生成するため、逆算可能。
 *  推定できない場合は空文字を返す（呼び出し側で日付フォールバック）。 */
export function inferPeriodId(start?: string | null, end?: string | null): string {
  if (!start) return ""
  const s = new Date(start); if (isNaN(s.getTime())) return ""
  s.setHours(0, 0, 0, 0)
  const e = end ? new Date(end) : new Date(start)
  if (isNaN(e.getTime())) return ""
  e.setHours(0, 0, 0, 0)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const DAY = 86_400_000
  const startDiff = Math.round((s.getTime() - today.getTime()) / DAY)
  const spanDays  = Math.round((e.getTime() - s.getTime()) / DAY)

  if (spanDays === 0) {
    if (startDiff === 0) return "today"
    if (startDiff === 1) return "tomorrow"
    return ""
  }
  if (spanDays === 6) return "week"               // 今日から7日間
  const lastDay = new Date(s.getFullYear(), s.getMonth() + 1, 0).getDate()
  if (s.getMonth() === e.getMonth() && e.getDate() === lastDay) return "month"  // 月末まで
  if (s.getMonth() === 6 && s.getDate() === 1 && e.getMonth() === 11 && e.getDate() === 31) return "half2"  // 7-12月
  if (s.getMonth() === 0 && s.getDate() === 1 && e.getMonth() === 11 && e.getDate() === 31
      && s.getFullYear() > today.getFullYear()) return "year"  // 翌年通年
  return ""
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

/** 対象期間の日付括弧サフィックスを生成（「5月27日分」「5月20日〜27日分」「7月1日〜12月31日分」）
 *  同月内なら終端の「M月」を省略する。start が無ければ空文字。 */
function periodDateSuffix(start?: string | null, end?: string | null): string {
  if (!start) return ""
  const s = new Date(start)
  if (isNaN(s.getTime())) return ""
  const sm = s.getMonth() + 1, sd = s.getDate()
  if (!end || start === end) {
    return `${sm}月${sd}日分`
  }
  const e = new Date(end)
  if (isNaN(e.getTime())) return `${sm}月${sd}日分`
  const em = e.getMonth() + 1, ed = e.getDate()
  if (sm === em) return `${sm}月${sd}日〜${ed}日分`        // 同月: 終端の月を省略
  return `${sm}月${sd}日〜${em}月${ed}日分`
}

/** 「今日の総合運（5月27日分）」「今週の総合運（5月20日〜27日分）」形式
 *  - period が既知 → 「{期間}の{テーマ}」。start/end があれば「（日付分）」を付与
 *  - period が未知 → createdAt の日付ベース「{M月D日}の{テーマ}」（括弧なし）
 *  ホーム・マイページ・履歴一覧で使う */
export function formatReadingTitle(
  theme: string,
  period: string,
  createdAt: string,
  start?: string | null,
  end?: string | null,
): string {
  const periodLabel = period ? PERIOD_LABELS[period] : undefined
  const name = themeLabel(theme)
  if (periodLabel) {
    const suffix = periodDateSuffix(start, end)
    return suffix ? `${periodLabel}の${name}（${suffix}）` : `${periodLabel}の${name}`
  }
  return `${formatReadingDate(createdAt)}の${name}`
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
