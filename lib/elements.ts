// 星座→エレメントのマッピング
export type Element = "fire" | "earth" | "air" | "water"

export const SIGN_ELEMENT: Record<string, Element> = {
  Aries: "fire",  Leo: "fire",   Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air",   Libra: "air",   Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
}

// 天体の重み（個人天体ほど大きい）
export const PLANET_WEIGHT: Record<string, number> = {
  Sun: 3, Moon: 3, Mercury: 2, Venus: 2, Mars: 2,
  Jupiter: 1, Saturn: 1, Uranus: 1, Neptune: 1, Pluto: 1,
}

// エレメント情報（日本語名・説明・カラー）
export const ELEMENT_INFO: Record<Element, { ja: string; desc: string; color: string }> = {
  fire:  { ja: "火", desc: "情熱・行動・直感・始まり",   color: "#FF6B6B" },
  earth: { ja: "地", desc: "安定・現実・実務・五感",     color: "#98C379" },
  air:   { ja: "風", desc: "知性・会話・情報・つながり", color: "#61AFEF" },
  water: { ja: "水", desc: "感情・共感・直感・癒し",     color: "#56B6C2" },
}

export const ELEMENTS: Element[] = ["fire", "earth", "air", "water"]

export type ElementBalance = Record<Element, number>

/** ネイタルチャートの天体配置からエレメントバランス（生スコア）を算出 */
export function calcElementBalance(planets: { planet: string; sign: string }[]): ElementBalance {
  const balance: ElementBalance = { fire: 0, earth: 0, air: 0, water: 0 }
  for (const p of planets) {
    const el = SIGN_ELEMENT[p.sign]
    const w  = PLANET_WEIGHT[p.planet] ?? 1
    if (el) balance[el] += w
  }
  return balance
}

/** 4エレメント合計に対する各エレメントの割合（0-100）を返す */
export function elementPercents(balance: ElementBalance): Record<Element, number> {
  const total = ELEMENTS.reduce((s, e) => s + balance[e], 0) || 1
  return {
    fire:  Math.round(balance.fire  / total * 100),
    earth: Math.round(balance.earth / total * 100),
    air:   Math.round(balance.air   / total * 100),
    water: Math.round(balance.water / total * 100),
  }
}

/** バランスから最も大きいエレメントを取得 */
export function getDominantElement(balance: ElementBalance): Element {
  return ELEMENTS.reduce((best, el) => balance[el] > balance[best] ? el : best, "fire" as Element)
}

/** エレメント称号（例：「水と火のタイプ」） */
export function getElementTitle(balance: ElementBalance): string {
  const sorted = ELEMENTS
    .map(e => ({ e, score: balance[e] }))
    .sort((a, b) => b.score - a.score)
  const [top1, top2] = sorted
  if (!top1 || top1.score === 0) return "バランスタイプ"
  // 二位スコアが一位の半分以上あれば二元素タイプ
  if (top2 && top2.score >= top1.score / 2 && top2.score > 0) {
    return `${ELEMENT_INFO[top1.e].ja}と${ELEMENT_INFO[top2.e].ja}のタイプ`
  }
  return `${ELEMENT_INFO[top1.e].ja}のタイプ`
}

// エレメント同士の組み合わせ説明（キーはアルファベット順に sort して結合）
const ELEMENT_COMPATIBILITY: Record<string, string> = {
  "fire-fire":   "情熱の共鳴。お互いを刺激し合うエネルギッシュな関係",
  "earth-earth": "堅実で安定した、現実的なパートナーシップ",
  "air-air":     "言葉の通じやすさ。知的な共鳴のある関係",
  "water-water": "感情の深い理解。共感に満ちた関係",
  "air-fire":    "情熱が知性に火を灯す、自然な補完関係",
  "earth-water": "現実が感情に器を与える、自然な補完関係",
  "earth-fire":  "勢いと安定。お互いに新鮮な発見をもたらす",
  "air-water":   "知性と感性。新しい視点をもたらし合う関係",
  "fire-water":  "情熱と感情のドラマ。刺激的な学びがある関係",
  "air-earth":   "現実と理論。視点の違いから学び合う関係",
}

/** 二人の主要エレメントから相性説明を返す */
export function getElementCompatibility(a: Element, b: Element): string {
  const key = [a, b].sort().join("-")
  return ELEMENT_COMPATIBILITY[key] ?? "ふたりのバランスを大切に"
}
