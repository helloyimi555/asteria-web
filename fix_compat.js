const fs = require('fs');
const f = 'C:/Users/hello/Documents/占いアプリ/占星術_Asteria/asteria-web/app/compat/page.tsx';
let c = fs.readFileSync(f, 'utf8');

// 1. ラベルの * を削除
c = c.replace('出生地 *', '出生地（任意）');

// 2. ok の条件から place を外す
c = c.replace(
  'const ok = !!myDate && !!myForm.place.trim() && !!theirDate && !!theirForm.place.trim()',
  'const ok = !!myDate && !!theirDate'
);

// 3. APIに place が空の場合はデフォルト値を渡す
c = c.replace(
  'my_birth_place_name:   myForm.place,',
  'my_birth_place_name:   myForm.place || "東京都",'
);
c = c.replace(
  'their_birth_place_name: theirForm.place,',
  'their_birth_place_name: theirForm.place || "東京都",'
);

fs.writeFileSync(f, c, 'utf8');
console.log('done');
