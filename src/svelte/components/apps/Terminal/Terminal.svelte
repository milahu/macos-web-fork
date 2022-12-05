<script lang="ts">

  import { onMount } from "svelte"

  import { theme } from '$src/stores/theme.store';

  // based on ./codemirror-shell/demo/index.js

  import Shell from "./codemirror-shell/shell.js"

  // https://vitejs.dev/guide/assets.html#importing-asset-as-string
  import banner from "./banner.txt?raw"
  import notImplementedText from "./not-implemented.txt?raw"

  import * as esprima from "esprima"

  let shell;
  let terminalParent;

  onMount(() => {

    /**
    * this is the shell constructor
    */
    shell = new Shell({
      container: terminalParent,
      //container: document.body,
      // TODO syntax highlighting
      //mode: 'javascript',
      //mode: javascript,
      exec_function,
    })

    /**
    * set up style and focus
    */
    //shell.setOption( "theme", "zenburn" );
    shell.focus();

    shell.response(banner, "banner")

    console.log("shell", shell)

  })

  /**
  * this is our interpreter.  note that writing responses to the shell
  * is decoupled from commands -- the result of this function (via callback)
  * only affects display of the prompt.
  */
  function exec_function(cmd, callback) {
    if (cmd == ".help") {
      shell.response(notImplementedText);
      callback.call(this, { parsestatus: shell.PARSE_STATUS.OK })
      return;
    }
    var ps = shell.PARSE_STATUS.OK
    if (cmd.length) {
      var composed = cmd.join("\n")
      console.log("composed", composed)
      const parse = esprima.parse
      try {
        parse(composed)
      } catch (err) {
        console.log("err", err)
        if (err.description.match(/Unexpected end of input/)) {
          ps = shell.PARSE_STATUS.INCOMPLETE
        }
      }
      if (ps == shell.PARSE_STATUS.OK) {
        /*
        // TODO move the "shell.response" code into "composed"
        // wrap async code
        composed = [
          '(async () => { ', composed, '; })()',
          '.then((result) => TODO)',
          '.catch((error) => TODO);'
        ].join('');
        */
        try {
          // eval javascript
          // TODO mock/patch console.log, so we see output in gui
          console.log("eval:\n" + composed)
          var text,
            result = window.eval(composed)
          console.log("eval", { text, result })
          try {
            text = JSON.stringify(result)
          } catch (e) {
            text = result.toString()
          }
          // unix convention: newline after every line
          text += "\n"
          // send result to shell
          shell.response(text)
        } catch (e) {
          shell.response(e.name + ": " + e.message + "\n", "shell-error")
        }
      }
    }
    callback.call(this, { parsestatus: ps })
  }

  /** one overloaded global method */
  // @ts-ignore Type '(a: any) => void' is not assignable to type '() => void'.ts(2322)
  globalThis.print = function (a) {
    shell.response(JSON.stringify(a))
  }

  let windowElement

</script>

<section bind:this={windowElement} class="container" class:dark={$theme.scheme === 'dark'}>
  <header class="app-window-drag-handle titlebar" />
  <section class="main-area">
    <div class="termparent" id="term-parent" bind:this={terminalParent}></div>
  </section>
</section>

<style lang="scss">
  // based on src/svelte/components/apps/Calendar/Calendar.svelte

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

  .termparent {
    height: 100%;
  }

  :global(.cm-editor) {
    height: 100%;
  }

</style>
