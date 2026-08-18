const STEPS = {
  tidy: {
    label: 'tidy',
    detail: 'format, then compile',
    run: ['format', 'compile'],
  },
  ship: {
    label: 'ship',
    detail: 'format, save, then a png beside it',
    run: ['format', 'save', 'export.png'],
  },
  share: {
    label: 'share',
    detail: 'format, save, then a link on the clipboard',
    run: ['format', 'save', 'export.link'],
  },
  vector: {
    label: 'vector',
    detail: 'format, save, then an svg',
    run: ['format', 'save', 'export.svg'],
  },
};

let chosen = dsmx.globalState.get('routine', 'tidy');
dsmx.globalState.setKeysForSync(['routine']);

function widgets() {
  return [
    { kind: 'label', text: 'One key for the run you do every time.', muted: true },
    {
      kind: 'select',
      id: 'routine',
      label: 'routine',
      value: chosen,
      options: Object.entries(STEPS).map(([value, s]) => ({ value, label: s.label })),
    },
    { kind: 'label', text: STEPS[chosen].detail, muted: true },
    { kind: 'button', id: 'go', label: `run ${STEPS[chosen].label}`, primary: true },
    { kind: 'separator' },
    {
      kind: 'rows',
      rows: [
        { id: 'format', title: 'format', detail: 'Alt+1' },
        { id: 'optimizer', title: 'optimizer', detail: 'Alt+2' },
        { id: 'problems', title: 'problems', detail: 'Alt+3' },
        { id: 'enhanced', title: 'expression view', detail: 'Alt+4' },
      ],
    },
  ];
}

function refresh() {
  dsmx.window.updateView('runner', widgets());
  dsmx.window.registerStatusBarItem({
    id: 'routine',
    text: `⚙ ${STEPS[chosen].label}`,
    tooltip: `Toolkit — ${STEPS[chosen].detail}`,
    command: 'go',
  });
}

async function run(name) {
  const routine = STEPS[name];
  if (!routine) return;
  for (const step of routine.run) await dsmx.app.run(step);
  await dsmx.window.showInformationMessage(`${routine.label}: ${routine.run.join(' → ')}`);
}

dsmx.window.registerView({ id: 'runner', title: 'toolkit', widgets: widgets() }, (widget, value) => {
  if (widget === 'routine') {
    chosen = String(value);
    void dsmx.globalState.update('routine', chosen);
    refresh();
    return;
  }
  if (widget === 'go') { void run(chosen); return; }

  const direct = {
    format: 'format',
    optimizer: 'panel.optimizer',
    problems: 'panel.problems',
    enhanced: 'view.enhanced',
  }[widget];
  if (direct) void dsmx.app.run(direct);
});

dsmx.commands.registerCommand('go', 'toolkit: run the chosen routine', async () => {
  await run(chosen);
});

dsmx.commands.registerCommand('format', 'toolkit: format', () => dsmx.app.run('format'));
dsmx.commands.registerCommand('optimizer', 'toolkit: show what the optimizer changed', () => dsmx.app.run('panel.optimizer'));
dsmx.commands.registerCommand('problems', 'toolkit: show problems', () => dsmx.app.run('panel.problems'));
dsmx.commands.registerCommand('enhanced', 'toolkit: expression view', () => dsmx.app.run('view.enhanced'));
dsmx.commands.registerCommand('dsl', 'toolkit: back to the dsl', () => dsmx.app.run('view.dsl'));

dsmx.commands.registerCommand('count', 'toolkit: count what is in this file', async () => {
  const text = await dsmx.editor.getText();
  const lines = text.split('\n');
  const code = lines.filter(l => l.trim() && !l.trim().startsWith('//')).length;
  return { status: `${code} statement${code === 1 ? '' : 's'}, ${lines.length} lines` };
});

dsmx.keybindings.register('Alt+Enter', 'go');
dsmx.keybindings.register('Alt+1', 'format');
dsmx.keybindings.register('Alt+2', 'optimizer');
dsmx.keybindings.register('Alt+3', 'problems');
dsmx.keybindings.register('Alt+4', 'enhanced');

dsmx.menus.register('editor', 'go', 'Run the toolkit routine');
dsmx.menus.register('editor', 'count', 'Count the statements');
dsmx.menus.register('graph', 'go', 'Run the toolkit routine');
dsmx.menus.register('expressions', 'dsl', 'Back to the DSL');
dsmx.menus.register('plugins', 'go', 'Run the toolkit routine');

refresh();
