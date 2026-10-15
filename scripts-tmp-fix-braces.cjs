const fs = require('fs');

function fix(file, count) {
  let s = fs.readFileSync(file, 'utf8');
  const bad = "        ],\n          },\n        ],\n      },";
  const good = "        ],\n      },";
  let n = 0;
  while (s.includes(bad)) { s = s.replace(bad, good); n++; }
  console.log(file, 'fixed', n, 'expected', count);
  if (n !== count) process.exitCode = 1;
  fs.writeFileSync(file, s);
}

fix('lib/previewScenarios.ts', 2);
fix('lib/scenarios.ts', 1);
