<script lang="ts">
  import Dock from '$src/components/Dock/Dock.svelte';
  import TopBar from '$src/components/TopBar/TopBar.svelte';
  import Wallpaper from '../apps/WallpaperApp/Wallpaper.svelte';
  import BootupScreen from './BootupScreen.svelte';
  import ContextMenu from './ContextMenu.svelte';
  import SystemUpdate from './SystemUpdate.svelte';
  import WindowsArea from './Window/WindowsArea.svelte';

  // @ts-ignore Cannot find module 'browserfs' or its corresponding type declarations
  import * as _BrowserFS from 'browserfs';
  import pify from 'pify';

  import { appIcon } from "$src/configs/icons/feathericon";
  // used in components/apps/FileManager/svelte-file-manager/src/MimeTypes.svelte
  globalThis.icons = appIcon;

  const BrowserFS = pify(_BrowserFS);

  // Installs globals onto window:
  // * Buffer
  // * require (monkey-patches if already defined)
  // * process
  // You can pass in an arbitrary object if you do not wish to pollute
  // the global namespace.
  BrowserFS.install(globalThis);

  let fs: typeof import("fs");

  /*
  // @ts-ignore Property 'fs' does not exist on type
  const fs: typeof import("fs") = globalThis.fs;
  */

  (async () => {

    // TODO pify + async
    await BrowserFS.configure({
      fs: "MountableFileSystem",
      options: {
        "/": {
          fs: "IndexedDB",
          // fix: TypeError: Cannot read properties of undefined (reading 'storeName') 
          // https://github.com/jvilk/BrowserFS/issues/336
          options: {},
        },
        "/tmp": {
          fs: "InMemory",
        },
      },
    });

    fs = require("fs");
    fs.promises = pify(fs);
    // @ts-ignore Property 'fs' does not exist on type
    globalThis.fs = fs;

    // TODO implement recursive mkdir in browserfs
    //await fs.promises.mkdir("/home/user", { recursive: true });
    try {
      await fs.promises.mkdir("/home");
    } catch (_) {}
    try {
      await fs.promises.mkdir("/home/user");
    } catch (_) {}

    // demo: write file
    await fs.promises.writeFile('/home/user/test.txt', 'Cool, I can do this in the browser!');

    /*
    // demo: read file
    var str = (await fs.promises.readFile('/test.txt', 'utf8'));
    console.log("str", str);

    (async () => { var str = (await fs.promises.readFile('/test.txt', 'utf8')); console.log("str", str); })();

    var str = (await fs.promises.readFile('/test.txt')).toString();
    console.log("str", str);

    var buf = (await fs.promises.readFile('/test.txt'));
    console.log("buf", buf);

    // demo: read dir
    var dir = (await fs.promises.readdir('/'));
    console.log("dir", dir);
    */

  })();

  let mainEl: HTMLElement;

</script>

<div bind:this={mainEl} class="container">
  <main>
    <TopBar />
    <WindowsArea />
    <Dock />
  </main>

  <Wallpaper />
  <BootupScreen />
  <SystemUpdate />

  <ContextMenu targetElement={mainEl} />
</div>

<style lang="scss">
  .container {
    height: 100%;
    width: 100%;
  }

  main {
    height: 100%;
    width: 100%;

    display: grid;
    grid-template-rows: auto 1fr auto;
  }
</style>
