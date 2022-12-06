<script lang="ts">

    // based on ./svelte-file-manager/src/App.svelte

    // @ts-ignore Property 'fs' does not exist on type
    const fs: typeof import("fs") = globalThis.fs;

    import { theme } from '$src/stores/theme.store';

    import {onMount} from "svelte";
    import {fade} from 'svelte/transition';
    import {Config, File, Mule, SORTERS} from "./svelte-file-manager/src/Struct.svelte";
    import Preview from "./svelte-file-manager/src/Preview/Preview.svelte";
    import FileManager from "./svelte-file-manager/src/FileManager/FileManager.svelte";

    // this breaks .container in
    // <section class="container"
    //import "axentix/dist/axentix.min.css";
    import "./axentix.css";

    import "./svelte-file-manager/src/global.css";

    export let config: Config = {
      title: "",
      version: "0",
      maxReqSize: 100,
      readOnly: false,
      sharing: null, // Share link for this folder
      hasPassword: false,
    };

    let hashPathWasSetByMe: boolean = true;

    $: mule = Mule.empty();

    //$: path = [];
    $: path = ["home", "user"];

    $: slideshowIndex = -1;

    // FIXME sorting is broken
    $: sorter = SORTERS.ABC;

    // FIXME grid is ugly in small window. blame axentix css?
    //$: mode = "GRID";
    $: mode = "LIST";

    $: footer = null;
    let footers = [];
    let footerHandler: number | ReturnType<typeof setTimeout> = -1;

    $: {
        mule = mule.sort(sorter);
    }

    function addFooter(obj: any) {
        function nxtFooter() {
            footer = footers.shift();
            if (!footer) {
                footerHandler = -1;
            } else {
                footerHandler = setTimeout(nxtFooter, 2000);
            }
        }

        if (footerHandler < 0) {
            footer = obj;
            footerHandler = setTimeout(nxtFooter, 2000);
        } else {
            footers.push(obj);
        }
    }

    function hash2path(): string[] {
        return decodeURIComponent(window.location.hash.substring(1))
            .replace(/^\/+/, '').replace(/\/+$/, '') // removes trailing and leading '/'
            .split("/") // splits over '/'
            .filter((el) => el != "" && el != null);
    }

    function setPathAsHash() {
        const nuHash = '#' + encodeURIComponent('/' + path.join('/').replace(/\/+$/, '').replaceAll(/\/+/g, '\/'));
        if (nuHash != window.location.hash) {
            hashPathWasSetByMe = true;
            window.location.hash = nuHash;
        }
    }

    onMount(() => {
        addFooter({
            color: "blue dark-2",
            html: `<span>
          🐶 <a class="pup-a" target="_blank" href="https://github.com/proofrock/pupcloud/">Pupcloud</a>
                ${config.version} -
            <a class="pup-a" href="https://germ.gitbook.io/pupcloud/">Documentation</a> -
            <a class="pup-a" href="https://github.com/proofrock/pupcloud">Github Page</a> -
            <a class="pup-a" href="https://pupcloud.vercel.app/">Demo site</a>
        </span>`
        });

        if (config.readOnly) {
            addFooter({
                color: "yellow",
                html: "<span>🐶 Pupcloud is in <b>read only</b> mode.</span>"
            });
        }

        //loadPath(hash2path());
        loadPath(path);
    });

    async function loadPath(nuPath: string[]) {
        const nuPathStr = "/" + nuPath.join("/");
        //console.log("loadPath nuPath", nuPath)
        console.log("loadPath", nuPathStr, new Error().stack)
        const itemsList = await fs.promises.readdir(nuPathStr);
        const items = await Promise.all(itemsList.map(async (fileName) => {
          const filePath = nuPathStr + (nuPathStr == "/" ? "" : "/") + fileName;
          const stats = await fs.promises.stat(filePath);
          // TODO filemanager should use the node fs api
          const fileobj = {
            stats,
            isLink: stats.isSymbolicLink(),
            mimeType: stats.isDirectory() ? "#directory" : "text/plain", // TODO
            name: fileName,
            size: stats.size,
            chDate: +stats.mtime / 1000, // Date -> msec -> sec
            owner: 0,
            group: 0,
            permissions: stats.mode,
          };
          return fileobj;
        }));
        //console.log("loadPath items", items);
        mule = new Mule(items, nuPath).sort(sorter);
        path = nuPath;
    }

    window.addEventListener('hashchange', () => {
        if (hashPathWasSetByMe)
            hashPathWasSetByMe = false;
        else
            loadPath(hash2path());
    }, false);

    function openSlideshow(event) {
        slideshowIndex = mule.files.findIndex(
            (i: File) => i.uuid == event.detail.uuid
        );
    }

    function chPath(event) {
        loadPath(event.detail.path);
    }

    function closeSlideshow() {
        slideshowIndex = -1;
    }

    function reload() {
        loadPath(path);
    }

    function goToRoot() {
        loadPath([]);
    }

    function composeTitle(_title, _path) {
        return _title.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '').trim()
            + " - /"
            + _path.join("/").replaceAll("//", "/");
    }

</script>

<!--
<svelte:head>
    <title>{composeTitle(config.title, path)}</title>
</svelte:head>
-->

<section class="container" class:dark={$theme.scheme === 'dark'}>
  <header class="app-window-drag-handle titlebar" />
  <section class="main-area">

    {#if slideshowIndex < 0}
        <!-- window title
        <nav class="navbar blue dark-2">
            <p class="navbar-brand cursor-pointer" on:click={goToRoot}>{config.title}</p>
        </nav>
        -->
        <FileManager bind:path {config} bind:mule bind:sorter bind:mode on:pathEvent={chPath}
                     on:openItem={openSlideshow}
                     on:reload={reload} on:logout/>
        {#if !!footer}
            <footer class="footer font-s1 lh-1 {footer.color}" out:fade>{@html footer.html}</footer>
        {/if}
    {:else}
        <Preview files={mule.files} fileIdx={slideshowIndex} on:closePreview={closeSlideshow}/>
    {/if}

  </section>
</section>

<style lang="scss">

  .container {
    background-color: var(--system-color-light);

    border-radius: inherit;

    overflow: hidden;

    &.dark {
      box-shadow: inset 0 0 0 0.9px hsla(var(--system-color-dark-hsl), 0.2),
        0 0 0 1.5px hsla(var(--system-color-light-hsl), 0.5);
    }
  }

  $title-bar-height: 2.5rem;

  .titlebar {
    padding: 1rem 1rem;

    width: 100%;
    height: $title-bar-height;

    position: absolute;
    top: 0;
    left: 0;
  }

  .main-area {
    color: var(--system-color-light-contrast);

    margin-top: $title-bar-height;

    height: calc(100% - #{$title-bar-height});
    width: 100%;

    overflow: hidden;

    display: flex;
    flex-direction: column;
  }

</style>
