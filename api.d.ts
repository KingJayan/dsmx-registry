// add this at the top of main.js for completion:
//   /// <reference path="../../api.d.ts" />

declare namespace dsmx {
  const pluginId: string;

  const storageUri: string | null;
  const globalStorageUri: string | null;

  type MacroArg = number | string;

  /** `@name(1, "two")` */
  function macro(name: string, run: (...args: MacroArg[]) => string): void;
  type CommandResult = { insert: string } | { replace: string } | { status: string } | void;

  /** shorthand for commands.registerCommand */
  function command(id: string, label: string, run: () => CommandResult | Promise<CommandResult>): void;
  namespace commands {
    function registerCommand(id: string, label: string, run: () => CommandResult | Promise<CommandResult>): void;
    function getCommands(): string[];
  }

  type Widget =
    | { kind: 'label'; text: string; muted?: boolean }
    | { kind: 'button'; id: string; label: string; primary?: boolean }
    | { kind: 'input'; id: string; label?: string; value?: string; placeholder?: string }
    | { kind: 'slider'; id: string; label?: string; value: number; min: number; max: number; step?: number }
    | { kind: 'checkbox'; id: string; label: string; value?: boolean }
    | { kind: 'select'; id: string; label?: string; value?: string; options: { value: string; label: string }[] }
    | { kind: 'rows'; rows: { id?: string; title: string; detail?: string }[] }
    | { kind: 'separator' };

  interface View {
    id: string;
    title: string;
    widgets: Widget[];
  }

  interface StatusBarItem {
    id: string;
    text: string;
    tooltip?: string;
    command?: string;
  }

  type ViewEvent = (widget: string, value: string | number | boolean | null) => void;

  namespace window {
    function showInformationMessage(text: string): Promise<void>;
    function showWarningMessage(text: string): Promise<void>;
    function showErrorMessage(text: string): Promise<void>;
    function setStatusMessage(text: string): Promise<void>;

    function registerView(view: View, onEvent?: ViewEvent): void;
    function updateView(id: string, widgets: Widget[]): void;
    function removeView(id: string): void;

    function registerStatusBarItem(item: StatusBarItem): void;
    function removeStatusBarItem(id: string): void;
  }

  namespace editor {
    function getText(): Promise<string>;
    function getSelection(): Promise<string>;
    function insert(text: string): Promise<void>;
    function replace(text: string): Promise<void>;
    function setText(text: string): Promise<void>;
  }

  namespace app {
    /**
     * `format` `compile` `save` `export.png` `export.svg` `export.link`
     * `view.dsl` `view.enhanced` `panel.optimizer` `panel.problems`
     */
    function run(command: string): Promise<void>;
  }

  namespace keybindings {
    function register(key: string, command: string): void;
  }

  namespace menus {
    function register(area: 'editor' | 'graph' | 'expressions' | 'plugins', command: string, label: string): void;
  }

  interface Memento {
    get<T>(key: string, fallback?: T): T | undefined;
    keys(): string[];
    update(key: string, value: unknown): Promise<void>;
  }

  const workspaceState: Memento;

  const globalState: Memento;

  const secrets: {
    get(key: string): Promise<string | null>;
    store(key: string, value: string): Promise<boolean>;
    delete(key: string): Promise<boolean>;
  };
}
