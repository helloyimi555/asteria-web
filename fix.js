const fs = require('fs');
const f = 'C:/Users/hello/Documents/占いアプリ/占星術_Asteria/asteria-web/app/mypage/page.tsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(
  'const [localProfile, setLocalProfile] = useState<any>(null)',
  'const [localProfile, setLocalProfile] = useState<any>(() => {\n    if (typeof window === "undefined") return null\n    try {\n      const saved = localStorage.getItem("asteria_profile")\n      return saved ? JSON.parse(saved) : null\n    } catch {\n      return null\n    }\n  })'
);
fs.writeFileSync(f, c, 'utf8');
console.log('done');
