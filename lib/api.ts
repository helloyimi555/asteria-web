import axios, { AxiosError, AxiosInstance } from "axios"
import Cookies from "js-cookie"
import type {
  AuthTokens, BirthProfile, ProfileCreateInput,
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

// 401 でリフレッシュを試み、失敗したらログアウト
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as typeof err.config & { _retry?: boolean }
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = Cookies.get("refresh_token")
        if (!refresh) throw new Error("no refresh token")
        const { data } = await axios.post<AuthTokens>(`${BASE_URL}/auth/refresh`, {
          refresh_token: refresh,
        })
        saveTokens(data)
        original.headers!.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        clearTokens()
        window.location.href = "/auth/login"
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

  deleteAccount: () =>
    api.delete("/auth/account").then(r => r.data),
}

// ── Profiles ──────────────────────────────────────────────────
export const profileApi = {
  list: () =>
    api.get<{ profiles: BirthProfile[] }>("/profiles").then(r => r.data.profiles),

  create: (input: ProfileCreateInput) =>
    api.post<BirthProfile & { natal_chart: NatalChart }>("/profiles", input).then(r => r.data),

  getNatalChart: (profileId: string) =>
    api.get<NatalChart>(`/profiles/${profileId}/natal-chart`).then(r => r.data),

  getTransits: (profileId: string, from: string, to: string, minImportance = 50) =>
    api.get<{ transits: TransitEvent[] }>(`/profiles/${profileId}/transits`, {
      params: { from, to, min_importance: minImportance },
    }).then(r => r.data.transits),

  delete: (profileId: string) =>
    api.delete(`/profiles/${profileId}`).then(r => r.data),
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
export const guestReadingApi = {
  create: (input: {
    birth_date: string
    birth_place_name: string
    theme: string
    period_start: string
    period_end: string
  }) =>
    api.post<Reading>("/readings/guest", input).then(r => r.data),
}



// ── Masters ───────────────────────────────────────────────────
export const mastersApi = {
  planets: () => api.get("/masters/planets").then(r => r.data),
  signs:   () => api.get("/masters/signs").then(r => r.data),
  houses:  () => api.get("/masters/houses").then(r => r.data),
}

export default api
