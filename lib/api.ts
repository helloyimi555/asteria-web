import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios"
import Cookies from "js-cookie"
import type {
  AuthTokens, BirthProfile, ProfileCreateInput, ProfileUpdateInput,
  NatalChart, TransitEvent, Reading, ReadingCreateInput,
  CompatResult, CompatCreateInput,
} from "@/types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/v1"

// ── Axios インスタンス ─────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
})

// アクセストークンをリクエストに自動付与
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401/403 で1回だけトークンリフレッシュを試み、失敗したらログアウト
// 同時多発の失敗でもリフレッシュは1回だけ実行する（in-flight promise を共有）
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refresh = Cookies.get("refresh_token")
  if (!refresh) throw new Error("no refresh token")
  // ※ リフレッシュ自体は素の axios を使う（api インスタンスを使うと
  //    リフレッシュが失敗した時に再びこの interceptor が走り無限ループになるため）
  const { data } = await axios.post<AuthTokens>(`${BASE_URL}/auth/refresh`, {
    refresh_token: refresh,
  })
  saveTokens(data)
  return data.access_token
}

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as (typeof err.config & { _retry?: boolean }) | undefined
    const status = err.response?.status

    if (original && !original._retry && (status === 401 || status === 403)) {
      original._retry = true   // この元リクエストは2回目以降リフレッシュしない（無限ループ防止）
      try {
        // 同時に複数リクエストが 401/403 になっても、リフレッシュは1回だけ
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null })
        }
        const newToken = await refreshPromise

        original.headers = original.headers ?? {}
        ;(original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`
        return api(original)   // 新トークンで元リクエストをリトライ
      } catch {
        clearTokens()
        if (typeof window !== "undefined") {
          window.location.href = "/asteria/auth/login"
        }
        return Promise.reject(err)
      }
    }
    return Promise.reject(err)
  }
)

// ── Token helpers ─────────────────────────────────────────────
export function saveTokens(tokens: AuthTokens) {
  Cookies.set("access_token",  tokens.access_token,  { expires: 1 / 24 }) // 1h
  Cookies.set("refresh_token", tokens.refresh_token,  { expires: 30 })
}

export function clearTokens() {
  Cookies.remove("access_token")
  Cookies.remove("refresh_token")
}

export function isLoggedIn(): boolean {
  return !!Cookies.get("access_token") || !!Cookies.get("refresh_token")
}

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string) =>
    api.post<AuthTokens>("/auth/register", { email, password }).then(r => r.data),

  login: (email: string, password: string) =>
    api.post<AuthTokens>("/auth/login", { email, password }).then(r => r.data),

  verifyEmail: (token: string) =>
    api.post<{ verified: boolean; email: string }>("/auth/verify-email", { token })
      .then((r: AxiosResponse<{ verified: boolean; email: string }>) => r.data),

  deleteAccount: () =>
    api.delete("/auth/account").then(r => r.data),
}

// ── Profiles ──────────────────────────────────────────────────
export interface DegreeMeaning {
  planet: string
  title:  string
  short:  string
  detail: string
}

export interface NatalMeaningResponse {
  profile_id: string
  meanings:   DegreeMeaning[]
}

export const profileApi = {
  list: () =>
    api.get<{ profiles: BirthProfile[] }>("/profiles").then(r => r.data.profiles),

  create: (input: ProfileCreateInput) =>
    api.post<BirthProfile & { natal_chart: NatalChart }>("/profiles", input).then(r => r.data),

  update: (profileId: string, input: ProfileUpdateInput) =>
    api.patch<BirthProfile>(`/profiles/${profileId}`, input).then(r => r.data),

  getNatalChart: (profileId: string) =>
    api.get<NatalChart>(`/profiles/${profileId}/natal-chart`, { timeout: 60_000 })
      .then((r: AxiosResponse<NatalChart>) => r.data),

  getNatalMeaning: (profileId: string) =>
    api.get<NatalMeaningResponse>(`/profiles/${profileId}/natal-meaning`, { timeout: 60_000 })
      .then((r: AxiosResponse<NatalMeaningResponse>) => r.data),

  getPersonality: (profileId: string, mbtiType?: string) =>
    api.post<any>(`/profiles/${profileId}/personality`, { mbti_type: mbtiType }).then(r => r.data),

  getTransits: (profileId: string, from: string, to: string, minImportance = 50) =>
    api.get<{ transits: TransitEvent[] }>(`/profiles/${profileId}/transits`, {
      params: { from, to, min_importance: minImportance },
    }).then(r => r.data.transits),

  delete: (profileId: string) =>
    api.delete(`/profiles/${profileId}`).then(r => r.data),
}

// ── Home (本日の星模様) ──────────────────────────────────────
export interface DailyHome {
  flow:              string
  moon_phase:        string
  main_theme:        string
  mood:              string
  moon_sign:         string
  observation_point?: string
  keywords:          string[]
}

export const homeApi = {
  daily: () =>
    api.get<DailyHome>("/home/daily", { timeout: 60_000 })
      .then((r: AxiosResponse<DailyHome>) => r.data),
}


// ── Readings ──────────────────────────────────────────────────
export const readingApi = {
  create: (input: ReadingCreateInput) =>
    api.post<{ reading_id: string; status: string; estimated_seconds: number }>(
      "/readings", input
    ).then(r => r.data),

  get: (readingId: string) =>
    api.get<Reading>(`/readings/${readingId}`).then(r => r.data),

  list: (params?: { profile_id?: string; limit?: number; offset?: number }) =>
    api.get<{ total: number; readings: Reading[] }>("/readings", { params }).then(r => r.data),

  /** ポーリングで completed になるまで待機（最大 timeoutMs） */
  pollUntilDone: async (readingId: string, timeoutMs = 30_000): Promise<Reading> => {
    const interval = 2_000
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      const reading = await readingApi.get(readingId)
      if (reading.status === "completed" || reading.status === "failed") return reading
      await new Promise(r => setTimeout(r, interval))
    }
    throw new Error("Reading timed out")
  },
}


// ── Guest Readings ────────────────────────────────────────────
// ゲスト用（認証インターセプターなし）
const guestApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,
  headers: { "Content-Type": "application/json" },
})

export const guestReadingApi = {
  create: (input: {
    birth_date: string
    birth_place_name: string
    theme: string
    period_start: string
    period_end: string
  }) =>
    guestApi.post<Reading>("/readings/guest", input).then(r => r.data),
}

export interface GuestPersonalityResult {
  type_name:    string
  personality:  string
  mbti_insight: string
  combined:     string
  strengths:    string[]
  challenges:   string[]
  life_theme:   string
  career:       string
  relationships: string
  natal_positions: Array<{
    planet:      string
    sign:        string
    sign_ja:     string
    degree:      number
    sign_degree: number
    house:       number | null
    retrograde:  boolean
  }>
}

export const guestPersonalityApi = {
  analyze: (input: {
    birth_date:        string
    birth_place_name?: string
    mbti_type?:        string
  }) =>
    guestApi.post<GuestPersonalityResult>("/profiles/personality/guest", input).then(r => r.data),
}



// ── Compat ────────────────────────────────────────────────────
export const compatApi = {
  create: (input: {
    my_birth_date: string
    my_birth_place_name: string
    my_birth_time?: string
    my_mbti_type?: string
    their_birth_date: string
    their_birth_place_name: string
    their_birth_time?: string
    their_mbti_type?: string
    relationship_type: string
  }) =>
    api.post("/compat", input).then(r => r.data),
}



// ── Masters ───────────────────────────────────────────────────
export const mastersApi = {
  planets: () => api.get("/masters/planets").then(r => r.data),
  signs:   () => api.get("/masters/signs").then(r => r.data),
  houses:  () => api.get("/masters/houses").then(r => r.data),
}

export default api
