import { S as SvelteComponent, i as init, s as safe_not_equal, e as element, a as space, b as attr, c as toggle_class, h as insert, j as append, n as noop, m as detach, o as component_subscribe, a0 as onMount, y as binding_callbacks } from './node_modules/svelte@3.53.1.js';
import { t as theme } from './index.js';
import { a as Decoration, E as EditorView, k as keymap } from './node_modules/@codemirror_view@6.6.0.js';
import { e as StateEffect, S as StateField } from './node_modules/@codemirror_state@6.1.4.js';
import { S as StreamLanguage } from './node_modules/@codemirror_language@6.3.1.js';
import { h as historyKeymap, d as defaultKeymap } from './node_modules/@codemirror_commands@6.1.2.js';
import { q as queueMicrotask_1 } from './node_modules/queue-microtask@1.2.3.js';
import { e as esprima } from './node_modules/esprima@4.0.1.js';
import './node_modules/svelte-local-storage-store@0.3.1_svelte@3.53.1.js';
import './node_modules/feathericon@1.0.2.js';
import './node_modules/popmotion@11.0.5.js';
import './node_modules/style-value-types@5.1.2.js';
import './node_modules/hey-listen@1.0.8.js';
import './node_modules/date-fns@2.29.3.js';
import './node_modules/browserfs@1.4.3.js';
import './node_modules/pify@6.1.0.js';
import './node_modules/style-mod@4.0.0.js';
import './node_modules/w3c-keyname@2.2.6.js';
import './node_modules/@lezer_common@1.0.2.js';
import './node_modules/@lezer_highlight@1.1.3.js';

/**
 *
 * Copyright (c) 2016 Structured Data LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

const EXEC_STATE = {
  EDIT: "edit",
  EXEC: "exec",
};

const PARSE_STATUS = {
  NULL: "",
  OK: "OK",
  INCOMPLETE: "Incomplete",
  PARSE_ERR: "ParseError",
  ERR: "Err",
};

const MAX_HISTORY_DEFAULT = 2500;

const HISTORY_KEY_DEFAULT = "shell.history";
const DEFAULT_PROMPT_CLASS = "shell-prompt";

function posToOffset(doc, pos) {
  //return doc.line(pos.line + 1).from + pos.ch
  return doc.line(pos.line).from + pos.ch
}

// https://codemirror.net/docs/migration/#marked-text
const addMarks = StateEffect.define();
const filterMarks = StateEffect.define();
// This value must be added to the set of extensions to enable this
const markFieldExtension = StateField.define({
  // Start with an empty set of decorations
  create() {
    return Decoration.none
  },
  // This is called whenever the editor updates—it computes the new set
  update(value, tr) {
    // Move the decorations to account for document changes
    value = value.map(tr.changes);
    // If this transaction adds or removes decorations, apply those changes
    for (let effect of tr.effects) {
      if (effect.is(addMarks))
        value = value.update({ add: effect.value, sort: true });
      else if (effect.is(filterMarks))
        value = value.update({ filter: effect.value });
    }
    return value
  },
  // Indicate that this field provides a set of decorations
  provide: (f) => EditorView.decorations.from(f),
});

/**
 * shell implmentation based on CodeMirror (which is awesome)
 * see http://codemirror.net/.
 *
 * Example options:
 *
 * initial_prompt: "> "
 * continuation_prompt: "+ "
 * exec_function( command, callback )
 * hint_function( line, position, callback( list, start ))
 * container: element or id, document.body
 * mode: "javascript"
 * drop_files: [ mime types ]
 * function_key_callback: called on function keys (+ some others)
 *
 */
