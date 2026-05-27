"use client"

/** 03. 入力のヒントボックス（鍵アイコン付き）
 *  フォーム近くに置く補足説明。ASTERIA デザインシステム 03. INPUT FORMS */
export function HintBox({
  title = "入力のヒント",
  items,
}: {
  title?: string
  items: string[]
}) {
  return (
    <div className="rounded-xl p-3.5"
      style={{ background: "rgba(201,165,84,.05)", border: "1px solid rgba(201,165,84,.25)" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-gold text-sm">🔒</span>
        <span className="font-serif text-[12px] font-bold text-gold tracking-wide">{title}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="font-sans text-[11px] text-white/55 leading-relaxed pl-3 relative">
            <span className="absolute left-0 text-gold/50">・</span>{it}
          </li>
        ))}
      </ul>
    </div>
  )
}
