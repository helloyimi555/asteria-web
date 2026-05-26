const fs = require('fs');
const f = 'C:/Users/hello/Documents/占いアプリ/占星術_Asteria/asteria-web/components/ui/AstrologyLoading.tsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(
  'className="w-full whitespace-nowrap text-[24px] leading-relaxed tracking-[0.08em] text-[#F6F1E4]/95"',
  'className="w-full text-center text-[20px] leading-relaxed tracking-[0.08em] text-[#F6F1E4]/95"'
);
c = c.replace(
  'className="w-full whitespace-nowrap mt-8 text-[13px] leading-loose tracking-[0.12em] text-[#F6F1E4]/58"',
  'className="w-full text-center mt-8 text-[13px] leading-loose tracking-[0.12em] text-[#F6F1E4]/58"'
);
fs.writeFileSync(f, c, 'utf8');
console.log('done');