function Shell(opts) {
  /** @type {import("codemirror").EditorView} */
  var view;

  var state = EXEC_STATE.EDIT;
  var prompt_text = "";
  var instance = this;
  instance.opts = opts;
  instance.cm = null;
  this.function_tip = {};
  this.EXEC_STATE = EXEC_STATE;
  this.PARSE_STATUS = PARSE_STATUS;
  instance.language = null;

  var prompt_len = 0;

  var command_buffer = [];
  var paste_buffer = [];

  var unstyled_lines = [];
  var block_reset = [];

  var unstyled_flag = false;

  var event_cache = null;
  var event_cache_skip = false;
  var event_playback = false;

  /**
   * FIXME: cap and flush this thing at (X) number of lines
   *
   * soft persistence, meaning: up up to a command, modify it
   * slightly, then down, up, modifications are retained.  reverts
   * on new command.
   */
  class History {
    /** @type {string | null} */
    current_line = null
    commands = []
    actual_commands = []
    pointer = 0

    reset_pointer() {
      this.pointer = 0;
      this.commands = this.actual_commands.slice(0);
    }

    push(line) {
      this.actual_commands.push(line);
      this.commands = this.actual_commands.slice(0);
    }

    save(opts) {
      opts = opts || {};
      var max = opts.max || MAX_HISTORY_DEFAULT;
      var key = opts.key || HISTORY_KEY_DEFAULT;
      localStorage.setItem(
        key,
        JSON.stringify(this.actual_commands.slice(-max))
      );
    }

    restore(opts) {
      opts = opts || {};
      var key = opts.key || HISTORY_KEY_DEFAULT;
      var val = localStorage.getItem(key);
      if (val) this.actual_commands = JSON.parse(val);
      this.reset_pointer();
    }

    clear() {
      this.actual_commands = [];
      this.commands = [];
      this.pointer = 0;
      this.save();
    }
  }

  const history = new History();

  /**
   * overlay mode to support unstyled text -- file contents (the pager)
   * in our particular case but could be anything.  this is based on
   * CM's "overlay" mode, but that one doesn't work because it parses
   * regardless and we get stuck in string-mode after a stray apostrophe.
   *
   * in this one, null styling is the default, and greedy; but if we are
   * not unstyled, then we pass through to (base).  base should be a string
   * mode name, which must have been previously registered.
   */
  /**
   *
   * // TODO param {import("@codemirror/language").Language} innerLanguage
   * // TODO param {import("@codemirror/legacy-modes").Mode} innerMode
   * @param {*} base
   */

  function init_overlay_mode(base) {
    // CodeMirror.defineMode in codemirror 6
    // https://discuss.codemirror.net/t/how-to-create-custom-syntax-highlighter-using-stream-parser/3752
    // https://github.com/codemirror/legacy-modes/blob/main/mode/shell.js
    // https://github.com/codemirror/legacy-modes/search?q=startState
    // https://github.com/codemirror/legacy-modes/search?q=copyState
    // https://codemirror.net/examples/mixed-language/
    // https://discuss.codemirror.net/t/equivalent-of-getstateafter-in-cm6/3855
    // https://marijnhaverbeke.nl/blog/codemirror-mode-system.html
    /*
    CM.defineMode( name, function(config, parserConfig) {
      base = CM.getMode( config, parserConfig.backdrop || baseMode );
      return { ... };
    });
    */
    //var config = {} // TODO
    //var parserConfig = {} // TODO

    //var base = CM.getMode( config, parserConfig.backdrop || baseName );

    var outerLanguage = StreamLanguage.define({
      startState: function () {
        return {
          base: base.startState(),
          linecount: 0,
        }
      },

      /* FIXME TypeError: base.copyState is not a function
        copyState: function(state) {
          return {
            base: base.copyState(state.base),
            linecount: state.linecount
          };
        },
        */

      token: function (stream, state) {
        if (stream.sol()) {
          var lc = state.linecount;
          state.linecount++;
          if (unstyled_flag || unstyled_lines[lc]) {
            stream.skipToEnd();
            return "unstyled"
          }
          if (block_reset[lc]) {
            state.base = base.startState();
          }
        }
        return base.token(stream, state.base)
      },

      // FIXME TypeError: Cannot read properties of undefined (reading 'unit')
      indent:
        base?.indent &&
        function (state, textAfter) {
          console.log("outerLanguage indent", { base, state, textAfter });
          return base.indent(state.base, textAfter)
        },

      // FIXME
      //electricChars: base.electricChars,

      // FIXME
      //innerMode: function(state) { return {state: state.base, mode: base}; },

      blankLine: function (state) {
        state.linecount++;
        if (base.blankLine) base.blankLine(state.base);
      },
    });

    /* TODO overlay LRLanguage and StreamLanguage

      const mixedParser = outerLanguage.parser.configure({
        // simple: one node has the inner content
        //wrap: parseMixed(node => {
        //  return node.name == "ScriptText" ? {parser: innerParser} : null
        //}),

        // overlay: multiple node have the inner content
        wrap: parseMixed(node => {
          return node.type.isTop ? {
            parser: innerLanguage.parser,
            overlay: node => node.type.name == "Text"
          } : null
        })
      })
      const mixedLang = LRLanguage.define({parser: mixedParser})
      */

    instance.language = outerLanguage;
  }

  /** destructively clear all history */
  this.clearHistory = function () {
    history.clear();
  };

  /**
   * get the CM object.  necessary for some clients
   * to handle events.  FIXME -- pass through events.
   */
  this.getCM = function () {
    return view
  };

  /** set CM option directly -- REMOVE */
  this.setOption = function (option, value) {
    if (opts.debug) console.info("set option", option, value);
    // FIXME
    //cm.setOption( option, value );
  };

  /** get CM option directly -- REMOVE */
  this.getOption = function (option) {
    if (opts.debug) console.info("get option", option);
    // FIXME
    //return cm.getOption( option );
  };

  /** cache events if we're blocking */
  var cacheEvent = function (event) {
    if (event_cache && !event_playback) {
      if (event_cache_skip) {
        if (event.type === "keyup" && event.key === "Enter")
          event_cache_skip = false;
      } else {
        event_cache.push(event);
      }
    }
  };

  /**
   * when unblocking (exiting an explicit block or exec),
   * replay cached keyboard events.  in some cases a played-back
   * event may trigger execution, which turns caching back on.
   * in that case, stop processing and dump all the
   * original source events back into the cache.
   */
  var playbackEvents = function () {
    // flush cache.  set to null to act as flag

    var tmp = event_cache;
    event_cache = null;
    event_cache_skip = false;

    if (tmp && tmp.length) {
      console.log(`playbackEvents: tmp=${JSON.stringify(tmp)}`);
      // FIXME
      var inputTarget = view.getInputField();
      tmp.forEach(function (src) {
        if (event_cache) {
          cacheEvent(src);
          return
        }

        var event = new KeyboardEvent(src.type, src);
        Object.defineProperties(event, {
          charCode: {
            get: function () {
              return src.charCode
            },
          },
          which: {
            get: function () {
              return src.which
            },
          },
          keyCode: {
            get: function () {
              return src.keyCode
            },
          },
          key: {
            get: function () {
              return src.key
            },
          },
          char: {
            get: function () {
              return src.char
            },
          },
          target: {
            get: function () {
              return src.target
            },
          },
        });
        event_playback = true;
        inputTarget.dispatchEvent(event);
        event_playback = false;
      });
    }
  };

  /**
   * block.  this is used for operations called by the code, rather than
   * the user -- we don't want the user to be able to run commands, because
   * they'll fail.
   * @param {string} message
   */
  this.block = function block(message) {
    console.log(`block: state=${JSON.stringify(state)}`);

    // this bit is right from exec:

    if (state === EXEC_STATE.EXEC) {
      return false
    }

    console.log("block: view", view);

    var doc = view.state.doc;
    var lineno = doc.lines;
    var line = doc.line(lineno);

    console.log(`block: message=${JSON.stringify(message)}`);

    if (!message) message = "\n";
    else message = "\n" + message + "\n";

    //doc.replaceRange( message, { line: lineno+1, ch: 0 }, undefined, "prompt");
    var pos = doc.line(doc.lines).from;
    view.dispatch({ changes: { from: pos, to: undefined, insert: message } });
    //view.dispatch({selection: {anchor: pos}})

    state = EXEC_STATE.EXEC;

    var command = line.text.slice(prompt_len);
    command_buffer.push(command);

    if (command.trim().length > 0) {
      history.push(command);
      history.save(); // this is perhaps unecessarily aggressive
    }

    // this automatically resets the pointer (NOT windows style)
    history.reset_pointer();

    // turn on event caching
    event_cache = [];

    // now leave it in this state...
    return true
  };

  /** unblock, should be symmetrical. */
  this.unblock = function (result, ignore_cached_events) {
    // again this is from exec (but we're skipping the
    // bit about pasting)

    state = EXEC_STATE.EDIT;

    if (result && result.prompt) {
      command_buffer = [];
      set_prompt(
        result.prompt || instance.opts.initial_prompt,
        result.prompt_class,
        result.continuation
      );
    } else {
      var ps = result
        ? result.parsestatus || PARSE_STATUS.OK
        : PARSE_STATUS.NULL;
      if (ps === PARSE_STATUS.INCOMPLETE) {
        set_prompt(instance.opts.continuation_prompt, undefined, true);
      } else {
        command_buffer = [];
        set_prompt(instance.opts.initial_prompt);
      }
    }

    if (!ignore_cached_events) playbackEvents();
  };

  /**
   * get history as array
   */
  this.get_history = function () {
    return history.actual_commands.slice(0)
  };

  /**
   * insert an arbitrary node, via CM's widget
   *
   * @param scroll -- scroll to the following line so the node is visible
   */
  this.insert_node = function (node, scroll) {
    var doc = view.state.doc;
    var line = Math.max(doc.lines - 1, 0);
    view.addLineWidget(line, node, {
      handleMouseEvents: true,
    });
    if (scroll)
      view.dispatch({ effects: EditorView.scrollIntoView(doc.line(line).from) });
  };

  /**
   * select all -- this doesn't seem to work using the standard event... ?
   */
  this.select_all = function () {
    //cm.execCommand( 'selectAll' );
    view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } });
  };

  this.scrollToEnd = function scrollToEnd() {

    var doc = view.state.doc;

    //console.log(`doc.length ${doc.length}`)

    // wait for new doc.length
    //setImmediate(() => {
      //console.log(`setImmediate doc.length ${doc.length}`)
      // scroll to end
      view.dispatch({ effects: EditorView.scrollIntoView(doc.length) });
      // set cursor
      view.dispatch({ selection: { anchor: view.state.doc.length } });
    //})

  };

  /**
   * handler for command responses, stuff that the system
   * sends to the shell (callbacks, generally).  optional className is a
   * style applied to the block.  "unstyled", if set, prevents language
   * styling on the block.
   */
  this.response = function response(text, className, unstyled) {
    // FIXME add newline after result

    console.log(`response: text=${JSON.stringify(text)}`);

    var doc = view.state.doc;
    var lineno = doc.lines;
    var end,
      start = lineno;

    if (text && typeof text !== "string") {
      try {
        text = text.toString();
      } catch (e) {
        text = "Unrenderable message: " + e.message;
      }
    }

    // don't add newlines.  respect existing length.  this is so we
    // can handle \r (without a \n).  FIXME: if there's a prompt, go
    // up one line.

    var lastline = doc.line(lineno);
    var ch = lastline ? lastline.length : 0;

    // second cut, a little more thorough
    // one more patch, to stop breaking on windows CRLFs

    var lines = text.split("\n");
    var replace_end = undefined;
    var inline_replacement = false;

    // fix here in case there's already a prompt (this is a rare case?)

    if (state !== EXEC_STATE.EXEC) {
      ch = 0; // insert before anything else on line

      // this is new: in the event that there is already a prompt,
      // and we are maintaining styling "breaks", then we may
      // need to offset the last break by some number of lines.

      // actually we know it's only going to be the last one, so
      // we can skip the loop.

      if (lines.length > 1 && block_reset.length) {
        var blast = block_reset.length - 1;
        block_reset[blast] = undefined;
        block_reset[blast + lines.length - 1] = 1;
      }
    }

    // parse carriage-return \r
    text = "";
    for (var i = 0; i < lines.length; i++) {
      var overwrite = lines[i].split("\r");
      if (i) text += "\n";
      else if (overwrite.length > 1) inline_replacement = true;
      if (overwrite.length > 1) {
        var final_text = "";
        for (var j = overwrite.length - 1; j >= 0; j--) {
          final_text = final_text + overwrite[j].substring(final_text.length);
        }
        text += final_text;
      } else text += lines[i];
    }
    console.log(`response: text2=${JSON.stringify(text)}`);
    if (inline_replacement) {
      replace_end = { line: start, ch: ch };
      ch = 0;
    }

    // for styling before we have built the table
    if (unstyled) unstyled_flag = true;

    //doc.replaceRange( text, { line: start, ch: ch }, replace_end, "callback");
    view.dispatch({
      changes: {
        from: posToOffset(doc, { line: start, ch: ch }),
        to: replace_end && posToOffset(doc, replace_end),
        insert: text,
        // TODO class callback?
      },
    });

    end = doc.lines;
    lastline = doc.line(end);
    var endch = lastline.text.length;
    console.log(
      `doc.lines=${doc.lines}  lastline.text=${lastline.text}  endch=${endch}`
    );

    // TODO what is this?
    if (unstyled) {
      var u_end = end;
      if (endch == 0) u_end--;
      if (u_end >= start) {
        for (
          // @ts-ignore
          var i = start;
          i <= u_end;
          i++
        )
          unstyled_lines[i] = 1;
      }
    }

    // can specify class
    /* FIXME
    if( className ){
      doc.markText( { line: start, ch: ch }, { line: end, ch: endch }, {
        className: className
      });
    }
    */

    if (className) {
      const from = posToOffset(doc, { line: start, ch: ch });
      const to = posToOffset(doc, { line: end, ch: endch });
      if (from < to) {
        // https://codemirror.net/docs/migration/#marked-text
        const strikeMark = Decoration.mark({
          attributes: {
            //style: "text-decoration: line-through",
            className: className,
          },
        });
        console.dir([
          `addMarks: className = ${className}`,
          { line: start, ch: ch },
          { line: end, ch: endch },
        ]);
        view.dispatch({
          effects: addMarks.of([strikeMark.range(from, to)]),
        });
      }
      // else: range is empty
    }

    // don't scroll in exec mode, on the theory that (1) we might get
    // more messages, and (2) we'll scroll when we enter the caret
    //if( state !== EXEC_STATE.EXEC )
    /* FIXME
    {
      cm.scrollIntoView({line: doc.lines, ch: endch});
    }
    */

    this.scrollToEnd();

    // the problem with that is that it's annoying when you want to see
    // the messages (for long-running code, for example).

    unstyled_flag = false;
  };

  /**
   * set prompt with optional class
   */
  function set_prompt(text, prompt_class, is_continuation) {
    if (typeof prompt_class === "undefined") prompt_class = DEFAULT_PROMPT_CLASS;

    if (typeof text === "undefined") {
      if (instance.opts) prompt_text = instance.opts.default_prompt;
      else text = "? ";
    }

    prompt_text = text;

    console.log("set_prompt: cm", view);

    var doc = view.state.doc;
    var lineno = doc.lines;
    console.log("set_prompt: doc.lines", doc.lines);
    console.log(
      "set_prompt: cm.state.doc.line(doc.lines)",
      view.state.doc.line(doc.lines)
    );
    var lastline = view.state.doc.line(lineno).text;

    if (!is_continuation) block_reset[lineno] = 1;

    /*
    const docLength = doc.length;
    view.dispatch({changes: {
      //from: posToOffset(doc, { line: lineno, ch: 0 }),
      from: docLength,
      to: undefined,
      insert: "\n",
      // TODO class prompt?
    }})
    //doc.setCursor({ line: lineno+1, ch: 0 });
    //view.dispatch({selection: {anchor: posToOffset(doc, { line: lineno, ch: 0 })}})
    // doc.length is not-yet updated at this point
    // so we use docLength + 1
    view.dispatch({selection: {anchor: docLength + 1}})
    */

    prompt_len = lastline.length + prompt_text.length;

    console.log(`set_prompt: lastline=${lastline}  prompt_text=${prompt_text}`);

    //doc.replaceRange( prompt_text, { line: lineno, ch: lastline.length }, undefined, "prompt" );
    view.dispatch({
      changes: {
        from: posToOffset(doc, { line: lineno, ch: lastline.length }),
        to: undefined,
        //insert: prompt_text,
        insert: prompt_text,
      },
    });

    /* FIXME
    if( prompt_class ){
      doc.markText( { line: lineno, ch: lastline.length }, { line: lineno, ch: prompt_len }, {
        className: prompt_class
      });
    }
    */
    if (prompt_class) {
      // https://codemirror.net/docs/migration/#marked-text
      const strikeMark = Decoration.mark({
        attributes: {
          //style: "text-decoration: line-through",
          className: prompt_class,
        },
      });
      view.dispatch({
        effects: addMarks.of([
          strikeMark.range(
            posToOffset(doc, { line: lineno, ch: lastline.length }),
            posToOffset(doc, { line: lineno, ch: prompt_len })
          ),
        ]),
      });
    }

    /* FIXME
    doc.setSelection({ line: lineno, ch: prompt_len });
    cm.scrollIntoView({line: lineno, ch: prompt_len });
    */
  }

  /**
   * external function to set a prompt.  this is intended to be used with
   * a delayed startup, where there may be text echoed to the screen (and
   * hence we need an initialized console) before we know what the correct
   * prompt is.
   */
  this.prompt = function (text, className, is_continuation) {
    set_prompt(text, className, is_continuation);
  };

  /**
   * for external client that wants to execute a block of code with
   * side effects -- as if the user had typed it in.
   */
  this.execute_block = function (code) {
    let lines = code.split(/\n/g);
    paste_buffer = paste_buffer.concat(lines);
    exec_line(view);
  };

  /**
   * execute the current line.  this happens on enter as
   * well as on paste (in the case of paste, it might
   * get called multiple times -- once for each line in
   * the paste).
   */
  function exec_line(view, cancel) {
    if (state === EXEC_STATE.EXEC) {
      return
    }

    var doc = view.state.doc;
    var lineno = doc.lines;
    var line = doc.line(lineno);
    console.log("line", line);

    // TODO what is this?
    //doc.replaceRange( "\n", { line: lineno+1, ch: 0 }, undefined, "prompt");
    //var pos = doc.line(doc.lines).from;
    // insert newline at end of document
    const docLength = doc.length;
    view.dispatch({
      changes: {
        //from: posToOffset(doc, { line: lineno, ch: 0 }),
        from: docLength,
        to: undefined,
        insert: "\n",
        // TODO class prompt?
      },
    });
    //doc.setCursor({ line: lineno+1, ch: 0 });
    //view.dispatch({selection: {anchor: posToOffset(doc, { line: lineno, ch: 0 })}})
    // doc.length is not-yet updated at this point
    // so we use docLength + 1
    //view.dispatch({selection: {anchor: docLength + 1}})

    state = EXEC_STATE.EXEC;
    var command;

    if (cancel) {
      command = "";
      command_buffer = [command];
    } else {
      command = line.text.slice(prompt_len);
      command_buffer.push(command);
    }

    // you can exec an empty line, but we don't put it into history.
    // the container can just do nothing on an empty command, if it
    // wants to, but it might want to know about it.

    if (command.trim().length > 0) {
      history.push(command);
      history.save(); // this is perhaps unecessarily aggressive
    }

    // this automatically resets the pointer (NOT windows style)

    history.reset_pointer();

    if (instance.opts.exec_function) {
      // turn on event caching.  if we're being called
      // from a paste block, it might already be in place
      // so don't destroy it.

      if (!event_cache) event_cache = [];

      console.log("command_buffer", command_buffer);

      instance.opts.exec_function.call(
        this,
        command_buffer,
        // callback
        function handleResult(result) {
          //console.log(`handleResult: result=${JSON.stringify(result)}`)
          // handleResult: result={"parsestatus":"OK"}

          // UPDATE: new style of return where the command processor
          // handles the multiline-buffer (specifically for R's debugger).

          // in that case, always clear command buffer and accept the prompt
          // from the callback.

          state = EXEC_STATE.EDIT;

          if (result && result.prompt) {
            command_buffer = [];
            set_prompt(
              result.prompt || instance.opts.initial_prompt,
              result.prompt_class,
              result.continuation
            );
          } else {
            var parseStatus = result
              ? result.parsestatus || PARSE_STATUS.OK
              : PARSE_STATUS.NULL;
            console.log(
              `handleResult: parseStatus=${JSON.stringify(parseStatus)}`
            );
            if (parseStatus === PARSE_STATUS.INCOMPLETE) {
              set_prompt(instance.opts.continuation_prompt, undefined, true);
            } else {
              command_buffer = [];
              set_prompt(instance.opts.initial_prompt);
            }
          }

          lineno = view.state.doc.lines;

          if (paste_buffer.length) {
            console.log(`handleResult: setImmediate paste`);

            queueMicrotask_1(function paste() {
              var text = paste_buffer[0];
              console.log(
                `handleResult: setImmediate paste: text=${JSON.stringify(text)}`
              );
              paste_buffer.splice(0, 1);
              // FIXME 5to6
              doc.replaceRange(
                text,
                { line: lineno, ch: prompt_len },
                undefined,
                "paste-continuation"
              );

              // if the last line of the paste buffer is a newline, then exec.
              // otherwise enter the text on the line and play back cached events.

              if (paste_buffer.length) exec_line(view);
              else playbackEvents();
            });
          } else {
            console.log(`handleResult: setImmediate playbackEvents`);
            queueMicrotask_1(playbackEvents);
          }
          instance.scrollToEnd();
        }
      );
    }
  }

  /**
   * clear console. two things to note: (1) this does not work in
   * exec state. (2) preserves last line, which we assume is a prompt/command.
   */
  this.clear = function (focus) {
    var doc = view.state.doc;
    var lastline = doc.lines;
    if (lastline > 0) {
      view.dispatch({
        changes: { from: 0, to: doc.line(doc.lines).from, insert: "" },
      });
    }

    // reset unstyled
    unstyled_lines.splice(0, unstyled_lines.length);
    unstyled_flag = false;

    block_reset.splice(0, block_reset.length);

    // move cursor to edit position
    var text = doc.line(doc.lines);
    // FIXME
    doc.setSelection({ line: doc.lines, ch: text.length });

    // optionally focus
    if (focus) this.focus();
  };

  /**
   * get shell width in chars.  not sure how CM gets this (possibly a dummy node?)
   */
  this.get_width_in_chars = function () {
    return (
      Math.floor(this.opts.container.clientWidth / view.defaultCharacterWidth) -
      instance.opts.initial_prompt.length
    )
  };

  /** refresh layout,  force on nonstandard resizes */
  /* TODO migrate
  this.refresh = function(){
    cm.refresh();
  };
  */

  /**
   * cancel the current line; clear parse buffer and reset history.
   */
  this.cancel = function () {
    exec_line(view, true);
  };

  /**
   * get current line (peek)
   */
  this.get_current_line = function () {
    var doc = view.state.doc;
    var line = doc.line(doc.lines);
    var cursor = view.state.selection.main.head;
    return {
      text: line.text.slice(prompt_len),
      //pos: ( index == pos.line ? pos.ch - prompt_len : -1 ),
      pos: cursor ? cursor - prompt_len : -1,
    }
  };

  /**
   * get line caret is on.  may include prompt.
   */
  this.get_caret_line = function () {
    var cursor = view.state.selection.main.head;
    var line = view.state.doc.lineAt(cursor);
    return { text: line, pos: cursor }
  };

  /**
   * get selections
   */
  this.get_selections = function () {
    return view.state.doc.getSelections()
  };

  /**
   * wrapper for focus call
   */
  this.focus = function () {
    view.focus();
  };

  /**
   * show function tip
   */
  this.show_function_tip = function (text) {
    if (!this.function_tip) this.function_tip = {};
    if (text === this.function_tip.cached_tip) return
    var where = view.cursorCoords();
    this.function_tip.cached_tip = text;
    if (!this.function_tip.node) {
      this.function_tip.container_node = document.createElement("div");
      this.function_tip.container_node.className =
        "cmjs-shell-function-tip-container";
      this.function_tip.node = document.createElement("div");
      this.function_tip.node.className = "cmjs-shell-function-tip";
      this.function_tip.container_node.appendChild(this.function_tip.node);
      opts.container.appendChild(this.function_tip.container_node);
    }
    this.function_tip.visible = true;
    this.function_tip.node.innerHTML = text;

    // the container/child lets you relatively position the tip in css
    this.function_tip.container_node.setAttribute(
      "style",
      "top: " + where.top + "px; left: " + where.left + "px;"
    );
    this.function_tip.container_node.classList.add("visible");
  };

  /**
   * hide function tip.
   *
   * @return true if we consumed the event, or false
   */
  this.hide_function_tip = function (user) {
    if (!this.function_tip) return false
    if (!user) this.function_tip.cached_tip = null;
    if (this.function_tip.visible) {
      this.function_tip.container_node.classList.remove("visible");
      this.function_tip.visible = false;
      return true
    }
    return false
  }

  /**
   * constructor body
   */
  ;(function () {
    opts = opts || {};

    // prompts
    opts.initial_prompt = opts.initial_prompt || "> ";
    opts.continuation_prompt = opts.continuation_prompt || "+ ";

    // dummy functions
    opts.exec_function =
      opts.exec_function ||
      function (cmd, callback) {
        if (opts.debug) console.info("DUMMY");
        var ps = PARSE_STATUS.OK;
        var err = null;
        if (cmd.length) {
          if (cmd[cmd.length - 1].match(/_\s*$/)) ps = PARSE_STATUS.INCOMPLETE;
        }
        callback.call(this, { parsestatus: ps, err: err });
      };
    opts.function_key_callback = opts.function_key_callback || function () {};

    // container is string (id) or node
    opts.container = opts.container || document.body;
    if (typeof opts.container === "string") {
      opts.container = document.querySelector(opts.container);
    }
    init_overlay_mode(opts.mode);

    /** @type {import("@codemirror/view").KeyBinding} */
    // FIXME not reached. parser throws
    // FIXME parser is off, still not reached
    const terminalKeymap = [
      {
        key: "Enter",
        preventDefault: true, // insert newline in exec_line
        // cursor can be in the middle of the last line
        run: (view, event) => {
          console.log("Enter", view, event);
          exec_line(view);
          return true; // dont call other handlers
          // defaultKeymap would insert \n
        },
      },
    ];

    console.log("keymaps", { terminalKeymap, historyKeymap, defaultKeymap });

    // NOTE this must come before other extensions like basicSetup
    // https://discuss.codemirror.net/t/enter-and-backspace-key-not-passed-to-keydown-dom-event-handler/3887
    // FIXME TypeError: EditorView.domEventHandlers.of is not a function
    /*
    const handleEvents = EditorView.domEventHandlers.of({
      drop(event, view) { console.log("drop", event); },
      paste(event, view) { console.log("paste", event); },
      keydown(event, view) { console.log("keydown", event); },
    })
    */

    // FIXME: this doesn't need to be global, if we can box it up then require() it
    console.log("opts.container", opts.container);
    view = new EditorView({
      extensions: [
        // FIXME use LRLanguage javascript
        //instance.language,
        markFieldExtension,
        // FIXME cannot enter newline at end of document
        // https://github.com/andrebnassis/codemirror-readonly-ranges/issues/4
        //readOnlyRangesExtension(getReadOnlyRanges),
        // NO NOTE terminalKeymap must come before defaultKeymap,
        // so we can handle "Enter" https://discuss.codemirror.net/t/enter-and-backspace-key-not-passed-to-keydown-dom-event-handler/3887
        keymap.of([...terminalKeymap, ...defaultKeymap, ...historyKeymap]),
        //keymap.of([...terminalKeymap]),
        //handleEvents,
      ],
      doc: "",
      parent: opts.container,
      //mode: modename, // opts.mode,
      //allowDropFileTypes: opts.drop_files,
      //viewportMargin: 50,
      //inputStyle: opts.inputStyle,
      /*
      https://stackoverflow.com/questions/72404988/codemirror-6-how-to-get-editor-value-on-input-update-change-event
        extensions: [
            EditorView.updateListener.of(function(e) {
                sync_val = e.state.doc.toString();
            })
        ]

      https://stackoverflow.com/questions/72716094/how-to-programmatically-change-the-editors-value-in-codemirror-6
        view.dispatch({
          changes: {from: 0, to: editor.state.doc.length, insert: 'New Test Text'}
        });

      */
      /*
      dispatch: (tr) => {
        console.log("tr", tr);
        if (tr.changes.empty == false) {
          //tr.changes.mapPos()
          //for (const change of tr.changes) { console.log("change", change); }
        }
        //view.dispatch(tr); // deadloop
      },
      */
    });

    var inputfield = view.contentDOM;

    inputfield.addEventListener("keydown", cacheEvent);
    inputfield.addEventListener("keyup", cacheEvent);
    inputfield.addEventListener("keypress", cacheEvent);
    inputfield.addEventListener("char", cacheEvent);

    // if you suppress the initial prompt, you must call the "prompt" method

    if (!opts.suppress_initial_prompt) set_prompt(opts.initial_prompt);

    var local_hint_function = null;
    if (opts.hint_function) {
      local_hint_function = function (cm, callback) {
        var doc = cm.state.doc;
        var line = doc.line(doc.lines);
        var cursor = cm.state.selection.main.head;
        var plen = prompt_len;

        opts.hint_function.call(
          instance,
          line.substr(plen),
          cursor - plen,
          function (completions, position) {
            if (!completions || !completions.length) {
              callback(null);
            } else {
              // FIXME cursor -> pos
              callback({
                list: completions,
                from: { line: pos.line, ch: position + plen },
                to: { line: pos.line, ch: cursor },
              });
            }
          }
        );
      };
      // @ts-ignore
      local_hint_function.async = true;
    }

    // FIXME handle events. dispatch?

    /*

    cm.on( "cut", function( cm, e ){
      if( state !== EXEC_STATE.EDIT ) e.preventDefault();
      else {
        var doc = cm.state.doc;
        var start = doc.getCursor( "from" );
        var end = doc.getCursor( "to" );
        var line = doc.lines;
        if( start.line !== line 
          || end.line !== line 
          || start.ch < prompt_len 
          || end.ch < prompt_len 
          || start.ch === end.ch ) e.preventDefault();
      }
    });

    cm.on( "cursorActivity", function(cm, e){
      var cursor = cm.state.selection.main.head;
      var doc = cm.state.doc;
      var lineno = doc.lines;
      var lastline = doc.line( lineno );
      if( pos.line !== lineno || pos.ch < prompt_len ){
        cm.setOption( "cursorBlinkRate", 0 );
      }
      else if( state === EXEC_STATE.EXEC 
          && pos.line === lineno 
          && pos.ch == lastline.length ){
        cm.setOption( "cursorBlinkRate", -1 );
      }
      else cm.setOption( "cursorBlinkRate", 530 ); // CM default -- make an option?
    });
        
    cm.on( "change", function( cm, e ){
      if( e.origin && e.origin[0] === "+" ){
        var doc = cm.state.doc;
        var lastline = doc.lines;
        if( opts.tip_function ) opts.tip_function( doc.line( lastline ), e.from.ch + e.text.length );
      }
      else {
        instance.hide_function_tip( true );
      }
    });

    // notification listener for CM scroll event,
    // which may be more useful that normal scroll event
    if( opts.scroll ){
      cm.on( "scroll", opts.scroll );
    }
    
    // notification listener for CM viewport change event
    if( opts.viewport_change ){
      cm.on( "viewportChange", opts.viewport_change );
    };
      
    cm.on( "beforeChange", function(cm, e){

      // todo: split paste into separate lines,
      // paste with carets and exec in order (line-by-line)

      if( e.origin ){
        
        var doc = cm.state.doc;
        var lastline = doc.lines;

        if( e.origin[0] === "+" ){
          if( state === EXEC_STATE.EXEC ) e.cancel();
          if( e.from.line != lastline ){
            e.to.line = e.from.line = lastline;
            e.from.ch = e.to.ch = doc.line( lastline ).length;
          }
          else if( e.from.ch < prompt_len ){
            e.from.ch = e.to.ch = prompt_len;
          }
        }
        else if( e.origin === "undo" ){
          if( state !== EXEC_STATE.EDIT ) e.cancel();
          if( e.from.line !== lastline 
            || e.to.line !== lastline 
            || e.from.ch < prompt_len 
            || e.to.ch < prompt_len 
            || e.from.ch === e.to.ch ) e.cancel();
        }
        else if( e.origin === "paste" ){
          if( state !== EXEC_STATE.EDIT ) e.cancel();

          // text is split into multiple lines, which is handy.
          // if the last line includes a carriage return, then
          // that becomes a new (empty) entry in the array.

          if( e.from.line != lastline ){
            e.to.line = e.from.line = lastline;
            e.from.ch = e.to.ch = doc.line( lastline ).length;
          }
          else if( e.from.ch < prompt_len ){
            e.from.ch = e.to.ch = prompt_len;
          }

          // after adjusting for position (above), we don't
          // have to do anything for a paste w/o newline.

          if( e.text.length === 1 ) return;

          // there's a bit of weirdness with text after the
          // paste position if the paste has newlines. take whatever's
          // on the line AFTER the paste position and store that
          // in the paste array (FIXME: need to not execute it,
          // but we can't edit the document in this callback).

          // capture lines after 1

          paste_buffer = e.text.slice(1);

          // and drop from the paste

          e.text.splice(1);

          // do the exec after CM has finished processing the change

          setImmediate(function(){
            exec_line( cm );
          });

        }
      }
      // dev // else console.info( e.origin );
    });

    cm.setOption("extraKeys", {

      // command history
      Up: function(cm){ 
        if( event_cache ) return;

        shell_history( true ); 
      },
      Down: function(cm){ 
        if( event_cache ) return;

        shell_history( false );
      },

      Esc: function(cm){
        
        if( event_cache ){
          opts.function_key_callback( 'esc' );
          event_cache = [];
        }
        else {
          // don't pass through if we consume it
          if( !instance.hide_function_tip( true ))
            opts.function_key_callback( 'esc' );
        }
      },

      F3: function(cm){
        if( event_cache ) return;

        opts.function_key_callback( 'f3' );
      },

      // keep in bounds
      Left: function(cm){
        if( event_cache ) return;

        var cursor = cm.state.selection.main.head;
        var doc = cm.state.doc;
        var lineno = doc.lines;

        if( pos.line < lineno ){
          doc.setSelection({ line: lineno, ch: doc.line(lineno).length });
        }
        else if( pos.ch > prompt_len ){
          doc.setSelection({ line: lineno, ch: pos.ch-1 });
        }
      },

      Right: function(cm){
        if( event_cache ) return;

        var cursor = cm.state.selection.main.head;
        var doc = cm.state.doc;
        var lineno = doc.lines;

        if( pos.line < lineno ){
          doc.setCursor({ line: lineno, ch: doc.line(lineno).length });
        }
        else if( pos.ch < prompt_len ){
          doc.setCursor({ line: lineno, ch: prompt_len });
        }
        else {
          doc.setCursor({ line: lineno, ch: pos.ch+1 });
        }
      },

      'Ctrl-Left': function(cm){
        if( event_cache ) return;

        var cursor = cm.state.selection.main.head;
        var doc = cm.state.doc;
        var lineno = doc.lines;
        if( pos.line < lineno ){
          doc.setCursor({ line: lineno, ch: doc.line(lineno).length });
        }
        else if( pos.ch <= prompt_len ){
          doc.setCursor({ line: lineno, ch: prompt_len });
        }
        else return CodeMirror_.Pass
      },

      'Ctrl+Right': function(cm){
        if( event_cache ) return;
        
        var cursor = cm.state.selection.main.head;
        var doc = cm.state.doc;
        var lineno = doc.lines;
        if( pos.line < lineno ){
          doc.setCursor({ line: lineno, ch: doc.line(lineno).length });
        }
        else if( pos.ch < prompt_len ){
          doc.setCursor({ line: lineno, ch: prompt_len });
        }
        else {
          return CodeMirror_.pass;
        }

      },

      Home: function(cm){
        if( event_cache ) return;
        
        var doc = cm.state.doc;
        doc.setSelection({ line: doc.lines, ch: prompt_len });
      },

      Tab: function(cm){
        if( event_cache ) return;
        
        if( opts.hint_function ){

          // we're treating this slightly differently by passing only
          // (1) the current line, and (2) the caret position in that
          // line (offset for prompt)

          cm.showHint({
            hint: local_hint_function
          });

        }
      },

      // exec
      Enter: function(cm) {
        if( event_cache ) return;
        event_cache_skip = true;	
        exec_line( cm );
      }

    });
  */

    // FIXME: optional
    history.restore();

    // expose the options object
    instance.opts = opts;

    // this is exported for debug purposes (FIXME: flag)
    if (opts.debug) instance.cm = view;
  })();
}

