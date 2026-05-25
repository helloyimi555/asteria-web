const fs = require('fs');
const f = 'C:/Users/hello/Documents/占いアプリ/占星術_Asteria/asteria-web/app/reading/page.tsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(
  'if (p.birth_place_name) setPlace(p.birth_place_name)',
  'if (p.birth_place_name) setPlace(p.birth_place_name)\n          if (p.mbti_type) setMbti(p.mbti_type)'
);
fs.writeFileSync(f, c, 'utf8');
console.log('done');
