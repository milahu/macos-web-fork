import { createAppConfig } from '$src/helpers/create-app-config';

import pkg from '../../../../package.json';

const wallpapers = createAppConfig({
  title: 'Wallpapers',
  resizable: true,

  height: 600,
  width: 800,

  dockBreaksBefore: true,
});

const calculator = createAppConfig({
  title: 'Calculator',

  expandable: true,
  resizable: false,

  height: 300 * 1.414,
  width: 300,
});

const calendar = createAppConfig({
  title: 'Calendar',
  resizable: true,
});

const vscode = createAppConfig({
  title: 'VSCode',
  resizable: true,

  height: 600,
  width: 800,
});

const finder = createAppConfig({
  title: 'Finder',
  resizable: true,

  // dockBreaksBefore: true,
  shouldOpenWindow: false,
});

const safari = createAppConfig({
  title: 'Safari',
  resizable: true,
});

const systemPreferences = createAppConfig({
  title: 'System Preferences',
  resizable: true,
});

/** @ts-ignore */
const sourceUrl = pkg.homepage;

const viewSource = createAppConfig({
  title: `View Source`,
  resizable: true,

  shouldOpenWindow: false,
  externalAction: () => window.open(sourceUrl, '_blank'),
});

const appstore = createAppConfig({
  title: 'App Store',
  resizable: true,
});

const terminal = createAppConfig({
  title: 'Terminal',

  expandable: true,
  resizable: true,

  // 16:10 = 480:300
  height: 300,
  width: 480,
});

const fileManager = createAppConfig({
  title: 'FileManager',
  expandable: true,
  resizable: true,
  height: 300,
  width: 480,
});

export const appsConfig = {
  finder,
  wallpapers,
  calculator,
  calendar,
  vscode,
  terminal,
  'file-manager': fileManager,
  appstore,
  // safari,

  // 'system-preferences': systemPreferences,

  'view-source': viewSource,
};
