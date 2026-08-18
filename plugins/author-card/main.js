const STYLES = {
  corner: { label: 'corner', at: [-9, -9], size: 14 },
  title: { label: 'title', at: [0, 9], size: 22 },
  footer: { label: 'footer', at: [0, -9], size: 16 },
};

let handle = '';
let style = dsmx.globalState.get('style', 'corner');
let colour = dsmx.globalState.get('colour', 'grey');
let showDate = dsmx.globalState.get('showDate', false);

dsmx.globalState.setKeysForSync(['style', 'colour', 'showDate']);

function quoted(text) {
  return text.replace(/["\\]/g, '');
}

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function card() {
  if (!handle) throw new Error('set a handle in the panel first');
  const shape = STYLES[style] ?? STYLES.corner;
  const label = showDate ? `${handle} · ${today()}` : handle;
  const [x, y] = shape.at;
  return `text author_card = "${quoted(label)}" at (${x}, ${y}) as { color ${colour} fontSize ${shape.size} }\n`;
}

function widgets() {
  const known = handle
    ? { kind: 'label', text: `Signing as ${handle}.`, muted: true }
    : { kind: 'label', text: 'Nothing set yet. Your handle stays in the keychain.', muted: true };

  return [
    known,
    { kind: 'input', id: 'handle', label: 'handle', value: handle, placeholder: 'your name' },
    { kind: 'separator' },
    {
      kind: 'select',
      id: 'style',
      label: 'placement',
      value: style,
      options: Object.entries(STYLES).map(([value, s]) => ({ value, label: s.label })),
    },
    {
      kind: 'select',
      id: 'colour',
      label: 'colour',
      value: colour,
      options: ['grey', 'blue', 'purple', 'green', 'orange', 'red'].map(c => ({ value: c, label: c })),
    },
    { kind: 'checkbox', id: 'showDate', label: 'add the date', value: showDate },
    { kind: 'button', id: 'insert', label: 'sign this file', primary: true },
    ...(handle ? [{ kind: 'button', id: 'forget', label: 'forget my handle' }] : []),
  ];
}

function refresh() {
  dsmx.window.updateView('card', widgets());
}

async function setHandle(value) {
  handle = String(value ?? '').trim();
  if (handle) await dsmx.secrets.store('handle', handle);
  else await dsmx.secrets.delete('handle');
  refresh();
}

async function forget() {
  handle = '';
  await dsmx.secrets.delete('handle');
  refresh();
  await dsmx.window.showInformationMessage('Your handle is out of the keychain.');
}

async function insert() {
  try {
    await dsmx.editor.insert(card());
    await dsmx.window.showInformationMessage(`Signed as ${handle}.`);
  } catch (err) {
    await dsmx.window.showWarningMessage(err.message);
  }
}

dsmx.window.registerView({ id: 'card', title: 'author card', widgets: widgets() }, (widget, value) => {
  if (widget === 'handle') { void setHandle(value); return; }
  if (widget === 'insert') { void insert(); return; }
  if (widget === 'forget') { void forget(); return; }

  const store = { style: v => (style = String(v)), colour: v => (colour = String(v)), showDate: v => (showDate = !!v) };
  if (!store[widget]) return;
  store[widget](value);
  void dsmx.globalState.update(widget, widget === 'showDate' ? showDate : String(value));
  refresh();
});

dsmx.commands.registerCommand('sign', 'author card: sign this file', () => {
  try {
    return { insert: card() };
  } catch (err) {
    return { status: err.message };
  }
});

dsmx.keybindings.register('Alt+A', 'sign');
dsmx.menus.register('editor', 'sign', 'Sign this file');

dsmx.secrets.get('handle').then(saved => {
  if (!saved) return;
  handle = saved;
  refresh();
});
