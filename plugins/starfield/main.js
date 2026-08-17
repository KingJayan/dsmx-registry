const GOLDEN = Math.PI * (3 - Math.sqrt(5));

const MAX_POINTS = 400;

function clampCount(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 1) throw new Error('@stars needs a count of 1 or more');
  if (n > MAX_POINTS) throw new Error(`@stars stops at ${MAX_POINTS} points`);
  return n;
}

dsmx.macro('stars', (count, radius, color) => {
  const n = clampCount(count);
  const r = Number(radius) > 0 ? Number(radius) : 5;
  const paint = typeof color === 'string' ? color : 'yellow';

  const lines = [];
  for (let i = 0; i < n; i++) {
    const angle = i * GOLDEN;
    const dist = r * Math.sqrt((i + 0.5) / n);
    const x = (dist * Math.cos(angle)).toFixed(4);
    const y = (dist * Math.sin(angle)).toFixed(4);
    lines.push(`point star_${i} (${x}, ${y}) as { color ${paint} pointSize 5 }`);
  }
  return lines.join('\n');
});

dsmx.command('insert', 'starfield: insert 120 stars', () => ({
  insert: '@stars(120, 6)\n',
}));
