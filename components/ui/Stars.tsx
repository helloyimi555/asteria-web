"use client"
import { useMemo } from "react"

export function Stars() {
  const stars = useMemo(() => {
    const h = (n: number) => {
      const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
      return x - Math.floor(x)
    }
    return Array.from({ length: 220 }, (_, i) => ({
      x:   h(i * 2) * 100,
      y:   h(i * 2 + 1) * 100,
      sz:  h(i * 3) > .97 ? 2.8 : h(i * 3) > .90 ? 1.9 : 1.1,
      dur: 2 + h(i * 7) * 4,
      del: h(i * 11) * 4,
      op:  0.4 + h(i * 13) * 0.6,
    }))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left:    `${s.x}%`,
            top:     `${s.y}%`,
            width:   s.sz,
            height:  s.sz,
            opacity: s.op,
            "--duration": `${s.dur}s`,
            "--delay":    `${s.del}s`,
          } as React.CSSProperties}
        />
      ))}
      <div className="absolute top-[5%] left-[8%] w-96 h-96 rounded-full opacity-[0.08]"
        style={{ background:"radial-gradient(circle,rgba(80,50,180,1) 0%,transparent 70%)", filter:"blur(40px)" }} />
      <div className="absolute top-[55%] right-[5%] w-80 h-80 rounded-full opacity-[0.07]"
        style={{ background:"radial-gradient(circle,rgba(50,100,200,1) 0%,transparent 70%)", filter:"blur(40px)" }} />
    </div>
  )
}
