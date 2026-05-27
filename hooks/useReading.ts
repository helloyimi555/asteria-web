import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { readingApi, profileApi } from "@/lib/api"
import type { ReadingCreateInput } from "@/types"

// ── プロフィール一覧 ───────────────────────────────────────────
export function useProfiles() {
  return useSWR("profiles", profileApi.list, {
    revalidateOnFocus: false,
  })
}

// ── 鑑定作成 + ポーリング ─────────────────────────────────────
export function useCreateReading() {
  return useSWRMutation(
    "readings/create",
    async (_key: string, { arg }: { arg: ReadingCreateInput }) => {
      const { reading_id } = await readingApi.create(arg)
      const result = await readingApi.pollUntilDone(reading_id)
      return result
    }
  )
}

// ── 鑑定結果取得 ──────────────────────────────────────────────
export function useReading(readingId: string | null) {
  return useSWR(
    readingId ? `reading/${readingId}` : null,
    () => readingApi.get(readingId!),
    {
      // completed/failed になったらポーリング停止
      refreshInterval: (data) =>
        data?.status === "completed" || data?.status === "failed" ? 0 : 2000,
      revalidateOnFocus: false,
    }
  )
}

// ── 鑑定履歴 ─────────────────────────────────────────────────
export function useReadingHistory(profileId?: string, limit = 20) {
  return useSWR(
    `readings/history/${profileId ?? "all"}/${limit}`,
    () => readingApi.list({ profile_id: profileId, limit }),
    { revalidateOnFocus: false }
  )
}

// ── ネイタルチャート ──────────────────────────────────────────
export function useNatalChart(profileId: string | null) {
  return useSWR(
    profileId ? `natal/${profileId}` : null,
    () => profileApi.getNatalChart(profileId!),
    { revalidateOnFocus: false }
  )
}
