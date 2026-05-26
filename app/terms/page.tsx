"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Stars } from "@/components/ui/Stars"

const TERMS = `第1条（サービスの目的）
ASTERIAは、西洋占星術をベースにしたエンターテインメントサービスです。提供する鑑定・相性診断・性格分析はすべて娯楽を目的としており、占星術的な解釈に基づくものです。

第2条（禁止事項）
以下の行為を禁止します。
・サービスの不正利用、リバースエンジニアリング
・他のユーザーへの迷惑行為
・法令に違反する行為

第3条（サービスの変更・終了）
当社は、予告なくサービス内容の変更・停止・終了を行う場合があります。これによりユーザーに生じた損害について責任を負いません。

第4条（準拠法・管轄）
本規約は日本法に準拠し、東京地方裁判所を第一審の専属的合意管轄裁判所とします。

制定日：2026年5月26日
運営：株式会社Mediowl`

const DISCLAIMERS = `■ エンターテインメント目的について
ASTERIAが提供する占星術鑑定・相性診断・性格分析は、すべてエンターテインメントを目的としたものです。鑑定結果は参考情報であり、医療・法律・財務・人生の重大な意思決定の根拠として使用しないでください。

■ 結果の正確性について
AIおよび占星術的アルゴリズムによって生成される鑑定内容の正確性・完全性・有用性を保証するものではありません。

■ 損害について
本サービスの利用によって生じたいかなる損害（直接・間接を問わず）についても、株式会社Mediowlは責任を負いません。

■ 外部サービスについて
本サービスはGoogle Gemini APIを利用しています。外部サービスの障害・変更による影響について当社は責任を負いません。

運営：株式会社Mediowl`

const PRIVACY = `第1条（取得する情報）
本サービスでは以下の情報を取得します。
・メールアドレス（認証用）
・生年月日・出生時刻・出生地（鑑定用）
・MBTIタイプ（任意入力）
・利用ログ（GA4による匿名統計情報）

第2条（利用目的）
取得した情報は以下の目的で利用します。
・占星術鑑定・相性診断・性格分析の提供
・サービス改善・統計分析
・メール認証・お問い合わせへの対応

第3条（第三者提供）
以下の場合を除き、個人情報を第三者に提供しません。
・法令に基づく場合
・ユーザーの同意がある場合

第4条（利用する外部サービス）
・Google Gemini API（鑑定生成）
・Google Analytics 4（匿名アクセス解析）
・Resend（メール送信）
・Railway PostgreSQL（データ保管）

第5条（データの削除）
個人データの削除を希望される場合は、info@mediowl.co.jp までメールにてご連絡ください。

第6条（お問い合わせ）
プライバシーに関するお問い合わせは info@mediowl.co.jp までご連絡ください。

制定日：2026年5月26日
運営：株式会社Mediowl`

const TABS = [
  { id: "terms",       label: "利用規約",             content: TERMS },
  { id: "disclaimers", label: "免責事項",             content: DISCLAIMERS },
  { id: "privacy",     label: "プライバシーポリシー", content: PRIVACY },
] as const

export default function TermsPage() {
  const router = useRouter()
  const [tab, setTab] = useState(0)
  const current = TABS[tab]

  return (
    <div className="relative min-h-screen pb-16">
      <Stars />
      <div className="relative z-10 max-w-app mx-auto px-5 pt-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-[12px] text-white/45 hover:text-white/75 transition-colors inline-flex items-center gap-1 mb-4"
        >
          ← 戻る
        </button>

        <div className="text-center mb-6">
          <Link href="/" className="font-serif text-[15px] tracking-widest shimmer-gold">
            ✦ ASTERIA ✦
          </Link>
          <h1 className="font-serif text-[20px] text-[#F0F0F8] mt-3">規約・ポリシー</h1>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex rounded-xl overflow-hidden"
          style={{ background: "rgba(20,25,60,.7)", border: "1px solid rgba(255,255,255,.1)" }}>
          {TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(i)}
              className="flex-1 py-3 text-[11px] transition-all font-sans leading-tight"
              style={{
                color:        tab === i ? "#C9A554" : "rgba(255,255,255,.5)",
                borderBottom: tab === i ? "2px solid #C9A554" : "2px solid transparent",
                background:   tab === i ? "rgba(201,165,84,.08)" : "transparent",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gold text-sm">✦</span>
            <h2 className="font-serif text-[15px] text-[#F0F0F8]">{current.label}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gold/30 to-transparent" />
          </div>
          <div className="text-[12px] leading-7 text-[#D0D0E8] whitespace-pre-wrap break-words font-sans">
            {current.content}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-[12px] text-gold/70 hover:text-gold underline">
            トップへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
