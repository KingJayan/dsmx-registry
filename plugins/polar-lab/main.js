const TAU = 6.2832;
const COLORS = ['pink', 'purple', 'blue', 'green', 'orange', 'red'];

const FAMILIES = {
  rose: {
    label: 'rose',
    detail: 'k petals, or 2k when k is even',
    point: (k, size) => [
      `${size}*cos(${k}*t)*cos(t)`,
      `${size}*cos(${k}*t)*sin(t)`,
    ],
  },
  spiral: {
    label: 'spiral',
    detail: 'k turns out to the edge',
    point: (k, size) => [
      `(${(size / (k * TAU)).toFixed(4)}*t)*cos(t)`,
      `(${(size / (k * TAU)).toFixed(4)}*t)*sin(t)`,
    ],
  },
  epicycloid: {
    label: 'epicycloid',
    detail: 'a circle rolled around a circle, k cusps',
    point: (k, size) => {
      const r = (size / (k + 2)).toFixed(4);
      return [
        `${r}*${k + 1}*cos(t) - ${r}*cos(${k + 1}*t)`,
        `${r}*${k + 1}*sin(t) - ${r}*sin(${k + 1}*t)`,
      ];
    },
  },
  hypocycloid: {
    label: 'hypocycloid',
    detail: 'rolled inside instead, k cusps',
    point: (k, size) => {
      const r = (size / k).toFixed(4);
      return [
        `${r}*${k - 1}*cos(t) + ${r}*cos(${k - 1}*t)`,
        `${r}*${k - 1}*sin(t) - ${r}*sin(${k - 1}*t)`,
      ];
    },
  },
};

const settings = {
  family: dsmx.globalState.get('family', 'rose'),
  k: dsmx.globalState.get('k', 5),
  size: dsmx.globalState.get('size', 4),
  layers: dsmx.globalState.get('layers', 1),
  fade: dsmx.globalState.get('fade', true),
};

dsmx.globalState.setKeysForSync(['family', 'k', 'size', 'layers', 'fade']);

function whole(value, what, low, high) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < low || n > high) {
    throw new Error(`${what} must be a whole number from ${low} to ${high}`);
  }
  return n;
}

function positive(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function curve(name, family, k, size, color, opacity) {
  const shape = FAMILIES[family];
  if (!shape) throw new Error(`no polar family called '${family}'`);
  const [x, y] = shape.point(k, size);
  const style = opacity < 1
    ? `as { color ${color} opacity ${opacity.toFixed(2)} lineWidth 2 }`
    : `as { color ${color} lineWidth 2 }`;
  return `curve ${name} (t in 0..${(TAU * turns(family, k)).toFixed(4)}) { (${x}, ${y}) } ${style}`;
}

function turns(family, k) {
  if (family === 'spiral') return k;
  return k % 2 === 0 ? 2 : 1;
}

function stack(family, k, size, layers) {
  const lines = [];
  for (let i = 0; i < layers; i++) {
    const shrink = 1 - (i * 0.16);
    const opacity = settings.fade ? 1 - (i * 0.7) / Math.max(layers, 1) : 1;
    lines.push(curve(
      `${family}_${k}_${i}`,
      family,
      family === 'spiral' ? k : k + i,
      size * shrink,
      COLORS[i % COLORS.length],
      Math.max(opacity, 0.15),
    ));
  }
  return lines.join('\n');
}

dsmx.macro('polar', (family, k, size) => {
  const name = typeof family === 'string' ? family : 'rose';
  if (!FAMILIES[name]) throw new Error(`@polar takes one of ${Object.keys(FAMILIES).join(', ')}`);
  return curve(`${name}_${whole(k, 'the second argument', 2, 60)}`, name, whole(k, 'k', 2, 60), positive(size, 4), 'pink', 1);
});

dsmx.macro('polar_stack', (family, k, layers) => {
  const name = typeof family === 'string' ? family : 'rose';
  if (!FAMILIES[name]) throw new Error(`@polar_stack takes one of ${Object.keys(FAMILIES).join(', ')}`);
  return stack(name, whole(k, 'k', 2, 40), 4, whole(layers, 'the layer count', 1, 6));
});

dsmx.macro('polar_grid', (size, gap) => {
  const n = whole(size, 'the grid size', 1, 5);
  const step = positive(gap, 5);
  const names = Object.keys(FAMILIES);

  const lines = [];
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const family = names[(row * n + col) % names.length];
      const k = row + col + 2;
      const shape = FAMILIES[family];
      const scale = step * 0.4;
      const [x, y] = shape.point(k, scale);
      const cx = (col * step).toFixed(2);
      const cy = (-row * step).toFixed(2);
      lines.push(
        `curve ${family}_${row}_${col} (t in 0..${(TAU * turns(family, k)).toFixed(4)}) `
        + `{ (${cx} + ${x}, ${cy} + ${y}) } as { color ${COLORS[(row + col) % COLORS.length]} }`,
      );
    }
  }
  return lines.join('\n');
});

