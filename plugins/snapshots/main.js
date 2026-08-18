const LIMIT = 12;

let snaps = dsmx.workspaceState.get('snaps', []);
let draft = '';

function stamp() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function size(text) {
  const lines = text.split('\n').length;
  return `${lines} line${lines === 1 ? '' : 's'}`;
}

function rows() {
  if (snaps.length === 0) {
    return [{ kind: 'label', text: 'No snapshots for this folder yet.', muted: true }];
  }
  return [{
    kind: 'rows',
    rows: snaps.map((s, i) => ({
      id: `open_${i}`,
      title: s.name,
      detail: `${s.at} · ${size(s.text)}`,
    })),
  }];
}

function widgets() {
  return [
    { kind: 'input', id: 'name', label: 'name', value: draft, placeholder: 'before the rewrite' },
    { kind: 'button', id: 'save', label: 'take a snapshot', primary: true },
    { kind: 'separator' },
    ...rows(),
    ...(snaps.length ? [{ kind: 'button', id: 'clear', label: 'forget them all' }] : []),
  ];
}

function refresh() {
  dsmx.window.updateView('list', widgets());
  if (snaps.length) {
    dsmx.window.registerStatusBarItem({
      id: 'count',
      text: `${snaps.length} snapshot${snaps.length === 1 ? '' : 's'}`,
      tooltip: 'Snapshots — click to take another',
      command: 'save',
    });
  } else {
    dsmx.window.removeStatusBarItem('count');
  }
}

async function write() {
  await dsmx.workspaceState.update('snaps', snaps);
  refresh();
}

async function save() {
  const text = await dsmx.editor.getText();
  if (!text.trim()) {
    await dsmx.window.showWarningMessage('There is nothing in the editor to keep.');
    return;
  }

  const name = draft.trim() || `snapshot ${snaps.length + 1}`;
  snaps = [{ name, at: stamp(), text }, ...snaps.filter(s => s.name !== name)].slice(0, LIMIT);
  draft = '';
  await write();
  await dsmx.window.showInformationMessage(`Kept "${name}" — ${size(text)}.`);
}

async function restore(index) {
  const snap = snaps[index];
  if (!snap) return;

  const current = await dsmx.editor.getText();
  if (current.trim() && current !== snap.text) {
    snaps = [{ name: 'before restore', at: stamp(), text: current }, ...snaps].slice(0, LIMIT);
  }

  await dsmx.editor.setText(snap.text);
  await write();
  await dsmx.window.showInformationMessage(`Back to "${snap.name}".`);
}

async function clear() {
  snaps = [];
  await write();
  await dsmx.window.showInformationMessage('Snapshots for this folder are gone.');
}

dsmx.window.registerView({ id: 'list', title: 'snapshots', widgets: widgets() }, (widget, value) => {
  if (widget === 'name') { draft = String(value ?? ''); return; }
  if (widget === 'save') { void save(); return; }
  if (widget === 'clear') { void clear(); return; }

  const index = /^open_(\d+)$/.exec(widget);
  if (index) void restore(Number(index[1]));
});

dsmx.commands.registerCommand('save', 'snapshots: keep the file as it is now', async () => {
  await save();
});

dsmx.commands.registerCommand('restore', 'snapshots: back to the last one', async () => {
  if (snaps.length === 0) return { status: 'There is nothing to go back to' };
  await restore(0);
});

dsmx.commands.registerCommand('where', 'snapshots: where they are kept', () => ({
  status: dsmx.storageUri
    ? `Snapshots follow this folder. Files go in ${dsmx.storageUri}`
    : 'Save the file first — snapshots follow the folder it sits in',
}));

dsmx.keybindings.register('Alt+S', 'save');
dsmx.keybindings.register('Alt+Shift+S', 'restore');

dsmx.menus.register('editor', 'save', 'Take a snapshot');
dsmx.menus.register('editor', 'restore', 'Back to the last snapshot');
dsmx.menus.register('plugins', 'where', 'Where are snapshots kept?');

refresh();