const banner = "Welcome to Node.js v0.0.1.\nType \".help\" for more information.\n";

const notImplementedText = " ________________________________ \n< sorry, this is not implemented >\n -------------------------------- \n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||\n";

const Terminal_svelte_svelte_type_style_lang = '';

/* src/svelte/components/apps/Terminal/Terminal.svelte generated by Svelte v3.53.1 */

function create_fragment(ctx) {
	let section1;
	let header;
	let t;
	let section0;
	let div;

	return {
		c() {
			section1 = element("section");
			header = element("header");
			t = space();
			section0 = element("section");
			div = element("div");
			attr(header, "class", "app-window-drag-handle titlebar svelte-yr5heg");
			attr(div, "class", "termparent svelte-yr5heg");
			attr(div, "id", "term-parent");
			attr(section0, "class", "main-area svelte-yr5heg");
			attr(section1, "class", "container svelte-yr5heg");
			toggle_class(section1, "dark", /*$theme*/ ctx[2].scheme === 'dark');
		},
		m(target, anchor) {
			insert(target, section1, anchor);
			append(section1, header);
			append(section1, t);
			append(section1, section0);
			append(section0, div);
			/*div_binding*/ ctx[3](div);
			/*section1_binding*/ ctx[4](section1);
		},
		p(ctx, [dirty]) {
			if (dirty & /*$theme*/ 4) {
				toggle_class(section1, "dark", /*$theme*/ ctx[2].scheme === 'dark');
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(section1);
			/*div_binding*/ ctx[3](null);
			/*section1_binding*/ ctx[4](null);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let $theme;
	component_subscribe($$self, theme, $$value => $$invalidate(2, $theme = $$value));
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
				exec_function
			});

		/**
* set up style and focus
*/
		//shell.setOption( "theme", "zenburn" );
		shell.focus();

		shell.response(banner, "banner");
		console.log("shell", shell);
	});

	/**
* this is our interpreter.  note that writing responses to the shell
* is decoupled from commands -- the result of this function (via callback)
* only affects display of the prompt.
*/
	function exec_function(cmd, callback) {
		if (cmd == ".help") {
			shell.response(notImplementedText);
			callback.call(this, { parsestatus: shell.PARSE_STATUS.OK });
			return;
		}

		var ps = shell.PARSE_STATUS.OK;

		if (cmd.length) {
			var composed = cmd.join("\n");
			console.log("composed", composed);
			const parse = esprima.exports.parse;

			try {
				parse(composed);
			} catch(err) {
				console.log("err", err);

				if (err.description.match(/Unexpected end of input/)) {
					ps = shell.PARSE_STATUS.INCOMPLETE;
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
					console.log("eval:\n" + composed);

					var text, result = window.eval(composed);
					console.log("eval", { text, result });

					try {
						text = JSON.stringify(result);
					} catch(e) {
						text = result.toString();
					}

					// unix convention: newline after every line
					text += "\n";

					// send result to shell
					shell.response(text);
				} catch(e) {
					shell.response(e.name + ": " + e.message + "\n", "shell-error");
				}
			}
		}

		callback.call(this, { parsestatus: ps });
	}

	/** one overloaded global method */
	// @ts-ignore Type '(a: any) => void' is not assignable to type '() => void'.ts(2322)
	globalThis.print = function (a) {
		shell.response(JSON.stringify(a));
	};

	let windowElement;

	function div_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			terminalParent = $$value;
			$$invalidate(0, terminalParent);
		});
	}

	function section1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			windowElement = $$value;
			$$invalidate(1, windowElement);
		});
	}

	return [terminalParent, windowElement, $theme, div_binding, section1_binding];
}

class Terminal extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

export { Terminal as default };