function preview() {
  return `@polar_stack("${settings.family}", ${settings.k}, ${settings.layers})\n`;
}

function widgets() {
  const shape = FAMILIES[settings.family];
  return [
    {
      kind: 'select',
      id: 'family',
      label: 'family',
      value: settings.family,
      options: Object.entries(FAMILIES).map(([value, f]) => ({ value, label: f.label })),
    },
    { kind: 'label', text: shape.detail, muted: true },
    { kind: 'slider', id: 'k', label: 'k', value: settings.k, min: 2, max: 24, step: 1 },
    { kind: 'slider', id: 'size', label: 'size', value: settings.size, min: 1, max: 12, step: 1 },
    { kind: 'slider', id: 'layers', label: 'layers', value: settings.layers, min: 1, max: 6, step: 1 },
    { kind: 'checkbox', id: 'fade', label: 'fade the layers', value: settings.fade },
    { kind: 'separator' },
    { kind: 'label', text: preview().trim(), muted: true },
    { kind: 'button', id: 'insert', label: 'insert', primary: true },
    { kind: 'button', id: 'reset', label: 'reset' },
  ];
}

function refresh() {
  dsmx.window.updateView('shaper', widgets());
  dsmx.window.registerStatusBarItem({
    id: 'shape',
    text: `${FAMILIES[settings.family].label} k=${settings.k}`,
    tooltip: 'Polar Lab — click to insert this curve',
    command: 'insert',
  });
}

async function set(key, value) {
  settings[key] = value;
  await dsmx.globalState.update(key, value);
  refresh();
}

dsmx.window.registerView({ id: 'shaper', title: 'polar lab', widgets: widgets() }, (widget, value) => {
  if (widget === 'insert') { void insert(); return; }
  if (widget === 'reset') {
    void Promise.all([set('family', 'rose'), set('k', 5), set('size', 4), set('layers', 1), set('fade', true)]);
    return;
  }
  void set(widget, value);
});

async function insert() {
  await dsmx.editor.insert(preview());
  await dsmx.window.showInformationMessage(`Inserted a ${settings.layers > 1 ? 'stack of ' : ''}${FAMILIES[settings.family].label}.`);
}

dsmx.commands.registerCommand('insert', 'polar lab: insert the shape in the panel', () => ({ insert: preview() }));

dsmx.commands.registerCommand('cycle', 'polar lab: next family', async () => {
  const names = Object.keys(FAMILIES);
  await set('family', names[(names.indexOf(settings.family) + 1) % names.length]);
  return { status: `Polar Lab: ${FAMILIES[settings.family].label}` };
});

dsmx.commands.registerCommand('grid', 'polar lab: insert a 3x3 sampler', () => ({ insert: '@polar_grid(3, 5)\n' }));

dsmx.keybindings.register('Alt+P', 'insert');
dsmx.keybindings.register('Alt+Shift+P', 'cycle');

dsmx.menus.register('editor', 'insert', 'Insert polar curve');
dsmx.menus.register('graph', 'grid', 'Insert a polar sampler');

refresh();
