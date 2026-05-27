// ── Auth ─────────────────────────────────────────────────────
export interface AuthTokens {
  access_token:  string
  refresh_token: string
  token_type:    string
  expires_in:    number
}

export interface User {
  id:         string
  email:      string
  plan:       "free" | "premium" | "admin"
  created_at: string
}

// ── Birth Profile ─────────────────────────────────────────────
export interface BirthProfile {
  id:                 string
  display_name:       string
  birth_place_name:   string
  birth_timezone:     string
  birth_time_unknown: boolean
  mbti_type?:         string | null
  created_at:         string
}

export interface ProfileCreateInput {
  display_name:       string
  birth_date:         string   // YYYY-MM-DD
  birth_time?:        string   // HH:MM
  birth_time_unknown: boolean
  birth_place_name:   string
  mbti_type?:         string | null
}

export interface ProfileUpdateInput {
  display_name?:       string
  birth_date?:         string
  birth_time?:         string
  birth_time_unknown?: boolean
  birth_place_name?:   string
  mbti_type?:         string | null
}

// ── Natal Chart ───────────────────────────────────────────────
export interface PlanetPosition {
  planet:      string
  sign:        string
  sign_ja:     string
  degree:      number
  sign_degree: number
  house:       number | null
  retrograde:  boolean
}

export interface NatalChart {
  profile_id: string
  planets:    PlanetPosition[]
}

// ── Transit ───────────────────────────────────────────────────
export interface TransitEvent {
  transit_planet: string
  natal_target:   string
  aspect:         string
  orb:            number
  date:           string
  importance:     number
  theme?:         string
  tone?:          string
}

// ── Reading ───────────────────────────────────────────────────
export type ReadingTheme =
  | "general" | "work" | "love"
  | "health"  | "money" | "relationship"

export type ReadingPeriod = "month" | "half2" | "year"

export interface ReadingCreateInput {
  profile_id:   string
  theme:        ReadingTheme
  period_start: string  // YYYY-MM-DD
  period_end:   string
}

export interface ReadingSection {
  tag?:     string  // "🌟 絶好調" | "✨ 好調" | "⚠️ 注意" | "😶 低調"
  summary?: string  // 20字以内
  content:  string
}

// 旧データは string のまま返ってくる可能性があるので union で受ける
export type ReadingSectionData = string | ReadingSection

export interface ReadingOutputs {
  overall?:      ReadingSectionData
  work?:         ReadingSectionData
  love?:         ReadingSectionData
  health?:       ReadingSectionData
  caution?:      ReadingSectionData
  advice?:       string
  lucky_action?: string
  keywords?:     string[]
  headline?:     string
}

export interface ReadingHighlight {
  date:            string
  title:           string
  description?:    string
  highlight_type:  "lucky_day" | "caution_day" | "key_event"
  importance?:     number
}

export interface Reading {
  reading_id:        string
  status:            "pending" | "processing" | "completed" | "failed"
  theme:             ReadingTheme
  outputs:           ReadingOutputs | null
  highlights:        ReadingHighlight[] | null
  natal_positions?:  PlanetPosition[]
  birth_profile_id?: string | null
  period_start?:     string | null
  period_end?:       string | null
  created_at:        string
}

// ── Compatibility ─────────────────────────────────────────────
export type RelationType = "partner" | "friend" | "work"

export interface CompatCreateInput {
  my_birth_date:   string
  my_birth_time?:  string
  my_place:        string
  their_birth_date: string
  their_birth_time?: string
  their_place:     string
  relation_type:   RelationType
}

export interface ThemeResult {
  tag:  "◎" | "○" | "△"
  text: string
}

export interface CompatResult {
  headline:              string
  relationship:          string
  love:                  ThemeResult
  communication:         ThemeResult
  lifestyle:             ThemeResult
  caution:               ThemeResult
  keywords:              string[]
  good_timing:           string
  good_timing_reason:    string
  caution_timing:        string
  caution_timing_reason: string
  advice:                string
}

// ── Masters ───────────────────────────────────────────────────
export interface PlanetMeaning {
  planet:      string
  name_ja:     string
  symbol:      string
  keywords:    string[]
  description: string
  cycle_years: number | null
  category:    string
}

export interface SignMeaning {
  sign:          string
  name_ja:       string
  symbol:        string
  element:       string
  modality:      string
  ruling_planet: string
  keywords:      string[]
  description:   string
}

export interface HouseMeaning {
  house_number: number
  name_ja:      string
  keywords:     string[]
  description:  string
  themes:       Record<string, string> | null
}

// ── UI ────────────────────────────────────────────────────────
export interface ZodiacSign {
  sign:    string
  en:      string
  symbol:  string
  element: string
  color:   string
}
