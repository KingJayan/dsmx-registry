const TAU = 6.2832;

// a frequency reaches the generated names, so it has to be something a name can hold
function tag(value) {
  return String(value).replace(/[^0-9]/g, '_');
}

function ratio(value, what) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`@lissajous needs a positive ${what}`);
  return n;
}

function curve(name, a, b, delta, cx, cy, scale) {
  const x = `${cx} + ${scale}*sin(${a}*t + ${delta})`;
  const y = `${cy} + ${scale}*sin(${b}*t)`;
  return `curve ${name} (t in 0..${TAU}) { (${x}, ${y}) }`;
}

dsmx.macro('lissajous', (a, b, delta) => {
  const fa = ratio(a, 'x frequency');
  const fb = ratio(b, 'y frequency');
  const phase = Number(delta) || 0;
  return curve(`liss_${tag(fa)}_${tag(fb)}`, fa, fb, phase, 0, 0, 1);
});

// the classic table: every x frequency against every y frequency
dsmx.macro('lissajous_grid', (size, gap) => {
  const n = Math.floor(Number(size));
  if (!Number.isFinite(n) || n < 1 || n > 6) throw new Error('@lissajous_grid takes 1 to 6');
  const step = Number(gap) > 0 ? Number(gap) : 2.6;

  const lines = [];
  for (let row = 1; row <= n; row++) {
    for (let col = 1; col <= n; col++) {
      lines.push(curve(
        `liss_${row}_${col}`,
        col, row,
        Math.PI / 2,
        (col - 1) * step,
        (n - row) * step,
        step * 0.42,
      ));
    }
  }
  return lines.join('\n');
});

dsmx.command('insert', 'lissajous: insert a 3:2 figure', () => ({
  insert: '@lissajous(3, 2, 1.5708)\n',
}));

dsmx.command('grid', 'lissajous: insert a 4x4 grid', () => ({
  insert: '@lissajous_grid(4)\n',
}));
