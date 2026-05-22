import type { ZodiacSign } from "@/types"

export const ZODIAC: ZodiacSign[] = [
  { sign:"牡羊座", en:"Aries",       symbol:"♈", element:"fire",  color:"#FF8A70" },
  { sign:"牡牛座", en:"Taurus",      symbol:"♉", element:"earth", color:"#C9A554" },
  { sign:"双子座", en:"Gemini",      symbol:"♊", element:"air",   color:"#70B4FF" },
  { sign:"蟹座",   en:"Cancer",      symbol:"♋", element:"water", color:"#70DDD8" },
  { sign:"獅子座", en:"Leo",         symbol:"♌", element:"fire",  color:"#FFC96E" },
  { sign:"乙女座", en:"Virgo",       symbol:"♍", element:"earth", color:"#70DDA8" },
  { sign:"天秤座", en:"Libra",       symbol:"♎", element:"air",   color:"#F07098" },
  { sign:"蠍座",   en:"Scorpio",     symbol:"♏", element:"water", color:"#A07CF0" },
  { sign:"射手座", en:"Sagittarius", symbol:"♐", element:"fire",  color:"#F08060" },
  { sign:"山羊座", en:"Capricorn",   symbol:"♑", element:"earth", color:"#50C8A8" },
  { sign:"水瓶座", en:"Aquarius",    symbol:"♒", element:"air",   color:"#50C8D8" },
  { sign:"魚座",   en:"Pisces",      symbol:"♓", element:"water", color:"#B0A8F0" },
]

export function getSunSign(dateStr: string): ZodiacSign | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const m = d.getMonth() + 1
  const day = d.getDate()

  if ((m===3&&day>=21)||(m===4&&day<=19)) return ZODIAC[0]
  if ((m===4&&day>=20)||(m===5&&day<=20)) return ZODIAC[1]
  if ((m===5&&day>=21)||(m===6&&day<=20)) return ZODIAC[2]
  if ((m===6&&day>=21)||(m===7&&day<=22)) return ZODIAC[3]
  if ((m===7&&day>=23)||(m===8&&day<=22)) return ZODIAC[4]
  if ((m===8&&day>=23)||(m===9&&day<=22)) return ZODIAC[5]
  if ((m===9&&day>=23)||(m===10&&day<=22)) return ZODIAC[6]
  if ((m===10&&day>=23)||(m===11&&day<=21)) return ZODIAC[7]
  if ((m===11&&day>=22)||(m===12&&day<=21)) return ZODIAC[8]
  if ((m===12&&day>=22)||(m===1&&day<=19)) return ZODIAC[9]
  if ((m===1&&day>=20)||(m===2&&day<=18)) return ZODIAC[10]
  return ZODIAC[11]
}

export const READING_THEMES = [
  { id:"general",      label:"総合運",   icon:"✦", desc:"全体的な運勢の流れ" },
  { id:"work",         label:"仕事運",   icon:"⬡", desc:"キャリアと仕事の機会" },
  { id:"love",         label:"恋愛運",   icon:"♡", desc:"恋愛と感情のつながり" },
  { id:"health",       label:"健康運",   icon:"◎", desc:"心身のバランスと活力" },
  { id:"money",        label:"金運",     icon:"¥", desc:"財務と豊かさの流れ" },
  { id:"relationship", label:"人間関係", icon:"✿", desc:"人脈と対人関係" },
] as const

export const READING_PERIODS = [
  { id:"month", label:"今月",     start:(now: Date) => now, end:(now: Date) => new Date(now.getFullYear(), now.getMonth()+1, 0) },
  { id:"half2", label:"今年後半", start:()=>new Date(new Date().getFullYear(),6,1), end:()=>new Date(new Date().getFullYear(),11,31) },
  { id:"year",  label:"来年",     start:()=>new Date(new Date().getFullYear()+1,0,1), end:()=>new Date(new Date().getFullYear()+1,11,31) },
] as const

export const TONE_COLOR: Record<string, string> = {
  positive: "#70DDA8",
  serious:  "#A07CF0",
  warning:  "#FFC96E",
  neutral:  "#8888A8",
}
