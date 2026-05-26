const fs = require('fs');
const f = 'C:/Users/hello/Documents/占いアプリ/占星術_Asteria/asteria-web/app/mypage/page.tsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(
  'const handleFetchPersonality = async () => {\n    if (!profile) return',
  'const handleFetchPersonality = async () => {\n    if (!profile) return\n    if (!profile.birth_date) {\n      alert("生年月日を登録してから性格分析を行ってください")\n      return\n    }'
);
fs.writeFileSync(f, c, 'utf8');
console.log('done');
