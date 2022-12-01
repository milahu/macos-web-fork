true&&(function polyfill() {
    const relList = document.createElement('link').relList;
    if (relList && relList.supports && relList.supports('modulepreload')) {
        return;
    }
    for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
        processPreload(link);
    }
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') {
                continue;
            }
            for (const node of mutation.addedNodes) {
                if (node.tagName === 'LINK' && node.rel === 'modulepreload')
                    processPreload(node);
            }
        }
    }).observe(document, { childList: true, subtree: true });
    function getFetchOpts(script) {
        const fetchOpts = {};
        if (script.integrity)
            fetchOpts.integrity = script.integrity;
        if (script.referrerpolicy)
            fetchOpts.referrerPolicy = script.referrerpolicy;
        if (script.crossorigin === 'use-credentials')
            fetchOpts.credentials = 'include';
        else if (script.crossorigin === 'anonymous')
            fetchOpts.credentials = 'omit';
        else
            fetchOpts.credentials = 'same-origin';
        return fetchOpts;
    }
    function processPreload(link) {
        if (link.ep)
            // ep marker = processed
            return;
        link.ep = true;
        // prepopulate the load record
        const fetchOpts = getFetchOpts(link);
        fetch(link.href, fetchOpts);
    }
}());

function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function is_promise(value) {
    return value && typeof value === 'object' && typeof value.then === 'function';
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
let src_url_equal_anchor;
function src_url_equal(element_src, url) {
    if (!src_url_equal_anchor) {
        src_url_equal_anchor = document.createElement('a');
    }
    src_url_equal_anchor.href = url;
    return element_src === src_url_equal_anchor.href;
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function get_all_dirty_from_scope($$scope) {
    if ($$scope.ctx.length > 32) {
        const dirty = [];
        const length = $$scope.ctx.length / 32;
        for (let i = 0; i < length; i++) {
            dirty[i] = -1;
        }
        return dirty;
    }
    return -1;
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}
function set_store_value(store, ret, value) {
    store.set(value);
    return ret;
}
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}
function append(target, node) {
    target.appendChild(node);
}
function get_root_for_style(node) {
    if (!node)
        return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && root.host) {
        return root;
    }
    return node.ownerDocument;
}
function append_empty_stylesheet(node) {
    const style_element = element('style');
    append_stylesheet(get_root_for_style(node), style_element);
    return style_element.sheet;
}
function append_stylesheet(node, style) {
    append(node.head || node, style);
    return style.sheet;
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
    return function (event) {
        event.preventDefault();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function stop_propagation(fn) {
    return function (event) {
        event.stopPropagation();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_svg_attributes(node, attributes) {
    for (const key in attributes) {
        attr(node, key, attributes[key]);
    }
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data)
        text.data = data;
}
function set_style(node, key, value, important) {
    if (value === null) {
        node.style.removeProperty(key);
    }
    else {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, bubbles, cancelable, detail);
    return e;
}

// we need to store the information for multiple documents because a Svelte application could also contain iframes
// https://github.com/sveltejs/svelte/issues/3624
const managed_styles = new Map();
let active = 0;
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_style_information(doc, node) {
    const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
    managed_styles.set(doc, info);
    return info;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    const doc = get_root_for_style(node);
    const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
    if (!rules[name]) {
        rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    const previous = (node.style.animation || '').split(', ');
    const next = previous.filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
        node.style.animation = next.join(', ');
        active -= deleted;
        if (!active)
            clear_rules();
    }
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        managed_styles.forEach(info => {
            const { ownerNode } = info.stylesheet;
            // there is no ownerNode if it runs on jsdom.
            if (ownerNode)
                detach(ownerNode);
        });
        managed_styles.clear();
    });
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs#run-time-svelte-onmount
 */
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
/**
 * Schedules a callback to run immediately before the component is unmounted.
 *
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
 * only one that runs inside a server-side component.
 *
 * https://svelte.dev/docs#run-time-svelte-ondestroy
 */
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
/**
 * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
 *
 * Component events created with `createEventDispatcher` create a
 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
 * property and can contain any type of data.
 *
 * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
 */
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail, { cancelable = false } = {}) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail, { cancelable });
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
            return !event.defaultPrevented;
        }
        return true;
    };
}
// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
        // @ts-ignore
        callbacks.slice().forEach(fn => fn.call(this, event));
    }
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function tick() {
    schedule_update();
    return resolved_promise;
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function add_flush_callback(fn) {
    flush_callbacks.push(fn);
}
// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();
let flushidx = 0; // Do *not* move this inside the flush() function
function flush() {
    const saved_component = current_component;
    do {
        // first, call beforeUpdate functions
        // and update components
        while (flushidx < dirty_components.length) {
            const component = dirty_components[flushidx];
            flushidx++;
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
    else if (callback) {
        callback();
    }
}
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
    let config = fn(node, params);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
        tick(0, 1);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        if (task)
            task.abort();
        running = true;
        add_render_callback(() => dispatch(node, true, 'start'));
        task = loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(1, 0);
                    dispatch(node, true, 'end');
                    cleanup();
                    return running = false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(t, 1 - t);
                }
            }
            return running;
        });
    }
    let started = false;
    return {
        start() {
            if (started)
                return;
            started = true;
            delete_rule(node);
            if (is_function(config)) {
                config = config();
                wait().then(go);
            }
            else {
                go();
            }
        },
        invalidate() {
            started = false;
        },
        end() {
            if (running) {
                cleanup();
                running = false;
            }
        }
    };
}
function create_out_transition(node, fn, params) {
    let config = fn(node, params);
    let running = true;
    let animation_name;
    const group = outros;
    group.r += 1;
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        add_render_callback(() => dispatch(node, false, 'start'));
        loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(0, 1);
                    dispatch(node, false, 'end');
                    if (!--group.r) {
                        // this will result in `end()` being called,
                        // so we don't need to clean up here
                        run_all(group.c);
                    }
                    return false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(1 - t, t);
                }
            }
            return running;
        });
    }
    if (is_function(config)) {
        wait().then(() => {
            // @ts-ignore
            config = config();
            go();
        });
    }
    else {
        go();
    }
    return {
        end(reset) {
            if (reset && config.tick) {
                config.tick(1, 0);
            }
            if (running) {
                if (animation_name)
                    delete_rule(node, animation_name);
                running = false;
            }
        }
    };
}

function handle_promise(promise, info) {
    const token = info.token = {};
    function update(type, index, key, value) {
        if (info.token !== token)
            return;
        info.resolved = value;
        let child_ctx = info.ctx;
        if (key !== undefined) {
            child_ctx = child_ctx.slice();
            child_ctx[key] = value;
        }
        const block = type && (info.current = type)(child_ctx);
        let needs_flush = false;
        if (info.block) {
            if (info.blocks) {
                info.blocks.forEach((block, i) => {
                    if (i !== index && block) {
                        group_outros();
                        transition_out(block, 1, 1, () => {
                            if (info.blocks[i] === block) {
                                info.blocks[i] = null;
                            }
                        });
                        check_outros();
                    }
                });
            }
            else {
                info.block.d(1);
            }
            block.c();
            transition_in(block, 1);
            block.m(info.mount(), info.anchor);
            needs_flush = true;
        }
        info.block = block;
        if (info.blocks)
            info.blocks[index] = block;
        if (needs_flush) {
            flush();
        }
    }
    if (is_promise(promise)) {
        const current_component = get_current_component();
        promise.then(value => {
            set_current_component(current_component);
            update(info.then, 1, info.value, value);
            set_current_component(null);
        }, error => {
            set_current_component(current_component);
            update(info.catch, 2, info.error, error);
            set_current_component(null);
            if (!info.hasCatch) {
                throw error;
            }
        });
        // if we previously had a then/catch block, destroy it
        if (info.current !== info.pending) {
            update(info.pending, 0);
            return true;
        }
    }
    else {
        if (info.current !== info.then) {
            update(info.then, 1, info.value, promise);
            return true;
        }
        info.resolved = promise;
    }
}
function update_await_block_branch(info, ctx, dirty) {
    const child_ctx = ctx.slice();
    const { resolved } = info;
    if (info.current === info.then) {
        child_ctx[info.value] = resolved;
    }
    if (info.current === info.catch) {
        child_ctx[info.error] = resolved;
    }
    info.block.p(child_ctx, dirty);
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);

function destroy_block(block, lookup) {
    block.d(1);
    lookup.delete(block.key);
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
        old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = new Map();
    const deltas = new Map();
    i = n;
    while (i--) {
        const child_ctx = get_context(ctx, list, i);
        const key = get_key(child_ctx);
        let block = lookup.get(key);
        if (!block) {
            block = create_each_block(key, child_ctx);
            block.c();
        }
        else if (dynamic) {
            block.p(child_ctx, dirty);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
            deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = new Set();
    const did_move = new Set();
    function insert(block) {
        transition_in(block, 1);
        block.m(node, next);
        lookup.set(block.key, block);
        next = block.first;
        n--;
    }
    while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        const new_key = new_block.key;
        const old_key = old_block.key;
        if (new_block === old_block) {
            // do nothing
            next = new_block.first;
            o--;
            n--;
        }
        else if (!new_lookup.has(old_key)) {
            // remove old block
            destroy(old_block, lookup);
            o--;
        }
        else if (!lookup.has(new_key) || will_move.has(new_key)) {
            insert(new_block);
        }
        else if (did_move.has(old_key)) {
            o--;
        }
        else if (deltas.get(new_key) > deltas.get(old_key)) {
            did_move.add(new_key);
            insert(new_block);
        }
        else {
            will_move.add(old_key);
            o--;
        }
    }
    while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block.key))
            destroy(old_block, lookup);
    }
    while (n)
        insert(new_blocks[n - 1]);
    return new_blocks;
}

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}

function bind(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== undefined) {
        component.$$.bound[index] = callback;
        callback(component.$$.ctx[index]);
    }
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
            // if the component was destroyed immediately
            // it will update the `$$.on_destroy` reference to `null`.
            // the destructured on_destroy may still reference to the old array
            if (component.$$.on_destroy) {
                component.$$.on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: [],
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        if (!is_function(callback)) {
            return noop;
        }
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

function clickOutside(node, options) {
  const handleClick = (e) => {
    if (!node.contains(e.target))
      options.callback();
  };
  document.addEventListener("click", handleClick, true);
  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    }
  };
}

function focusOutside(node, options) {
  function handleFocus(e) {
    const target = e.target;
    if (!node?.contains(target))
      options.callback();
  }
  document.addEventListener("focus", handleFocus, true);
  return {
    destroy() {
      document.removeEventListener("focus", handleFocus, true);
    }
  };
}

let trapFocusList = [];
const isNext = (event) => event.key === "Tab" && !event.shiftKey;
const isPrevious = (event) => event.key === "Tab" && event.shiftKey;
const trapFocusListener = (event) => {
  if (event.target === window) {
    return;
  }
  const eventTarget = event.target;
  const parentNode = trapFocusList.find((node) => node.contains(eventTarget));
  if (!parentNode) {
    return;
  }
  const focusable = parentNode.querySelectorAll(
    "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]"
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (isNext(event) && event.target === last) {
    event.preventDefault();
    first.focus();
  } else if (isPrevious(event) && event.target === first) {
    event.preventDefault();
    last.focus();
  }
};
document.addEventListener("keydown", trapFocusListener);
const trapFocus = (node) => {
  trapFocusList.push(node);
  return {
    destroy() {
      trapFocusList = trapFocusList.filter((element) => element !== node);
    }
  };
};

function portal(el, target = "body") {
  let targetEl;
  async function update(newTarget) {
    target = newTarget;
    if (typeof target === "string") {
      targetEl = document.querySelector(target);
      if (targetEl === null) {
        await tick();
        targetEl = document.querySelector(target);
      }
      if (targetEl === null) {
        throw new Error(`No element found matching css selector: "${target}"`);
      }
    } else if (target instanceof HTMLElement) {
      targetEl = target;
    } else {
      throw new TypeError(
        `Unknown portal target type: ${target === null ? "null" : typeof target}. Allowed types: string (CSS selector) or HTMLElement.`
      );
    }
    targetEl.appendChild(el);
    el.hidden = false;
  }
  function destroy() {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }
  update(target);
  return {
    update,
    destroy
  };
}

const zIndexConfig = {
  wallpaper: -1,
  "bootup-screen": 110,
  "context-menu": 100,
  "window-traffic-lights": 10,
  dock: 80,
  "dock-tooltip": 70,
  "system-updates-available": 60,
  "system-dialog": 90,
  "menubar-menu-parent": 160
};
for (const [element, zIndexValue] of Object.entries(zIndexConfig)) {
  document.body.style.setProperty(`--system-z-index-${element}`, zIndexValue + "");
}
function elevation(node, uiElement) {
  node.style.zIndex = `var(--system-z-index-${uiElement})`;
}

const createAppConfig = (et) => ({
  shouldOpenWindow: true,
  dockBreaksBefore: false,
  resizable: true,
  expandable: false,
  width: 600,
  height: 500,
  ...et
});

const wallpapers = createAppConfig({
  title: "Wallpapers",
  resizable: true,
  height: 600,
  width: 800,
  dockBreaksBefore: true
});
const calculator = createAppConfig({
  title: "Calculator",
  expandable: true,
  resizable: false,
  height: 300 * 1.414,
  width: 300
});
const calendar$1 = createAppConfig({
  title: "Calendar",
  resizable: true
});
const vscode = createAppConfig({
  title: "VSCode",
  resizable: true,
  height: 600,
  width: 800
});
const finder = createAppConfig({
  title: "Finder",
  resizable: true,
  shouldOpenWindow: false
});
createAppConfig({
  title: "Safari",
  resizable: true
});
createAppConfig({
  title: "System Preferences",
  resizable: true
});
const purusTwitter = createAppConfig({
  title: `About the Developer`,
  resizable: true,
  dockBreaksBefore: true,
  height: 600,
  width: 800
});
const viewSource = createAppConfig({
  title: `View Source`,
  resizable: true,
  shouldOpenWindow: false,
  externalAction: () => window.open("https://github.com/puruvj/macos-web", "_blank")
});
const ukraine = createAppConfig({
  title: `Support Ukraine`,
  resizable: true,
  shouldOpenWindow: false,
  externalAction: () => window.open("https://www.stopputin.net/", "_blank"),
  dockBreaksBefore: true
});
const vercel = createAppConfig({
  title: `Powered by Vercel`,
  resizable: true,
  shouldOpenWindow: false,
  externalAction: () => window.open("https://vercel.com/?utm_source=purus-projects&utm_campaign=oss", "_blank"),
  dockBreaksBefore: true
});
const appstore = createAppConfig({
  title: "App Store",
  resizable: true
});
const appsConfig = {
  finder,
  wallpapers,
  calculator,
  calendar: calendar$1,
  vscode,
  appstore,
  "purus-twitter": purusTwitter,
  "view-source": viewSource,
  vercel,
  ukraine
};

const subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
    return {
        subscribe: writable$1(value, start).subscribe
    };
}
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable$1(value, start = noop) {
    let stop;
    const subscribers = new Set();
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (const subscriber of subscribers) {
                    subscriber[1]();
                    subscriber_queue.push(subscriber, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.add(subscriber);
        if (subscribers.size === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            subscribers.delete(subscriber);
            if (subscribers.size === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

const openApps = writable$1({
  wallpapers: false,
  finder: true,
  vscode: false,
  calculator: false,
  appstore: false,
  calendar: false,
  "purus-twitter": false,
  "view-source": true,
  vercel: true,
  ukraine: true
});
const activeApp = writable$1("finder");
const activeAppZIndex = writable$1(-2);
const appZIndices = writable$1({
  wallpapers: 0,
  finder: 0,
  vscode: 0,
  calculator: 0,
  appstore: 0,
  calendar: 0,
  "purus-twitter": 0,
  "view-source": 0,
  vercel: 0,
  ukraine: 0
});
const isAppBeingDragged = writable$1(false);
const appsInFullscreen = writable$1({
  wallpapers: false,
  finder: false,
  vscode: false,
  calculator: false,
  appstore: false,
  calendar: false,
  "purus-twitter": false,
  "view-source": false,
  vercel: false,
  ukraine: false
});

const systemNeedsUpdate = writable$1(false);

const isDockHidden = writable$1(false);

var invariant = function () { };

const clamp$1 = (min, max, v) => Math.min(Math.max(v, min), max);

const progress = (from, to, value) => {
    const toFromDifference = to - from;
    return toFromDifference === 0 ? 1 : (value - from) / toFromDifference;
};

const mix = (from, to, progress) => -progress * from + progress * to + from;

const clamp = (min, max) => (v) => Math.max(Math.min(v, max), min);
const sanitize = (v) => (v % 1 ? Number(v.toFixed(5)) : v);
const floatRegex = /(-)?([\d]*\.?[\d])+/g;
const colorRegex = /(#[0-9a-f]{6}|#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2}(-?[\d\.]+%?)\s*[\,\/]?\s*[\d\.]*%?\))/gi;
const singleColorRegex = /^(#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2}(-?[\d\.]+%?)\s*[\,\/]?\s*[\d\.]*%?\))$/i;
function isString(v) {
    return typeof v === 'string';
}

const number = {
    test: (v) => typeof v === 'number',
    parse: parseFloat,
    transform: (v) => v,
};
const alpha = Object.assign(Object.assign({}, number), { transform: clamp(0, 1) });
Object.assign(Object.assign({}, number), { default: 1 });

const createUnitType = (unit) => ({
    test: (v) => isString(v) && v.endsWith(unit) && v.split(' ').length === 1,
    parse: parseFloat,
    transform: (v) => `${v}${unit}`,
});
const percent = createUnitType('%');
Object.assign(Object.assign({}, percent), { parse: (v) => percent.parse(v) / 100, transform: (v) => percent.transform(v * 100) });

const isColorString = (type, testProp) => (v) => {
    return Boolean((isString(v) && singleColorRegex.test(v) && v.startsWith(type)) ||
        (testProp && Object.prototype.hasOwnProperty.call(v, testProp)));
};
const splitColor = (aName, bName, cName) => (v) => {
    if (!isString(v))
        return v;
    const [a, b, c, alpha] = v.match(floatRegex);
    return {
        [aName]: parseFloat(a),
        [bName]: parseFloat(b),
        [cName]: parseFloat(c),
        alpha: alpha !== undefined ? parseFloat(alpha) : 1,
    };
};

const hsla = {
    test: isColorString('hsl', 'hue'),
    parse: splitColor('hue', 'saturation', 'lightness'),
    transform: ({ hue, saturation, lightness, alpha: alpha$1 = 1 }) => {
        return ('hsla(' +
            Math.round(hue) +
            ', ' +
            percent.transform(sanitize(saturation)) +
            ', ' +
            percent.transform(sanitize(lightness)) +
            ', ' +
            sanitize(alpha.transform(alpha$1)) +
            ')');
    },
};

const clampRgbUnit = clamp(0, 255);
const rgbUnit = Object.assign(Object.assign({}, number), { transform: (v) => Math.round(clampRgbUnit(v)) });
const rgba = {
    test: isColorString('rgb', 'red'),
    parse: splitColor('red', 'green', 'blue'),
    transform: ({ red, green, blue, alpha: alpha$1 = 1 }) => 'rgba(' +
        rgbUnit.transform(red) +
        ', ' +
        rgbUnit.transform(green) +
        ', ' +
        rgbUnit.transform(blue) +
        ', ' +
        sanitize(alpha.transform(alpha$1)) +
        ')',
};

function parseHex(v) {
    let r = '';
    let g = '';
    let b = '';
    let a = '';
    if (v.length > 5) {
        r = v.substr(1, 2);
        g = v.substr(3, 2);
        b = v.substr(5, 2);
        a = v.substr(7, 2);
    }
    else {
        r = v.substr(1, 1);
        g = v.substr(2, 1);
        b = v.substr(3, 1);
        a = v.substr(4, 1);
        r += r;
        g += g;
        b += b;
        a += a;
    }
    return {
        red: parseInt(r, 16),
        green: parseInt(g, 16),
        blue: parseInt(b, 16),
        alpha: a ? parseInt(a, 16) / 255 : 1,
    };
}
const hex = {
    test: isColorString('#'),
    parse: parseHex,
    transform: rgba.transform,
};

const color = {
    test: (v) => rgba.test(v) || hex.test(v) || hsla.test(v),
    parse: (v) => {
        if (rgba.test(v)) {
            return rgba.parse(v);
        }
        else if (hsla.test(v)) {
            return hsla.parse(v);
        }
        else {
            return hex.parse(v);
        }
    },
    transform: (v) => {
        return isString(v)
            ? v
            : v.hasOwnProperty('red')
                ? rgba.transform(v)
                : hsla.transform(v);
    },
};

const colorToken = '${c}';
const numberToken = '${n}';
function test(v) {
    var _a, _b, _c, _d;
    return (isNaN(v) &&
        isString(v) &&
        ((_b = (_a = v.match(floatRegex)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) + ((_d = (_c = v.match(colorRegex)) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0);
}
function analyse$1(v) {
    if (typeof v === 'number')
        v = `${v}`;
    const values = [];
    let numColors = 0;
    const colors = v.match(colorRegex);
    if (colors) {
        numColors = colors.length;
        v = v.replace(colorRegex, colorToken);
        values.push(...colors.map(color.parse));
    }
    const numbers = v.match(floatRegex);
    if (numbers) {
        v = v.replace(floatRegex, numberToken);
        values.push(...numbers.map(number.parse));
    }
    return { values, numColors, tokenised: v };
}
function parse(v) {
    return analyse$1(v).values;
}
function createTransformer(v) {
    const { values, numColors, tokenised } = analyse$1(v);
    const numValues = values.length;
    return (v) => {
        let output = tokenised;
        for (let i = 0; i < numValues; i++) {
            output = output.replace(i < numColors ? colorToken : numberToken, i < numColors ? color.transform(v[i]) : sanitize(v[i]));
        }
        return output;
    };
}
const convertNumbersToZero = (v) => typeof v === 'number' ? 0 : v;
function getAnimatableNone(v) {
    const parsed = parse(v);
    const transformer = createTransformer(v);
    return transformer(parsed.map(convertNumbersToZero));
}
const complex = { test, parse, createTransformer, getAnimatableNone };

function hueToRgb(p, q, t) {
    if (t < 0)
        t += 1;
    if (t > 1)
        t -= 1;
    if (t < 1 / 6)
        return p + (q - p) * 6 * t;
    if (t < 1 / 2)
        return q;
    if (t < 2 / 3)
        return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}
function hslaToRgba({ hue, saturation, lightness, alpha }) {
    hue /= 360;
    saturation /= 100;
    lightness /= 100;
    let red = 0;
    let green = 0;
    let blue = 0;
    if (!saturation) {
        red = green = blue = lightness;
    }
    else {
        const q = lightness < 0.5
            ? lightness * (1 + saturation)
            : lightness + saturation - lightness * saturation;
        const p = 2 * lightness - q;
        red = hueToRgb(p, q, hue + 1 / 3);
        green = hueToRgb(p, q, hue);
        blue = hueToRgb(p, q, hue - 1 / 3);
    }
    return {
        red: Math.round(red * 255),
        green: Math.round(green * 255),
        blue: Math.round(blue * 255),
        alpha,
    };
}

const mixLinearColor = (from, to, v) => {
    const fromExpo = from * from;
    const toExpo = to * to;
    return Math.sqrt(Math.max(0, v * (toExpo - fromExpo) + fromExpo));
};
const colorTypes = [hex, rgba, hsla];
const getColorType = (v) => colorTypes.find((type) => type.test(v));
const mixColor = (from, to) => {
    let fromColorType = getColorType(from);
    let toColorType = getColorType(to);
    let fromColor = fromColorType.parse(from);
    let toColor = toColorType.parse(to);
    if (fromColorType === hsla) {
        fromColor = hslaToRgba(fromColor);
        fromColorType = rgba;
    }
    if (toColorType === hsla) {
        toColor = hslaToRgba(toColor);
        toColorType = rgba;
    }
    const blended = Object.assign({}, fromColor);
    return (v) => {
        for (const key in blended) {
            if (key !== "alpha") {
                blended[key] = mixLinearColor(fromColor[key], toColor[key], v);
            }
        }
        blended.alpha = mix(fromColor.alpha, toColor.alpha, v);
        return fromColorType.transform(blended);
    };
};

const isNum = (v) => typeof v === 'number';

const combineFunctions = (a, b) => (v) => b(a(v));
const pipe = (...transformers) => transformers.reduce(combineFunctions);

function getMixer(origin, target) {
    if (isNum(origin)) {
        return (v) => mix(origin, target, v);
    }
    else if (color.test(origin)) {
        return mixColor(origin, target);
    }
    else {
        return mixComplex(origin, target);
    }
}
const mixArray = (from, to) => {
    const output = [...from];
    const numValues = output.length;
    const blendValue = from.map((fromThis, i) => getMixer(fromThis, to[i]));
    return (v) => {
        for (let i = 0; i < numValues; i++) {
            output[i] = blendValue[i](v);
        }
        return output;
    };
};
const mixObject = (origin, target) => {
    const output = Object.assign(Object.assign({}, origin), target);
    const blendValue = {};
    for (const key in output) {
        if (origin[key] !== undefined && target[key] !== undefined) {
            blendValue[key] = getMixer(origin[key], target[key]);
        }
    }
    return (v) => {
        for (const key in blendValue) {
            output[key] = blendValue[key](v);
        }
        return output;
    };
};
function analyse(value) {
    const parsed = complex.parse(value);
    const numValues = parsed.length;
    let numNumbers = 0;
    let numRGB = 0;
    let numHSL = 0;
    for (let i = 0; i < numValues; i++) {
        if (numNumbers || typeof parsed[i] === "number") {
            numNumbers++;
        }
        else {
            if (parsed[i].hue !== undefined) {
                numHSL++;
            }
            else {
                numRGB++;
            }
        }
    }
    return { parsed, numNumbers, numRGB, numHSL };
}
const mixComplex = (origin, target) => {
    const template = complex.createTransformer(target);
    const originStats = analyse(origin);
    const targetStats = analyse(target);
    const canInterpolate = originStats.numHSL === targetStats.numHSL &&
        originStats.numRGB === targetStats.numRGB &&
        originStats.numNumbers >= targetStats.numNumbers;
    if (canInterpolate) {
        return pipe(mixArray(originStats.parsed, targetStats.parsed), template);
    }
    else {
        return (p) => `${p > 0 ? target : origin}`;
    }
};

const mixNumber = (from, to) => (p) => mix(from, to, p);
function detectMixerFactory(v) {
    if (typeof v === 'number') {
        return mixNumber;
    }
    else if (typeof v === 'string') {
        if (color.test(v)) {
            return mixColor;
        }
        else {
            return mixComplex;
        }
    }
    else if (Array.isArray(v)) {
        return mixArray;
    }
    else if (typeof v === 'object') {
        return mixObject;
    }
}
function createMixers(output, ease, customMixer) {
    const mixers = [];
    const mixerFactory = customMixer || detectMixerFactory(output[0]);
    const numMixers = output.length - 1;
    for (let i = 0; i < numMixers; i++) {
        let mixer = mixerFactory(output[i], output[i + 1]);
        if (ease) {
            const easingFunction = Array.isArray(ease) ? ease[i] : ease;
            mixer = pipe(easingFunction, mixer);
        }
        mixers.push(mixer);
    }
    return mixers;
}
function fastInterpolate([from, to], [mixer]) {
    return (v) => mixer(progress(from, to, v));
}
function slowInterpolate(input, mixers) {
    const inputLength = input.length;
    const lastInputIndex = inputLength - 1;
    return (v) => {
        let mixerIndex = 0;
        let foundMixerIndex = false;
        if (v <= input[0]) {
            foundMixerIndex = true;
        }
        else if (v >= input[lastInputIndex]) {
            mixerIndex = lastInputIndex - 1;
            foundMixerIndex = true;
        }
        if (!foundMixerIndex) {
            let i = 1;
            for (; i < inputLength; i++) {
                if (input[i] > v || i === lastInputIndex) {
                    break;
                }
            }
            mixerIndex = i - 1;
        }
        const progressInRange = progress(input[mixerIndex], input[mixerIndex + 1], v);
        return mixers[mixerIndex](progressInRange);
    };
}
function interpolate(input, output, { clamp: isClamp = true, ease, mixer } = {}) {
    const inputLength = input.length;
    invariant(inputLength === output.length);
    invariant(!ease || !Array.isArray(ease) || ease.length === inputLength - 1);
    if (input[0] > input[inputLength - 1]) {
        input = [].concat(input);
        output = [].concat(output);
        input.reverse();
        output.reverse();
    }
    const mixers = createMixers(output, ease, mixer);
    const interpolator = inputLength === 2
        ? fastInterpolate(input, mixers)
        : slowInterpolate(input, mixers);
    return isClamp
        ? (v) => interpolator(clamp$1(input[0], input[inputLength - 1], v))
        : interpolator;
}

function quintInOut(t) {
    if ((t *= 2) < 1)
        return 0.5 * t * t * t * t * t;
    return 0.5 * ((t -= 2) * t * t * t * t + 2);
}
function sineInOut(t) {
    return -0.5 * (Math.cos(Math.PI * t) - 1);
}
function sineIn(t) {
    const v = Math.cos(t * Math.PI * 0.5);
    if (Math.abs(v) < 1e-14)
        return 1;
    else
        return 1 - v;
}
function sineOut(t) {
    return Math.sin((t * Math.PI) / 2);
}

function is_date(obj) {
    return Object.prototype.toString.call(obj) === '[object Date]';
}

function tick_spring(ctx, last_value, current_value, target_value) {
    if (typeof current_value === 'number' || is_date(current_value)) {
        // @ts-ignore
        const delta = target_value - current_value;
        // @ts-ignore
        const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
        const spring = ctx.opts.stiffness * delta;
        const damper = ctx.opts.damping * velocity;
        const acceleration = (spring - damper) * ctx.inv_mass;
        const d = (velocity + acceleration) * ctx.dt;
        if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
            return target_value; // settled
        }
        else {
            ctx.settled = false; // signal loop to keep ticking
            // @ts-ignore
            return is_date(current_value) ?
                new Date(current_value.getTime() + d) : current_value + d;
        }
    }
    else if (Array.isArray(current_value)) {
        // @ts-ignore
        return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
    }
    else if (typeof current_value === 'object') {
        const next_value = {};
        for (const k in current_value) {
            // @ts-ignore
            next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
        }
        // @ts-ignore
        return next_value;
    }
    else {
        throw new Error(`Cannot spring ${typeof current_value} values`);
    }
}
function spring(value, opts = {}) {
    const store = writable$1(value);
    const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
    let last_time;
    let task;
    let current_token;
    let last_value = value;
    let target_value = value;
    let inv_mass = 1;
    let inv_mass_recovery_rate = 0;
    let cancel_task = false;
    function set(new_value, opts = {}) {
        target_value = new_value;
        const token = current_token = {};
        if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
            cancel_task = true; // cancel any running animation
            last_time = now();
            last_value = new_value;
            store.set(value = target_value);
            return Promise.resolve();
        }
        else if (opts.soft) {
            const rate = opts.soft === true ? .5 : +opts.soft;
            inv_mass_recovery_rate = 1 / (rate * 60);
            inv_mass = 0; // infinite mass, unaffected by spring forces
        }
        if (!task) {
            last_time = now();
            cancel_task = false;
            task = loop(now => {
                if (cancel_task) {
                    cancel_task = false;
                    task = null;
                    return false;
                }
                inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
                const ctx = {
                    inv_mass,
                    opts: spring,
                    settled: true,
                    dt: (now - last_time) * 60 / 1000
                };
                const next_value = tick_spring(ctx, last_value, value, target_value);
                last_time = now;
                last_value = value;
                store.set(value = next_value);
                if (ctx.settled) {
                    task = null;
                }
                return !ctx.settled;
            });
        }
        return new Promise(fulfil => {
            task.promise.then(() => {
                if (token === current_token)
                    fulfil();
            });
        });
    }
    const spring = {
        set,
        update: (fn, opts) => set(fn(target_value, value), opts),
        subscribe: store.subscribe,
        stiffness,
        damping,
        precision
    };
    return spring;
}

function get_interpolator(a, b) {
    if (a === b || a !== a)
        return () => a;
    const type = typeof a;
    if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
        throw new Error('Cannot interpolate values of different type');
    }
    if (Array.isArray(a)) {
        const arr = b.map((bi, i) => {
            return get_interpolator(a[i], bi);
        });
        return t => arr.map(fn => fn(t));
    }
    if (type === 'object') {
        if (!a || !b)
            throw new Error('Object cannot be null');
        if (is_date(a) && is_date(b)) {
            a = a.getTime();
            b = b.getTime();
            const delta = b - a;
            return t => new Date(a + t * delta);
        }
        const keys = Object.keys(b);
        const interpolators = {};
        keys.forEach(key => {
            interpolators[key] = get_interpolator(a[key], b[key]);
        });
        return t => {
            const result = {};
            keys.forEach(key => {
                result[key] = interpolators[key](t);
            });
            return result;
        };
    }
    if (type === 'number') {
        const delta = b - a;
        return t => a + t * delta;
    }
    throw new Error(`Cannot interpolate ${type} values`);
}
function tweened(value, defaults = {}) {
    const store = writable$1(value);
    let task;
    let target_value = value;
    function set(new_value, opts) {
        if (value == null) {
            store.set(value = new_value);
            return Promise.resolve();
        }
        target_value = new_value;
        let previous_task = task;
        let started = false;
        let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
        if (duration === 0) {
            if (previous_task) {
                previous_task.abort();
                previous_task = null;
            }
            store.set(value = target_value);
            return Promise.resolve();
        }
        const start = now() + delay;
        let fn;
        task = loop(now => {
            if (now < start)
                return true;
            if (!started) {
                fn = interpolate(value, new_value);
                if (typeof duration === 'function')
                    duration = duration(value, new_value);
                started = true;
            }
            if (previous_task) {
                previous_task.abort();
                previous_task = null;
            }
            const elapsed = now - start;
            if (elapsed > duration) {
                store.set(value = new_value);
                return false;
            }
            // @ts-ignore
            store.set(value = fn(easing(elapsed / duration)));
            return true;
        });
        return task.promise;
    }
    return {
        set,
        update: (fn, opts) => set(fn(target_value, value), opts),
        subscribe: store.subscribe
    };
}

// index.ts
var stores = {};
function writable(key, initialValue, options) {
  const browser = typeof localStorage != "undefined" && typeof window != "undefined";
  const serializer = (options == null ? void 0 : options.serializer) || JSON;
  function updateStorage(key2, value) {
    if (!browser)
      return;
    localStorage.setItem(key2, serializer.stringify(value));
  }
  if (!stores[key]) {
    const store = writable$1(initialValue, (set2) => {
      const json = browser ? localStorage.getItem(key) : null;
      if (json) {
        set2(serializer.parse(json));
      }
      if (browser) {
        const handleStorage = (event) => {
          if (event.key === key)
            set2(event.newValue ? serializer.parse(event.newValue) : null);
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
      }
    });
    const { subscribe, set } = store;
    stores[key] = {
      set(value) {
        updateStorage(key, value);
        set(value);
      },
      update(updater) {
        const value = updater(get_store_value(store));
        updateStorage(key, value);
        set(value);
      },
      subscribe
    };
  }
  return stores[key];
}

const prefersReducedMotion = writable(
  "macos:is-reduced-motion",
  matchMedia("(prefers-reduced-motion)").matches
);

const colorsConfig = (et) => et;
const colors = colorsConfig({
  orange: {
    light: {
      hsl: "35deg, 100%, 50%",
      contrastHsl: "240, 3%, 11%"
    },
    dark: {
      hsl: "36deg, 100%, 52%",
      contrastHsl: "240, 3%, 11%"
    }
  },
  green: {
    light: {
      hsl: "135deg, 59%, 49%",
      contrastHsl: "135deg, 60%, 4%"
    },
    dark: {
      hsl: "135deg, 64%, 50%",
      contrastHsl: "135deg, 60%, 4%"
    }
  },
  cyan: {
    light: {
      hsl: "199deg, 78%, 55%",
      contrastHsl: "199deg, 78%, 100%"
    },
    dark: {
      hsl: "197deg, 100%, 70%",
      contrastHsl: "197deg, 100%, 5%"
    }
  },
  blue: {
    light: {
      hsl: "211, 100%, 50%",
      contrastHsl: "240, 24%, 100%"
    },
    dark: {
      hsl: "210, 100%, 52%",
      contrastHsl: "210, 92%, 5%"
    }
  },
  indigo: {
    light: {
      hsl: "241deg, 61%, 59%",
      contrastHsl: "241deg, 61%, 98%"
    },
    dark: {
      hsl: "241deg, 73%, 63%",
      contrastHsl: "241deg, 73%, 5%"
    }
  },
  purple: {
    light: {
      hsl: "280deg, 68%, 60%",
      contrastHsl: "280deg, 68%, 98%"
    },
    dark: {
      hsl: "280deg, 85%, 65%",
      contrastHsl: "280deg, 85%, 5%"
    }
  },
  pink: {
    light: {
      hsl: "349deg, 100%, 59%",
      contrastHsl: "349deg, 100%, 95%"
    },
    dark: {
      hsl: "348deg, 100%, 61%",
      contrastHsl: "348deg, 100%, 5%"
    }
  }
});

const theme = writable("macos:theme-settings", {
  scheme: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  primaryColor: "blue"
});
theme.subscribe(({ scheme, primaryColor }) => {
  const { classList } = document.body;
  classList.remove("light", "dark");
  classList.add(scheme);
  const colorObj = colors[primaryColor][scheme];
  document.body.style.setProperty("--system-color-primary", `hsl(${colorObj.hsl})`);
  document.body.style.setProperty("--system-color-primary-hsl", `${colorObj.hsl}`);
  document.body.style.setProperty(
    "--system-color-primary-contrast",
    `hsl(${colorObj.contrastHsl})`
  );
  document.body.style.setProperty("--system-color-primary-contrast-hsl", `${colorObj.contrastHsl}`);
});

const bug = "/bug.svg";

const search = "/search.svg";

const bar = "/bar.svg";

const folder = "/folder.svg";

const image = "/file-image.svg";

const file = "/file.svg";

const document$1 = "/document.svg";

const edit = "/edit.svg";

const download = "/download.svg";

const upload = "/upload.svg";

const check = "/check.svg";

const close = "/close.svg";

const calendar = "/calendar.svg";

const browser = "/browser.svg";

const comment = "/comment.svg";

const comment_o = "/comment-o.svg";

const github = "/github-alt.svg";

const heart = "/heart.svg";

const heart_o = "/heart-o.svg";

const star = "/star.svg";

const star_o = "/star-o.svg";

const moon = "/moon.svg";

const sunny_o = "/sunny-o.svg";

const print = "/print.svg";

const play = "/play.svg";

const pause = "/pause.svg";

const stop = "/stop.svg";

const sync = "/sync.svg";

const fork = "/fork.svg";

const code = "/code.svg";

const app_menu = "/app-menu.svg";

const cart = "/cart.svg";

const info = "/info.svg";

const share = "/share.svg";

const warning = "/warning.svg";

const question = "/question.svg";

const gear = "/gear.svg";

const home = "/home.svg";

const smile = "/favicon.svg";

const arrow_up = "/arrow-up.svg";

const arrow_right = "/arrow-right.svg";

const arrow_left = "/arrow-left.svg";

const arrow_down = "/arrow-down.svg";

const bell = "/bell.svg";

const appIcon = {};
appIcon["bug"] = bug;
appIcon["finder"] = search;
appIcon["menu"] = bar;
appIcon["folder"] = folder;
appIcon["wallpapers"] = image;
appIcon["file"] = file;
appIcon["document"] = document$1;
appIcon["edit"] = edit;
appIcon["download"] = download;
appIcon["upload"] = upload;
appIcon["check"] = check;
appIcon["close"] = close;
appIcon["cross"] = close;
appIcon["calendar"] = calendar;
appIcon["browser"] = browser;
appIcon["comment"] = comment;
appIcon["comment-o"] = comment_o;
appIcon["github"] = github;
appIcon["view-source"] = github;
appIcon["heart"] = heart;
appIcon["heart-o"] = heart_o;
appIcon["star"] = star;
appIcon["star-o"] = star_o;
appIcon["moon"] = moon;
appIcon["dark"] = moon;
appIcon["night"] = moon;
appIcon["sun"] = sunny_o;
appIcon["light"] = sunny_o;
appIcon["day"] = sunny_o;
appIcon["print"] = print;
appIcon["play"] = play;
appIcon["pause"] = pause;
appIcon["stop"] = stop;
appIcon["sync"] = sync;
appIcon["fork"] = fork;
appIcon["version-control"] = fork;
appIcon["vscode"] = code;
appIcon["menu"] = app_menu;
appIcon["appstore"] = cart;
appIcon["info"] = info;
appIcon["purus-twitter"] = info;
appIcon["share"] = share;
appIcon["warning"] = warning;
appIcon["question"] = question;
appIcon["config"] = gear;
appIcon["home"] = home;
appIcon["start"] = smile;
appIcon["arrow-up"] = arrow_up;
appIcon["arrow-right"] = arrow_right;
appIcon["arrow-left"] = arrow_left;
appIcon["arrow-down"] = arrow_down;
appIcon["bell"] = bell;
appIcon["notifications"] = bell;

const DockItem_svelte_svelte_type_style_lang = '';

/* src/svelte/components/Dock/DockItem.svelte generated by Svelte v3.53.1 */

function create_if_block$a(ctx) {
	let div;
	let style_transform = `scale(${/*$widthPX*/ ctx[6] / baseWidth})`;

	return {
		c() {
			div = element("div");
			div.textContent = "1";
			attr(div, "class", "pwa-badge svelte-dw0m2y");
			set_style(div, "transform", style_transform);
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*$widthPX*/ 64 && style_transform !== (style_transform = `scale(${/*$widthPX*/ ctx[6] / baseWidth})`)) {
				set_style(div, "transform", style_transform);
			}
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function create_fragment$k(ctx) {
	let button;
	let p;
	let style_transform = `translate(0, ${/*$appOpenIconBounceTransform*/ ctx[8]}px)`;
	let t1;
	let span;
	let img;
	let img_src_value;
	let style_width = `${/*$widthPX*/ ctx[6] / 16}rem`;
	let style_transform_1 = `translate(0, ${/*$appOpenIconBounceTransform*/ ctx[8]}px)`;
	let t2;
	let div;
	let t3;
	let button_class_value;
	let mounted;
	let dispose;
	let if_block = /*showPwaBadge*/ ctx[1] && create_if_block$a(ctx);

	return {
		c() {
			button = element("button");
			p = element("p");
			p.textContent = `${/*title*/ ctx[10]}`;
			t1 = space();
			span = element("span");
			img = element("img");
			t2 = space();
			div = element("div");
			t3 = space();
			if (if_block) if_block.c();
			attr(p, "class", "tooltip svelte-dw0m2y");
			toggle_class(p, "tooltip-enabled", !/*$isAppBeingDragged*/ ctx[2]);
			toggle_class(p, "dark", /*$theme*/ ctx[7].scheme === 'dark');
			set_style(p, "top", /*$prefersReducedMotion*/ ctx[3] ? '-50px' : '-35%');
			set_style(p, "transform", style_transform);
			if (!src_url_equal(img.src, img_src_value = appIcon[/*appID*/ ctx[0]] || appIcon['bug'])) attr(img, "src", img_src_value);
			attr(img, "alt", "" + (/*title*/ ctx[10] + " app"));
			attr(img, "draggable", "false");
			attr(img, "class", "svelte-dw0m2y");
			toggle_class(img, "darkmode-invert", true);
			set_style(img, "width", style_width);
			attr(span, "class", "svelte-dw0m2y");
			set_style(span, "transform", style_transform_1);
			attr(div, "class", "dot svelte-dw0m2y");
			set_style(div, "--opacity", +/*$openApps*/ ctx[5][/*appID*/ ctx[0]]);
			attr(button, "aria-label", "Launch " + /*title*/ ctx[10] + " app");
			attr(button, "class", button_class_value = "dock-open-app-button " + String(/*appID*/ ctx[0]) + " svelte-dw0m2y");
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, p);
			append(button, t1);
			append(button, span);
			append(span, img);
			/*img_binding*/ ctx[17](img);
			append(button, t2);
			append(button, div);
			append(button, t3);
			if (if_block) if_block.m(button, null);

			if (!mounted) {
				dispose = [
					action_destroyer(elevation.call(null, p, 'dock-tooltip')),
					listen(button, "click", /*openApp*/ ctx[12])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*$isAppBeingDragged*/ 4) {
				toggle_class(p, "tooltip-enabled", !/*$isAppBeingDragged*/ ctx[2]);
			}

			if (dirty & /*$theme*/ 128) {
				toggle_class(p, "dark", /*$theme*/ ctx[7].scheme === 'dark');
			}

			if (dirty & /*$prefersReducedMotion*/ 8) {
				set_style(p, "top", /*$prefersReducedMotion*/ ctx[3] ? '-50px' : '-35%');
			}

			if (dirty & /*$appOpenIconBounceTransform*/ 256 && style_transform !== (style_transform = `translate(0, ${/*$appOpenIconBounceTransform*/ ctx[8]}px)`)) {
				set_style(p, "transform", style_transform);
			}

			if (dirty & /*appID*/ 1 && !src_url_equal(img.src, img_src_value = appIcon[/*appID*/ ctx[0]] || appIcon['bug'])) {
				attr(img, "src", img_src_value);
			}

			if (dirty & /*$widthPX*/ 64 && style_width !== (style_width = `${/*$widthPX*/ ctx[6] / 16}rem`)) {
				set_style(img, "width", style_width);
			}

			if (dirty & /*$appOpenIconBounceTransform*/ 256 && style_transform_1 !== (style_transform_1 = `translate(0, ${/*$appOpenIconBounceTransform*/ ctx[8]}px)`)) {
				set_style(span, "transform", style_transform_1);
			}

			if (dirty & /*$openApps, appID*/ 33) {
				set_style(div, "--opacity", +/*$openApps*/ ctx[5][/*appID*/ ctx[0]]);
			}

			if (/*showPwaBadge*/ ctx[1]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$a(ctx);
					if_block.c();
					if_block.m(button, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*appID*/ 1 && button_class_value !== (button_class_value = "dock-open-app-button " + String(/*appID*/ ctx[0]) + " svelte-dw0m2y")) {
				attr(button, "class", button_class_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(button);
			/*img_binding*/ ctx[17](null);
			if (if_block) if_block.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

const baseWidth = 57.6;
const distanceLimit = baseWidth * 6;
const beyondTheDistanceLimit = distanceLimit + 1;

const distanceInput = [
	-distanceLimit,
	-distanceLimit / 1.25,
	-distanceLimit / 2,
	0,
	distanceLimit / 2,
	distanceLimit / 1.25,
	distanceLimit
];

const widthOutput = [
	baseWidth,
	baseWidth * 1.1,
	baseWidth * 1.414,
	baseWidth * 2,
	baseWidth * 1.414,
	baseWidth * 1.1,
	baseWidth
];

function instance$k($$self, $$props, $$invalidate) {
	let isAppStore;
	let showPwaBadge;
	let $activeApp;
	let $openApps;
	let $isAppBeingDragged;
	let $prefersReducedMotion;
	let $widthPX;
	let $theme;
	let $appOpenIconBounceTransform;
	component_subscribe($$self, activeApp, $$value => $$invalidate(19, $activeApp = $$value));
	component_subscribe($$self, openApps, $$value => $$invalidate(5, $openApps = $$value));
	component_subscribe($$self, isAppBeingDragged, $$value => $$invalidate(2, $isAppBeingDragged = $$value));
	component_subscribe($$self, prefersReducedMotion, $$value => $$invalidate(3, $prefersReducedMotion = $$value));
	component_subscribe($$self, theme, $$value => $$invalidate(7, $theme = $$value));
	let { mouseX } = $$props;
	let { appID } = $$props;
	let { needsUpdate = false } = $$props;
	let imageEl;
	let distance = beyondTheDistanceLimit;
	const widthPX = spring(baseWidth, { damping: 0.47, stiffness: 0.12 });
	component_subscribe($$self, widthPX, value => $$invalidate(6, $widthPX = value));
	const getWidthFromDistance = interpolate(distanceInput, widthOutput);
	let raf;

	function animate() {
		if (imageEl && mouseX !== null) {
			const rect = imageEl.getBoundingClientRect();

			// get the x coordinate of the img DOMElement's center
			// the left x coordinate plus the half of the width
			const imgCenterX = rect.left + rect.width / 2;

			// difference between the x coordinate value of the mouse pointer
			// and the img center x coordinate value
			const distanceDelta = mouseX - imgCenterX;

			$$invalidate(15, distance = distanceDelta);
			return;
		}

		$$invalidate(15, distance = beyondTheDistanceLimit);
	}

	const { title, shouldOpenWindow, externalAction } = appsConfig[appID];

	// Spring animation for the click animation
	const appOpenIconBounceTransform = tweened(0, { duration: 400, easing: sineInOut });

	component_subscribe($$self, appOpenIconBounceTransform, value => $$invalidate(8, $appOpenIconBounceTransform = value));

	async function bounceEffect() {
		// Animate the icon
		await appOpenIconBounceTransform.set(-40);

		// Now animate it back to its place
		appOpenIconBounceTransform.set(0);
	}

	async function openApp(e) {
		if (!shouldOpenWindow) return externalAction?.(e);

		// For the bounce animation
		const isAppAlreadyOpen = $openApps[appID];

		set_store_value(openApps, $openApps[appID] = true, $openApps);
		set_store_value(activeApp, $activeApp = appID, $activeApp);
		if (isAppAlreadyOpen) return;
		bounceEffect();
	}

	onDestroy(() => {
		cancelAnimationFrame(raf);
	});

	function img_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			imageEl = $$value;
			$$invalidate(4, imageEl);
		});
	}

	$$self.$$set = $$props => {
		if ('mouseX' in $$props) $$invalidate(13, mouseX = $$props.mouseX);
		if ('appID' in $$props) $$invalidate(0, appID = $$props.appID);
		if ('needsUpdate' in $$props) $$invalidate(14, needsUpdate = $$props.needsUpdate);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*distance*/ 32768) {
			set_store_value(widthPX, $widthPX = getWidthFromDistance(distance), $widthPX);
		}

		if ($$self.$$.dirty & /*mouseX, $prefersReducedMotion, $isAppBeingDragged*/ 8204) {
			$: {
				if ($prefersReducedMotion || $isAppBeingDragged) break $;
				raf = requestAnimationFrame(animate);
			}
		}

		if ($$self.$$.dirty & /*appID*/ 1) {
			$$invalidate(16, isAppStore = appID === 'appstore');
		}

		if ($$self.$$.dirty & /*isAppStore, needsUpdate*/ 81920) {
			$$invalidate(1, showPwaBadge = isAppStore && needsUpdate);
		}

		if ($$self.$$.dirty & /*showPwaBadge*/ 2) {
			showPwaBadge && bounceEffect();
		}
	};

	return [
		appID,
		showPwaBadge,
		$isAppBeingDragged,
		$prefersReducedMotion,
		imageEl,
		$openApps,
		$widthPX,
		$theme,
		$appOpenIconBounceTransform,
		widthPX,
		title,
		appOpenIconBounceTransform,
		openApp,
		mouseX,
		needsUpdate,
		distance,
		isAppStore,
		img_binding
	];
}

class DockItem extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$k, create_fragment$k, safe_not_equal, { mouseX: 13, appID: 0, needsUpdate: 14 });
	}
}

const Dock_svelte_svelte_type_style_lang = '';

/* src/svelte/components/Dock/Dock.svelte generated by Svelte v3.53.1 */

const { Boolean: Boolean_1 } = globals;

function get_each_context$6(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[12] = list[i][0];
	child_ctx[13] = list[i][1];
	return child_ctx;
}

// (51:6) {#if config.dockBreaksBefore}
function create_if_block$9(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			attr(div, "class", "divider svelte-5ps30m");
			attr(div, "aria-hidden", "true");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (50:4) {#each Object.entries(appsConfig) as [appID, config]}
function create_each_block$6(ctx) {
	let t;
	let dockitem;
	let current;
	let if_block = /*config*/ ctx[13].dockBreaksBefore && create_if_block$9();

	dockitem = new DockItem({
			props: {
				mouseX: /*dockMouseX*/ ctx[0],
				appID: /*appID*/ ctx[12],
				needsUpdate: /*$systemNeedsUpdate*/ ctx[5]
			}
		});

	return {
		c() {
			if (if_block) if_block.c();
			t = space();
			create_component(dockitem.$$.fragment);
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, t, anchor);
			mount_component(dockitem, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const dockitem_changes = {};
			if (dirty & /*dockMouseX*/ 1) dockitem_changes.mouseX = /*dockMouseX*/ ctx[0];
			if (dirty & /*$systemNeedsUpdate*/ 32) dockitem_changes.needsUpdate = /*$systemNeedsUpdate*/ ctx[5];
			dockitem.$set(dockitem_changes);
		},
		i(local) {
			if (current) return;
			transition_in(dockitem.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(dockitem.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(t);
			destroy_component(dockitem, detaching);
		}
	};
}

function create_fragment$j(ctx) {
	let t;
	let section;
	let div;
	let current;
	let mounted;
	let dispose;
	add_render_callback(/*onwindowresize*/ ctx[7]);
	let each_value = Object.entries(appsConfig);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			t = space();
			section = element("section");
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "dock-el svelte-5ps30m");
			toggle_class(div, "hidden", /*$isDockHidden*/ ctx[4]);
			attr(section, "class", "dock-container svelte-5ps30m");
			toggle_class(section, "dock-hidden", /*$isDockHidden*/ ctx[4]);
		},
		m(target, anchor) {
			insert(target, t, anchor);
			insert(target, section, anchor);
			append(section, div);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			/*section_binding*/ ctx[11](section);
			current = true;

			if (!mounted) {
				dispose = [
					listen(window, "resize", /*onwindowresize*/ ctx[7]),
					listen(document.body, "mousemove", /*mousemove_handler*/ ctx[8]),
					listen(div, "mousemove", /*mousemove_handler_1*/ ctx[9]),
					listen(div, "mouseleave", /*mouseleave_handler*/ ctx[10]),
					action_destroyer(elevation.call(null, section, 'dock'))
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*dockMouseX, Object, appsConfig, $systemNeedsUpdate*/ 33) {
				each_value = Object.entries(appsConfig);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$6(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$6(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}

			if (!current || dirty & /*$isDockHidden*/ 16) {
				toggle_class(div, "hidden", /*$isDockHidden*/ ctx[4]);
			}

			if (!current || dirty & /*$isDockHidden*/ 16) {
				toggle_class(section, "dock-hidden", /*$isDockHidden*/ ctx[4]);
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean_1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(t);
			if (detaching) detach(section);
			destroy_each(each_blocks, detaching);
			/*section_binding*/ ctx[11](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

const HIDDEN_DOCK_THRESHOLD = 30;

function instance$j($$self, $$props, $$invalidate) {
	let $isDockHidden;
	let $appsInFullscreen;
	let $systemNeedsUpdate;
	component_subscribe($$self, isDockHidden, $$value => $$invalidate(4, $isDockHidden = $$value));
	component_subscribe($$self, appsInFullscreen, $$value => $$invalidate(6, $appsInFullscreen = $$value));
	component_subscribe($$self, systemNeedsUpdate, $$value => $$invalidate(5, $systemNeedsUpdate = $$value));
	let dockMouseX = null;
	let bodyHeight = 0;
	let mouseY = 0;
	let dockContainerEl;

	function onwindowresize() {
		$$invalidate(1, bodyHeight = window.innerHeight);
	}

	const mousemove_handler = ({ y }) => $$invalidate(2, mouseY = y);
	const mousemove_handler_1 = event => $$invalidate(0, dockMouseX = event.x);
	const mouseleave_handler = () => $$invalidate(0, dockMouseX = null);

	function section_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			dockContainerEl = $$value;
			$$invalidate(3, dockContainerEl);
		});
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*mouseY, bodyHeight, dockContainerEl, dockMouseX, $appsInFullscreen*/ 79) {
			$: {
				// Due to how pointer-events: none works, if dock auto opens, you move away, it won't close automatically.
				// So close it manually if mouse pointer goes out of the dock area.
				if (Math.abs(mouseY - bodyHeight) > dockContainerEl?.clientHeight) {
					$$invalidate(0, dockMouseX = null);
				}

				/**
 * if mouseX != null then show the dock. No matter what
 * When it becomes null, Then use the mouseY and bodyHeight to determine if the dock should be hidden
 */
				if (dockMouseX !== null) {
					set_store_value(isDockHidden, $isDockHidden = false, $isDockHidden);
					break $;
				}

				if (!Object.values($appsInFullscreen).some(Boolean)) {
					set_store_value(isDockHidden, $isDockHidden = false, $isDockHidden);
					break $;
				}

				set_store_value(isDockHidden, $isDockHidden = Math.abs(mouseY - bodyHeight) > HIDDEN_DOCK_THRESHOLD, $isDockHidden);
			}
		}
	};

	return [
		dockMouseX,
		bodyHeight,
		mouseY,
		dockContainerEl,
		$isDockHidden,
		$systemNeedsUpdate,
		$appsInFullscreen,
		onwindowresize,
		mousemove_handler,
		mousemove_handler_1,
		mouseleave_handler,
		section_binding
	];
}

class Dock extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});
	}
}

function fadeIn(_, { duration = 150, delay = duration } = {}) {
  return {
    duration: duration + 10,
    delay,
    easing: sineIn,
    css: (t) => `opacity: ${t}`
  };
}
function fadeOut(_, { duration = 150 } = {}) {
  return {
    duration,
    easing: sineOut,
    css: (t) => `opacity: ${t}`
  };
}

const appleMenu = {
  title: "apple",
  menu: {
    "about-this-mac": {
      title: "About This Mac",
      breakAfter: true
    },
    "system-preferences": {
      title: "System Preferences..."
    },
    "app-store": {
      title: "App Store...",
      breakAfter: true
    },
    "recent-items": {
      title: "Recent Items",
      breakAfter: true
    },
    "force-quit": {
      title: "Force Quit...",
      breakAfter: true
    },
    sleep: {
      title: "Sleep"
    },
    restart: {
      title: "Restart..."
    },
    shutdown: {
      title: "Shut Down...",
      breakAfter: true
    },
    "lock-screen": {
      title: "Lock Screen"
    },
    logout: {
      title: "Log Out User..."
    }
  }
};
const createMenuConfig = (et) => ({ apple: appleMenu, ...et });

const finderMenuConfig = createMenuConfig({
  default: {
    title: "Finder",
    menu: {
      "about-finder": {
        title: "About Finder",
        breakAfter: true
      },
      preferences: {
        title: "Preferences",
        breakAfter: true
      },
      "empty-trash": {
        title: "Empty Trash",
        breakAfter: true
      },
      "hide-finder": {
        title: "Hide Finder"
      },
      "hide-others": {
        title: "Hide Others"
      },
      "show-all": {
        title: "Show All",
        disabled: true
      }
    }
  },
  file: {
    title: "File",
    menu: {
      "new-finder-window": {
        title: "New Finder Window"
      },
      "new-folder": {
        title: "New Folder"
      },
      "new-folder-with-selection": {
        title: "New Folder with Selection",
        disabled: true
      },
      "new-smart-folder": {
        title: "New Smart Folder"
      },
      "new-tab": {
        title: "New tab"
      },
      open: {
        title: "Open",
        disabled: true
      },
      "open-with": {
        title: "Open With",
        disabled: true
      },
      print: {
        title: "Print",
        disabled: true
      },
      "close-window": {
        title: "Close Window",
        disabled: true,
        breakAfter: true
      },
      "get-info": {
        title: "Get Info"
      },
      rename: {
        title: "Rename",
        disabled: true,
        breakAfter: true
      },
      compress: {
        title: "Compress",
        disabled: true,
        breakAfter: true
      },
      duplicate: {
        title: "Duplicate",
        disabled: true
      },
      "make-alias": {
        title: "Make Alias",
        disabled: true
      },
      "quick-look": {
        title: "Quick Look",
        disabled: true
      },
      "show-original": {
        title: "Show Original",
        disabled: true
      },
      "add-to-sidebar": {
        title: "Add to Sidebar",
        disabled: true,
        breakAfter: true
      },
      "move-to-trash": {
        title: "Move to Trash",
        disabled: true
      },
      eject: {
        title: "Eject",
        disabled: true,
        breakAfter: true
      },
      find: {
        title: "Find",
        breakAfter: true
      },
      tags: {
        title: "Tags...",
        disabled: true
      }
    }
  },
  edit: {
    title: "Edit",
    menu: {
      undo: {
        title: "Undo",
        disabled: true
      },
      redo: {
        title: "Redo",
        disabled: true,
        breakAfter: true
      },
      cut: {
        title: "Cut",
        disabled: true
      },
      copy: {
        title: "Copy",
        disabled: true
      },
      paste: {
        title: "Paste",
        disabled: true
      },
      "select-all": {
        title: "Select All",
        disabled: true,
        breakAfter: true
      },
      "show-clipboard": {
        title: "Show Clipboard",
        breakAfter: true
      },
      "start-dictation": {
        title: "Start Dictation..."
      },
      "emoji-and-symbols": {
        title: "Emoji & Symbols"
      }
    }
  },
  view: {
    title: "View",
    menu: {
      "as-icons": {
        title: "As Icons",
        disabled: true
      },
      "as-list": {
        title: "As List",
        disabled: true
      },
      "as-columns": {
        title: "As Columns",
        disabled: true
      },
      "as-gallery": {
        title: "As Gallery",
        disabled: true,
        breakAfter: true
      },
      "use-stacks": {
        title: "Use Stacks"
      },
      "sort-by": {
        title: "Sort By",
        menu: {}
      },
      "clean-up": {
        title: "Clean Up",
        disabled: true
      },
      "clean-up-by": {
        title: "Clean Up By",
        disabled: true,
        breakAfter: true,
        menu: {}
      },
      "hide-sidebar": {
        title: "Hide Sidebar",
        disabled: true
      },
      "show-preview": {
        title: "Show Preview",
        disabled: true,
        breakAfter: true
      },
      "hide-toolbar": {
        title: "Hide Toolbar",
        disabled: true
      },
      "show-all-tabs": {
        title: "Show All Tabs",
        disabled: true
      },
      "show-tab-bar": {
        title: "Show Tab Bar",
        disabled: true
      },
      "show-path-bar": {
        title: "Show Path Bar",
        disabled: true
      },
      "show-status-bar": {
        title: "Show Status Bar",
        disabled: true,
        breakAfter: true
      },
      "customize-toolbar": {
        title: "Customize Toolbar...",
        disabled: true,
        breakAfter: true
      },
      "show-view-options": {
        title: "Show View Options"
      },
      "show-preview-options": {
        title: "Show Preview Options",
        disabled: true,
        breakAfter: true
      },
      "enter-full-screen": {
        title: "Enter Full Screen",
        disabled: true
      }
    }
  },
  go: {
    title: "Go",
    menu: {
      back: {
        title: "Back",
        disabled: true
      },
      forward: {
        title: "Forward",
        disabled: true
      },
      "enclosing-folder": {
        title: "Enclosing Folder",
        breakAfter: true
      },
      recents: {
        title: "Recents"
      },
      documents: {
        title: "Documents"
      },
      desktop: {
        title: "Desktop"
      },
      downloads: {
        title: "Downloads"
      },
      home: {
        title: "Home"
      },
      computer: {
        title: "Computer"
      },
      airdrop: {
        title: "Airdrop"
      },
      network: {
        title: "Network"
      },
      "icloud-drive": {
        title: "iCloud Drive"
      },
      applications: {
        title: "Applications"
      },
      utilities: {
        title: "Utilities",
        breakAfter: true
      },
      "go-to-folder": {
        title: "Go to Folder"
      },
      "connect-to-server": {
        title: "Connect to Server"
      }
    }
  },
  window: {
    title: "Window",
    menu: {
      minimize: {
        title: "Minimize",
        disabled: true
      },
      zoom: {
        title: "Zoom",
        disabled: true
      },
      "move-window-to-left-side-of-screen": {
        title: "Move Window to Left Side of Screen",
        disabled: true
      },
      "move-window-to-right-side-of-screen": {
        title: "Move Window to Right Side of Screen",
        disabled: true
      },
      "cycle-through-windows": {
        title: "Cycle Through Windows",
        breakAfter: true
      },
      "show-previous-tab": {
        title: "Show Previous Tab",
        disabled: true
      },
      "show-next-tab": {
        title: "Show Next Tab",
        disabled: true
      },
      "move-tab-to-new-window": {
        title: "Move Tab to New Window",
        disabled: true
      },
      "merge-all-windows": {
        title: "Merge all Windows",
        disabled: true,
        breakAfter: true
      },
      "bring-all-to-front": {
        title: "Bring All to Front"
      }
    }
  },
  help: {
    title: "Help",
    menu: {
      "send-finder-feedback": {
        title: "Send Finder Feedback",
        breakAfter: true
      },
      "macos-help": {
        title: "macOS Help"
      }
    }
  }
});

const menuConfigs = { finder: finderMenuConfig };
const menuBarMenus = writable$1(
  menuConfigs.finder
);
const activeMenu = writable$1("");
const shouldShowNotch = writable("macos:setting:should-show-notch", false);

const SystemDialog_svelte_svelte_type_style_lang = '';

/* src/svelte/components/SystemUI/SystemDialog.svelte generated by Svelte v3.53.1 */

function create_if_block$8(ctx) {
	let section;
	let div;
	let clickOutside_action;
	let div_intro;
	let div_outro;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

	return {
		c() {
			section = element("section");
			div = element("div");
			if (default_slot) default_slot.c();
			attr(div, "class", "dialog svelte-1g5ktxe");
			attr(div, "tabindex", 0);
			attr(div, "role", "dialog");
			attr(div, "aria-labelledby", "info-title");
			attr(div, "aria-describedby", "info-description");
			toggle_class(div, "dark", /*$theme*/ ctx[3].scheme === 'dark');
			attr(section, "class", "overlay svelte-1g5ktxe");
		},
		m(target, anchor) {
			insert(target, section, anchor);
			append(section, div);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;

			if (!mounted) {
				dispose = [
					action_destroyer(trapFocus.call(null, div)),
					action_destroyer(clickOutside_action = clickOutside.call(null, div, {
						callback: /*clickOutside_function*/ ctx[8]
					})),
					listen(div, "click", stop_propagation(click_handler)),
					action_destroyer(portal.call(null, section, '#windows-area')),
					action_destroyer(elevation.call(null, section, 'system-dialog'))
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[6],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
						null
					);
				}
			}

			if (clickOutside_action && is_function(clickOutside_action.update) && dirty & /*backdropDismiss*/ 1) clickOutside_action.update.call(null, {
				callback: /*clickOutside_function*/ ctx[8]
			});

			if (!current || dirty & /*$theme*/ 8) {
				toggle_class(div, "dark", /*$theme*/ ctx[3].scheme === 'dark');
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);

			add_render_callback(() => {
				if (div_outro) div_outro.end(1);
				div_intro = create_in_transition(div, /*dialogOpenTransition*/ ctx[4], {});
				div_intro.start();
			});

			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			if (div_intro) div_intro.invalidate();
			div_outro = create_out_transition(div, fadeOut, {});
			current = false;
		},
		d(detaching) {
			if (detaching) detach(section);
			if (default_slot) default_slot.d(detaching);
			if (detaching && div_outro) div_outro.end();
			mounted = false;
			run_all(dispose);
		}
	};
}

function create_fragment$i(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*isOpen*/ ctx[2] && create_if_block$8(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*isOpen*/ ctx[2]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*isOpen*/ 4) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$8(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

const click_handler = () => {
	
};

function instance$i($$self, $$props, $$invalidate) {
	let $prefersReducedMotion;
	let $theme;
	component_subscribe($$self, prefersReducedMotion, $$value => $$invalidate(9, $prefersReducedMotion = $$value));
	component_subscribe($$self, theme, $$value => $$invalidate(3, $theme = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	let { backdropDismiss = true } = $$props;
	let isOpen;
	const dispatch = createEventDispatcher();

	function open() {
		$$invalidate(2, isOpen = true);
		dispatch('open');
	}

	function close(message) {
		$$invalidate(2, isOpen = false);
		dispatch('close', message);
		return message;
	}

	function dialogOpenTransition(_, { duration = $prefersReducedMotion ? 0 : 250 } = {}) {
		return {
			duration,
			easing: sineInOut,
			css: t => `transform: scale(${t})`
		};
	}

	const clickOutside_function = () => backdropDismiss && close();

	$$self.$$set = $$props => {
		if ('backdropDismiss' in $$props) $$invalidate(0, backdropDismiss = $$props.backdropDismiss);
		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
	};

	return [
		backdropDismiss,
		close,
		isOpen,
		$theme,
		dialogOpenTransition,
		open,
		$$scope,
		slots,
		clickOutside_function
	];
}

class SystemDialog extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$i, create_fragment$i, safe_not_equal, { backdropDismiss: 0, open: 5, close: 1 });
	}

	get open() {
		return this.$$.ctx[5];
	}

	get close() {
		return this.$$.ctx[1];
	}
}

/* ~icons/gg/dark-mode.svelte generated by Svelte v3.53.1 */

function create_fragment$h(ctx) {
	let svg;
	let raw_value = `<g fill="currentColor"><path d="M12 16a4 4 0 0 0 0-8v8Z"/><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2Zm0 2v4a4 4 0 1 0 0 8v4a8 8 0 1 0 0-16Z" clip-rule="evenodd"/></g>` + "";

	let svg_levels = [
		{ viewBox: "0 0 24 24" },
		{ width: "1.2em" },
		{ height: "1.2em" },
		/*$$props*/ ctx[0]
	];

	let svg_data = {};

	for (let i = 0; i < svg_levels.length; i += 1) {
		svg_data = assign(svg_data, svg_levels[i]);
	}

	return {
		c() {
			svg = svg_element("svg");
			set_svg_attributes(svg, svg_data);
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			svg.innerHTML = raw_value;
		},
		p(ctx, [dirty]) {
			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
				{ viewBox: "0 0 24 24" },
				{ width: "1.2em" },
				{ height: "1.2em" },
				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
			]));
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(svg);
		}
	};
}

function instance$h($$self, $$props, $$invalidate) {
	$$self.$$set = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
	};

	$$props = exclude_internal_props($$props);
	return [$$props];
}

class Dark_mode extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});
	}
}

/* ~icons/ic/outline-check.svelte generated by Svelte v3.53.1 */

function create_fragment$g(ctx) {
	let svg;
	let raw_value = `<path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41L9 16.17z"/>` + "";

	let svg_levels = [
		{ viewBox: "0 0 24 24" },
		{ width: "1.2em" },
		{ height: "1.2em" },
		/*$$props*/ ctx[0]
	];

	let svg_data = {};

	for (let i = 0; i < svg_levels.length; i += 1) {
		svg_data = assign(svg_data, svg_levels[i]);
	}

	return {
		c() {
			svg = svg_element("svg");
			set_svg_attributes(svg, svg_data);
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			svg.innerHTML = raw_value;
		},
		p(ctx, [dirty]) {
			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
				{ viewBox: "0 0 24 24" },
				{ width: "1.2em" },
				{ height: "1.2em" },
				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
			]));
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(svg);
		}
	};
}

function instance$g($$self, $$props, $$invalidate) {
	$$self.$$set = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
	};

	$$props = exclude_internal_props($$props);
	return [$$props];
}

class Outline_check extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});
	}
}

/* ~icons/mdi/transition-masked.svelte generated by Svelte v3.53.1 */

function create_fragment$f(ctx) {
	let svg;
	let raw_value = `<path fill="currentColor" d="M15 2c1.94 0 3.59.7 4.95 2.05C21.3 5.41 22 7.06 22 9c0 1.56-.5 2.96-1.42 4.2c-.94 1.23-2.14 2.07-3.61 2.5l.03-.32V15c0-2.19-.77-4.07-2.35-5.65S11.19 7 9 7h-.37l-.33.03c.43-1.47 1.27-2.67 2.5-3.61C12.04 2.5 13.44 2 15 2M9 8a7 7 0 0 1 7 7a7 7 0 0 1-7 7a7 7 0 0 1-7-7a7 7 0 0 1 7-7m0 2a5 5 0 0 0-5 5a5 5 0 0 0 5 5a5 5 0 0 0 5-5a5 5 0 0 0-5-5Z"/>` + "";

	let svg_levels = [
		{ viewBox: "0 0 24 24" },
		{ width: "1.2em" },
		{ height: "1.2em" },
		/*$$props*/ ctx[0]
	];

	let svg_data = {};

	for (let i = 0; i < svg_levels.length; i += 1) {
		svg_data = assign(svg_data, svg_levels[i]);
	}

	return {
		c() {
			svg = svg_element("svg");
			set_svg_attributes(svg, svg_data);
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			svg.innerHTML = raw_value;
		},
		p(ctx, [dirty]) {
			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
				{ viewBox: "0 0 24 24" },
				{ width: "1.2em" },
				{ height: "1.2em" },
				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
			]));
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(svg);
		}
	};
}

function instance$f($$self, $$props, $$invalidate) {
	$$self.$$set = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
	};

	$$props = exclude_internal_props($$props);
	return [$$props];
}

class Transition_masked extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});
	}
}

/* ~icons/pepicons/smartphone-notch.svelte generated by Svelte v3.53.1 */

function create_fragment$e(ctx) {
	let svg;
	let raw_value = `<path fill="currentColor" fill-rule="evenodd" d="M6 0h9c1.105 0 2 .943 2 2.105v15.79C17 19.057 16.105 20 15 20H6c-1.105 0-2-.943-2-2.105V2.105C4 .943 4.895 0 6 0Zm1 2a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-1v1.5a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5V2H7Z" clip-rule="evenodd"/>` + "";

	let svg_levels = [
		{ viewBox: "0 0 20 20" },
		{ width: "1.2em" },
		{ height: "1.2em" },
		/*$$props*/ ctx[0]
	];

	let svg_data = {};

	for (let i = 0; i < svg_levels.length; i += 1) {
		svg_data = assign(svg_data, svg_levels[i]);
	}

	return {
		c() {
			svg = svg_element("svg");
			set_svg_attributes(svg, svg_data);
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			svg.innerHTML = raw_value;
		},
		p(ctx, [dirty]) {
			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
				{ viewBox: "0 0 20 20" },
				{ width: "1.2em" },
				{ height: "1.2em" },
				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
			]));
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(svg);
		}
	};
}

function instance$e($$self, $$props, $$invalidate) {
	$$self.$$set = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
	};

	$$props = exclude_internal_props($$props);
	return [$$props];
}

class Smartphone_notch extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});
	}
}

const optimizedWallpapers = /* #__PURE__ */ Object.assign({});
const createWallpapersConfig = (wallpaperConfig) => {
  const optimizedWallpapersArr = Object.entries(optimizedWallpapers);
  for (const [wallpaperName, config] of Object.entries(wallpaperConfig)) {
    const wallpaper = wallpaperConfig[wallpaperName];
    wallpaper.thumbnail = (optimizedWallpapersArr.find(([path]) => path.includes(config.thumbnail)) || [])[1]?.default;
    if (wallpaper.type !== "standalone") {
      for (const [time, imgName] of Object.entries(config.timestamps.wallpaper)) {
        wallpaper.timestamps.wallpaper[time] = (optimizedWallpapersArr.find(([path]) => path.includes(imgName)) || [])[1]?.default;
      }
    }
  }
  return wallpaperConfig;
};
const wallpapersConfig = createWallpapersConfig({
  ventura: {
    name: "Ventura",
    type: "dynamic",
    thumbnail: "ventura-2",
    timestamps: {
      wallpaper: {
        7: "ventura-5",
        9: "ventura-2",
        12: "ventura-3",
        17: "ventura-4",
        18: "ventura-5",
        19: "ventura-1"
      },
      theme: {
        7: "light",
        19: "dark"
      }
    }
  },
  monterey: {
    name: "Monterey",
    type: "dynamic",
    thumbnail: "monterey-2",
    timestamps: {
      wallpaper: {
        7: "monterey-2",
        9: "monterey-3",
        11: "monterey-4",
        13: "monterey-5",
        15: "monterey-6",
        16: "monterey-7",
        17: "monterey-8",
        18: "monterey-1"
      },
      theme: {
        7: "light",
        18: "dark"
      }
    }
  },
  "big-sur-graphic": {
    name: "Big Sur Graphic",
    type: "dynamic",
    thumbnail: "big-sur-graphic-2",
    timestamps: {
      wallpaper: {
        7: "big-sur-graphic-2",
        18: "big-sur-graphic-1"
      },
      theme: {
        7: "light",
        18: "dark"
      }
    }
  },
  "big-sur": {
    name: "Big sur",
    type: "dynamic",
    thumbnail: "big-sur-4",
    timestamps: {
      wallpaper: {
        7: "big-sur-2",
        9: "big-sur-3",
        11: "big-sur-4",
        13: "big-sur-5",
        15: "big-sur-6",
        16: "big-sur-7",
        17: "big-sur-8",
        18: "big-sur-1"
      },
      theme: {
        7: "light",
        18: "dark"
      }
    }
  },
  catalina: {
    name: "Catalina",
    type: "dynamic",
    thumbnail: "catalina-3",
    timestamps: {
      wallpaper: {
        7: "catalina-2",
        9: "catalina-3",
        11: "catalina-4",
        13: "catalina-5",
        15: "catalina-6",
        16: "catalina-7",
        17: "catalina-8",
        18: "catalina-1"
      },
      theme: {
        9: "light",
        17: "dark"
      }
    }
  },
  mojave: {
    name: "Mojave",
    type: "dynamic",
    thumbnail: "mojave-2",
    timestamps: {
      wallpaper: {
        7: "mojave-2",
        18: "mojave-1"
      },
      theme: {
        7: "light",
        18: "dark"
      }
    }
  },
  desert: {
    name: "The Desert",
    type: "dynamic",
    thumbnail: "desert-5",
    timestamps: {
      wallpaper: {
        7: "desert-2",
        9: "desert-3",
        11: "desert-4",
        13: "desert-5",
        15: "desert-6",
        16: "desert-7",
        17: "desert-8",
        18: "desert-1"
      },
      theme: {
        7: "light",
        18: "dark"
      }
    }
  },
  dome: {
    name: "Dome",
    type: "dynamic",
    thumbnail: "dome-2",
    timestamps: {
      wallpaper: {
        7: "dome-2",
        18: "dome-1"
      },
      theme: {
        7: "light",
        18: "dark"
      }
    }
  },
  peak: {
    name: "Peak",
    type: "dynamic",
    thumbnail: "peak-2",
    timestamps: {
      wallpaper: {
        7: "peak-2",
        18: "peak-1"
      },
      theme: {
        7: "light",
        18: "dark"
      }
    }
  },
  iridescence: {
    name: "Iridescence",
    type: "dynamic",
    thumbnail: "iridescence-2",
    timestamps: {
      wallpaper: {
        7: "iridescence-2",
        18: "iridescence-1"
      },
      theme: {
        7: "light",
        18: "dark"
      }
    }
  },
  lake: {
    name: "Lake",
    type: "dynamic",
    thumbnail: "lake-4",
    timestamps: {
      wallpaper: {
        7: "lake-2",
        9: "lake-3",
        11: "lake-4",
        13: "lake-5",
        15: "lake-6",
        16: "lake-7",
        17: "lake-8",
        18: "lake-1"
      },
      theme: {
        7: "light",
        18: "dark"
      }
    }
  },
  "solar-grad": {
    name: "Solar Grad",
    type: "dynamic",
    thumbnail: "solar-grad-11",
    timestamps: {
      wallpaper: {
        6: "solar-grad-2",
        7: "solar-grad-3",
        8: "solar-grad-4",
        9: "solar-grad-5",
        10: "solar-grad-6",
        11: "solar-grad-7",
        12: "solar-grad-8",
        13: "solar-grad-9",
        14: "solar-grad-10",
        15: "solar-grad-11",
        16: "solar-grad-12",
        17: "solar-grad-13",
        18: "solar-grad-14",
        19: "solar-grad-5",
        20: "solar-grad-6"
      },
      theme: {
        6: "light",
        20: "dark"
      }
    }
  },
  "kryptonian-demise": {
    name: "Kryptonian Demise",
    type: "standalone",
    thumbnail: "38"
  },
  "nahargarh-sunset": {
    name: "Nahargarh Sunset",
    type: "standalone",
    thumbnail: "39"
  },
  "somber-forest": {
    name: "Somber Forest",
    type: "standalone",
    thumbnail: "40"
  },
  "blade-runner-2149": {
    name: "Blade Runner 2149",
    type: "standalone",
    thumbnail: "41"
  },
  "lone-dune-wolf": {
    name: "Lone Dune Wolf",
    type: "standalone",
    thumbnail: "42"
  },
  "childhood-innocence": {
    name: "Childhood Innocence",
    type: "standalone",
    thumbnail: "43"
  },
  "fox-in-somber-forest": {
    name: "Fox in Somber Forest",
    type: "standalone",
    thumbnail: "44"
  },
  "blood-diamond": {
    name: "Blood Diamond",
    type: "standalone",
    thumbnail: "45"
  },
  "black-bird-in-a-city": {
    name: "Black Bird in a City",
    type: "standalone",
    thumbnail: "46"
  },
  "sunrise-of-dreams": {
    name: "Sunrise of Dreams",
    type: "standalone",
    thumbnail: "47"
  },
  "how-do-we-get-down": {
    name: "How do we get down?",
    type: "standalone",
    thumbnail: "48"
  },
  "cozy-night-with-cat": {
    name: "Cozy Night with Cat",
    type: "standalone",
    thumbnail: "49"
  },
  "age-of-titans": {
    name: "Age of Titans",
    type: "standalone",
    thumbnail: "50"
  },
  dune: {
    name: "Dune",
    type: "standalone",
    thumbnail: "51"
  },
  "vibrant-night": {
    name: "Vibrant Night",
    type: "standalone",
    thumbnail: "52"
  },
  "cabin-in-woods": {
    name: "Cabin in the Woods",
    type: "standalone",
    thumbnail: "53"
  },
  "asgardian-sunrise": {
    name: "Asgardian Sunrise",
    type: "standalone",
    thumbnail: "54"
  },
  "asura-lok": {
    name: "Asura Lok",
    type: "standalone",
    thumbnail: "55"
  },
  "my-neighbour-totoro": {
    name: "My Neighbour Totoro",
    type: "standalone",
    thumbnail: "56"
  },
  tron: {
    name: "Tron",
    type: "standalone",
    thumbnail: "57"
  }
});

const wallpaper = writable("macos:wallpaper-settings:v2", {
  image: "ventura-2",
  id: "ventura",
  canControlTheme: true
});

const ActionCenterSurface_svelte_svelte_type_style_lang = '';

/* src/svelte/components/TopBar/ActionCenterSurface.svelte generated by Svelte v3.53.1 */

function create_fragment$d(ctx) {
	let section;
	let style_grid_column = `${/*columnStart*/ ctx[1]} / span ${/*columnSpan*/ ctx[2]}`;
	let style_grid_row = `${/*rowStart*/ ctx[3]} / span ${/*rowSpan*/ ctx[4]}`;
	let current;
	const default_slot_template = /*#slots*/ ctx[7].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

	return {
		c() {
			section = element("section");
			if (default_slot) default_slot.c();
			attr(section, "class", "container svelte-1xh2nkj");
			toggle_class(section, "dark", /*$theme*/ ctx[0].scheme === 'dark');
			set_style(section, "grid-column", style_grid_column);
			set_style(section, "grid-row", style_grid_row);
		},
		m(target, anchor) {
			insert(target, section, anchor);

			if (default_slot) {
				default_slot.m(section, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[6],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*$theme*/ 1) {
				toggle_class(section, "dark", /*$theme*/ ctx[0].scheme === 'dark');
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(section);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance$d($$self, $$props, $$invalidate) {
	let $theme;
	component_subscribe($$self, theme, $$value => $$invalidate(0, $theme = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	let { grid } = $$props;
	const [[columnStart, columnSpan], [rowStart, rowSpan]] = grid;

	$$self.$$set = $$props => {
		if ('grid' in $$props) $$invalidate(5, grid = $$props.grid);
		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
	};

	return [$theme, columnStart, columnSpan, rowStart, rowSpan, grid, $$scope, slots];
}

class ActionCenterSurface extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$d, create_fragment$d, safe_not_equal, { grid: 5 });
	}
}

const ActionCenterTile_svelte_svelte_type_style_lang = '';

/* src/svelte/components/TopBar/ActionCenterTile.svelte generated by Svelte v3.53.1 */

function create_fragment$c(ctx) {
	let button;
	let button_tabindex_value;
	let style_grid_row = `${/*rowStart*/ ctx[1]} / span ${/*rowSpan*/ ctx[2]}`;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[5].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

	return {
		c() {
			button = element("button");
			if (default_slot) default_slot.c();
			attr(button, "class", "container svelte-1ts71wq");
			attr(button, "tabindex", button_tabindex_value = /*role*/ ctx[0] === 'button' ? 0 : -1);
			attr(button, "role", /*role*/ ctx[0]);
			set_style(button, "grid-row", style_grid_row);
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (default_slot) {
				default_slot.m(button, null);
			}

			current = true;

			if (!mounted) {
				dispose = [
					listen(button, "click", /*click_handler*/ ctx[6]),
					listen(button, "keyup", /*keyup_handler*/ ctx[7])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[4],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
						null
					);
				}
			}

			if (!current || dirty & /*role*/ 1 && button_tabindex_value !== (button_tabindex_value = /*role*/ ctx[0] === 'button' ? 0 : -1)) {
				attr(button, "tabindex", button_tabindex_value);
			}

			if (!current || dirty & /*role*/ 1) {
				attr(button, "role", /*role*/ ctx[0]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(button);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$c($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { grid } = $$props;
	let { role = 'button' } = $$props;
	const [rowStart, rowSpan] = grid;

	function click_handler(event) {
		bubble.call(this, $$self, event);
	}

	function keyup_handler(event) {
		bubble.call(this, $$self, event);
	}

	$$self.$$set = $$props => {
		if ('grid' in $$props) $$invalidate(3, grid = $$props.grid);
		if ('role' in $$props) $$invalidate(0, role = $$props.role);
		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
	};

	return [role, rowStart, rowSpan, grid, $$scope, slots, click_handler, keyup_handler];
}

class ActionCenterTile extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$c, create_fragment$c, safe_not_equal, { grid: 3, role: 0 });
	}
}

const ActionCenter_svelte_svelte_type_style_lang = '';

/* src/svelte/components/TopBar/ActionCenter.svelte generated by Svelte v3.53.1 */

function get_each_context$5(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[14] = list[i];
	const constants_0 = colors[/*colorID*/ child_ctx[14]][/*$theme*/ child_ctx[3].scheme];
	child_ctx[15] = constants_0.contrastHsl;
	child_ctx[16] = constants_0.hsl;
	return child_ctx;
}

// (51:4) <ActionCenterTile grid={[1, 1]} on:click={toggleTheme}>
function create_default_slot_9(ctx) {
	let span;
	let darkmode;
	let t;
	let current;
	darkmode = new Dark_mode({});

	return {
		c() {
			span = element("span");
			create_component(darkmode.$$.fragment);
			t = text("\n      Dark mode");
			attr(span, "class", "toggle-icon svelte-1jsj7fw");
			toggle_class(span, "filled", /*$theme*/ ctx[3].scheme === 'dark');
		},
		m(target, anchor) {
			insert(target, span, anchor);
			mount_component(darkmode, span, null);
			insert(target, t, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (!current || dirty & /*$theme*/ 8) {
				toggle_class(span, "filled", /*$theme*/ ctx[3].scheme === 'dark');
			}
		},
		i(local) {
			if (current) return;
			transition_in(darkmode.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(darkmode.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(span);
			destroy_component(darkmode);
			if (detaching) detach(t);
		}
	};
}

// (45:2) <ActionCenterSurface     grid={[       [1, 6],       [1, 2],     ]}   >
function create_default_slot_8(ctx) {
	let actioncentertile;
	let current;

	actioncentertile = new ActionCenterTile({
			props: {
				grid: [1, 1],
				$$slots: { default: [create_default_slot_9] },
				$$scope: { ctx }
			}
		});

	actioncentertile.$on("click", /*toggleTheme*/ ctx[5]);

	return {
		c() {
			create_component(actioncentertile.$$.fragment);
		},
		m(target, anchor) {
			mount_component(actioncentertile, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const actioncentertile_changes = {};

			if (dirty & /*$$scope, $theme*/ 524296) {
				actioncentertile_changes.$$scope = { dirty, ctx };
			}

			actioncentertile.$set(actioncentertile_changes);
		},
		i(local) {
			if (current) return;
			transition_in(actioncentertile.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(actioncentertile.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(actioncentertile, detaching);
		}
	};
}

// (65:4) <ActionCenterTile grid={[1, 1]} on:click={toggleMotionPreference}>
function create_default_slot_7(ctx) {
	let span;
	let transitionmaskedicon;
	let t;
	let current;
	transitionmaskedicon = new Transition_masked({});

	return {
		c() {
			span = element("span");
			create_component(transitionmaskedicon.$$.fragment);
			t = text("\n      Animations");
			attr(span, "class", "toggle-icon svelte-1jsj7fw");
			toggle_class(span, "filled", !/*$prefersReducedMotion*/ ctx[1]);
		},
		m(target, anchor) {
			insert(target, span, anchor);
			mount_component(transitionmaskedicon, span, null);
			insert(target, t, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (!current || dirty & /*$prefersReducedMotion*/ 2) {
				toggle_class(span, "filled", !/*$prefersReducedMotion*/ ctx[1]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(transitionmaskedicon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(transitionmaskedicon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(span);
			destroy_component(transitionmaskedicon);
			if (detaching) detach(t);
		}
	};
}

// (59:2) <ActionCenterSurface     grid={[       [7, 6],       [1, 2],     ]}   >
function create_default_slot_6(ctx) {
	let actioncentertile;
	let current;

	actioncentertile = new ActionCenterTile({
			props: {
				grid: [1, 1],
				$$slots: { default: [create_default_slot_7] },
				$$scope: { ctx }
			}
		});

	actioncentertile.$on("click", /*toggleMotionPreference*/ ctx[7]);

	return {
		c() {
			create_component(actioncentertile.$$.fragment);
		},
		m(target, anchor) {
			mount_component(actioncentertile, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const actioncentertile_changes = {};

			if (dirty & /*$$scope, $prefersReducedMotion*/ 524290) {
				actioncentertile_changes.$$scope = { dirty, ctx };
			}

			actioncentertile.$set(actioncentertile_changes);
		},
		i(local) {
			if (current) return;
			transition_in(actioncentertile.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(actioncentertile.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(actioncentertile, detaching);
		}
	};
}

// (91:14) {#if $theme.primaryColor === colorID}
function create_if_block$7(ctx) {
	let checkedicon;
	let current;
	checkedicon = new Outline_check({});

	return {
		c() {
			create_component(checkedicon.$$.fragment);
		},
		m(target, anchor) {
			mount_component(checkedicon, target, anchor);
			current = true;
		},
		i(local) {
			if (current) return;
			transition_in(checkedicon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(checkedicon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(checkedicon, detaching);
		}
	};
}

// (83:10) {#each Object.keys(colors) as colorID}
function create_each_block$5(ctx) {
	let button;
	let t;
	let current;
	let mounted;
	let dispose;
	let if_block = /*$theme*/ ctx[3].primaryColor === /*colorID*/ ctx[14] && create_if_block$7();

	function click_handler() {
		return /*click_handler*/ ctx[10](/*colorID*/ ctx[14]);
	}

	return {
		c() {
			button = element("button");
			if (if_block) if_block.c();
			t = space();
			attr(button, "class", "svelte-1jsj7fw");
			set_style(button, "--color-hsl", /*hsl*/ ctx[16]);
			set_style(button, "--color-contrast-hsl", /*contrastHsl*/ ctx[15]);
		},
		m(target, anchor) {
			insert(target, button, anchor);
			if (if_block) if_block.m(button, null);
			append(button, t);
			current = true;

			if (!mounted) {
				dispose = listen(button, "click", click_handler);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (/*$theme*/ ctx[3].primaryColor === /*colorID*/ ctx[14]) {
				if (if_block) {
					if (dirty & /*$theme*/ 8) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$7();
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(button, t);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}

			if (dirty & /*$theme*/ 8) {
				set_style(button, "--color-hsl", /*hsl*/ ctx[16]);
			}

			if (dirty & /*$theme*/ 8) {
				set_style(button, "--color-contrast-hsl", /*contrastHsl*/ ctx[15]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(button);
			if (if_block) if_block.d();
			mounted = false;
			dispose();
		}
	};
}

// (79:4) <ActionCenterTile grid={[1, 1]} role="region">
function create_default_slot_5(ctx) {
	let div1;
	let p;
	let t1;
	let div0;
	let current;
	let each_value = Object.keys(colors);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div1 = element("div");
			p = element("p");
			p.textContent = "System Color";
			t1 = space();
			div0 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div0, "class", "color-palette svelte-1jsj7fw");
			attr(div1, "class", "color-picker svelte-1jsj7fw");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, p);
			append(div1, t1);
			append(div1, div0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div0, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*colors, Object, $theme*/ 8) {
				each_value = Object.keys(colors);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$5(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$5(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div0, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (73:2) <ActionCenterSurface     grid={[       [1, 12],       [3, 2],     ]}   >
function create_default_slot_4(ctx) {
	let actioncentertile;
	let current;

	actioncentertile = new ActionCenterTile({
			props: {
				grid: [1, 1],
				role: "region",
				$$slots: { default: [create_default_slot_5] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(actioncentertile.$$.fragment);
		},
		m(target, anchor) {
			mount_component(actioncentertile, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const actioncentertile_changes = {};

			if (dirty & /*$$scope, $theme*/ 524296) {
				actioncentertile_changes.$$scope = { dirty, ctx };
			}

			actioncentertile.$set(actioncentertile_changes);
		},
		i(local) {
			if (current) return;
			transition_in(actioncentertile.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(actioncentertile.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(actioncentertile, detaching);
		}
	};
}

// (107:4) <ActionCenterTile grid={[1, 1]} on:click={openWallpapersApp}>
function create_default_slot_3(ctx) {
	let div1;
	let img;
	let img_src_value;
	let t0;
	let div0;
	let h3;
	let t1_value = wallpapersConfig[/*$wallpaper*/ ctx[4].id].name + "";
	let t1;
	let t2;
	let p;
	let t3_value = wallpapersConfig[/*$wallpaper*/ ctx[4].id].type + "";
	let t3;
	let t4;

	return {
		c() {
			div1 = element("div");
			img = element("img");
			t0 = space();
			div0 = element("div");
			h3 = element("h3");
			t1 = text(t1_value);
			t2 = space();
			p = element("p");
			t3 = text(t3_value);
			t4 = text(" wallpaper");
			attr(img, "class", "wallpaper-thumbnail svelte-1jsj7fw");
			if (!src_url_equal(img.src, img_src_value = wallpapersConfig[/*$wallpaper*/ ctx[4].id].thumbnail)) attr(img, "src", img_src_value);
			attr(img, "alt", "Current wallpaper");
			attr(h3, "class", "svelte-1jsj7fw");
			attr(p, "class", "svelte-1jsj7fw");
			attr(div0, "class", "wallpaper-info");
			attr(div1, "class", "wallpaper-tile svelte-1jsj7fw");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, img);
			append(div1, t0);
			append(div1, div0);
			append(div0, h3);
			append(h3, t1);
			append(div0, t2);
			append(div0, p);
			append(p, t3);
			append(p, t4);
		},
		p(ctx, dirty) {
			if (dirty & /*$wallpaper*/ 16 && !src_url_equal(img.src, img_src_value = wallpapersConfig[/*$wallpaper*/ ctx[4].id].thumbnail)) {
				attr(img, "src", img_src_value);
			}

			if (dirty & /*$wallpaper*/ 16 && t1_value !== (t1_value = wallpapersConfig[/*$wallpaper*/ ctx[4].id].name + "")) set_data(t1, t1_value);
			if (dirty & /*$wallpaper*/ 16 && t3_value !== (t3_value = wallpapersConfig[/*$wallpaper*/ ctx[4].id].type + "")) set_data(t3, t3_value);
		},
		d(detaching) {
			if (detaching) detach(div1);
		}
	};
}

// (101:2) <ActionCenterSurface     grid={[       [1, 12],       [5, 3],     ]}   >
function create_default_slot_2(ctx) {
	let actioncentertile;
	let current;

	actioncentertile = new ActionCenterTile({
			props: {
				grid: [1, 1],
				$$slots: { default: [create_default_slot_3] },
				$$scope: { ctx }
			}
		});

	actioncentertile.$on("click", /*openWallpapersApp*/ ctx[8]);

	return {
		c() {
			create_component(actioncentertile.$$.fragment);
		},
		m(target, anchor) {
			mount_component(actioncentertile, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const actioncentertile_changes = {};

			if (dirty & /*$$scope, $wallpaper*/ 524304) {
				actioncentertile_changes.$$scope = { dirty, ctx };
			}

			actioncentertile.$set(actioncentertile_changes);
		},
		i(local) {
			if (current) return;
			transition_in(actioncentertile.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(actioncentertile.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(actioncentertile, detaching);
		}
	};
}

// (129:4) <ActionCenterTile grid={[1, 1]} on:click={toggleNotch}>
function create_default_slot_1(ctx) {
	let div;
	let span;
	let notchicon;
	let t;
	let current;
	notchicon = new Smartphone_notch({});

	return {
		c() {
			div = element("div");
			span = element("span");
			create_component(notchicon.$$.fragment);
			t = text("\n        Notch");
			attr(span, "class", "toggle-icon svelte-1jsj7fw");
			toggle_class(span, "filled", /*$shouldShowNotch*/ ctx[2]);
			attr(div, "class", "notch-tile svelte-1jsj7fw");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, span);
			mount_component(notchicon, span, null);
			append(div, t);
			current = true;
		},
		p(ctx, dirty) {
			if (!current || dirty & /*$shouldShowNotch*/ 4) {
				toggle_class(span, "filled", /*$shouldShowNotch*/ ctx[2]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(notchicon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(notchicon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(notchicon);
		}
	};
}

// (123:2) <ActionCenterSurface     grid={[       [1, 12],       [8, 2],     ]}   >
function create_default_slot$2(ctx) {
	let actioncentertile;
	let current;

	actioncentertile = new ActionCenterTile({
			props: {
				grid: [1, 1],
				$$slots: { default: [create_default_slot_1] },
				$$scope: { ctx }
			}
		});

	actioncentertile.$on("click", /*toggleNotch*/ ctx[6]);

	return {
		c() {
			create_component(actioncentertile.$$.fragment);
		},
		m(target, anchor) {
			mount_component(actioncentertile, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const actioncentertile_changes = {};

			if (dirty & /*$$scope, $shouldShowNotch*/ 524292) {
				actioncentertile_changes.$$scope = { dirty, ctx };
			}

			actioncentertile.$set(actioncentertile_changes);
		},
		i(local) {
			if (current) return;
			transition_in(actioncentertile.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(actioncentertile.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(actioncentertile, detaching);
		}
	};
}

function create_fragment$b(ctx) {
	let section;
	let actioncentersurface0;
	let t0;
	let actioncentersurface1;
	let t1;
	let actioncentersurface2;
	let t2;
	let actioncentersurface3;
	let t3;
	let actioncentersurface4;
	let current;

	actioncentersurface0 = new ActionCenterSurface({
			props: {
				grid: [[1, 6], [1, 2]],
				$$slots: { default: [create_default_slot_8] },
				$$scope: { ctx }
			}
		});

	actioncentersurface1 = new ActionCenterSurface({
			props: {
				grid: [[7, 6], [1, 2]],
				$$slots: { default: [create_default_slot_6] },
				$$scope: { ctx }
			}
		});

	actioncentersurface2 = new ActionCenterSurface({
			props: {
				grid: [[1, 12], [3, 2]],
				$$slots: { default: [create_default_slot_4] },
				$$scope: { ctx }
			}
		});

	actioncentersurface3 = new ActionCenterSurface({
			props: {
				grid: [[1, 12], [5, 3]],
				$$slots: { default: [create_default_slot_2] },
				$$scope: { ctx }
			}
		});

	actioncentersurface4 = new ActionCenterSurface({
			props: {
				grid: [[1, 12], [8, 2]],
				$$slots: { default: [create_default_slot$2] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			section = element("section");
			create_component(actioncentersurface0.$$.fragment);
			t0 = space();
			create_component(actioncentersurface1.$$.fragment);
			t1 = space();
			create_component(actioncentersurface2.$$.fragment);
			t2 = space();
			create_component(actioncentersurface3.$$.fragment);
			t3 = space();
			create_component(actioncentersurface4.$$.fragment);
			attr(section, "class", "container svelte-1jsj7fw");
			attr(section, "tabindex", -1);
			toggle_class(section, "dark", /*$theme*/ ctx[3].scheme === 'dark');
		},
		m(target, anchor) {
			insert(target, section, anchor);
			mount_component(actioncentersurface0, section, null);
			append(section, t0);
			mount_component(actioncentersurface1, section, null);
			append(section, t1);
			mount_component(actioncentersurface2, section, null);
			append(section, t2);
			mount_component(actioncentersurface3, section, null);
			append(section, t3);
			mount_component(actioncentersurface4, section, null);
			/*section_binding*/ ctx[11](section);
			current = true;
		},
		p(ctx, [dirty]) {
			const actioncentersurface0_changes = {};

			if (dirty & /*$$scope, $theme*/ 524296) {
				actioncentersurface0_changes.$$scope = { dirty, ctx };
			}

			actioncentersurface0.$set(actioncentersurface0_changes);
			const actioncentersurface1_changes = {};

			if (dirty & /*$$scope, $prefersReducedMotion*/ 524290) {
				actioncentersurface1_changes.$$scope = { dirty, ctx };
			}

			actioncentersurface1.$set(actioncentersurface1_changes);
			const actioncentersurface2_changes = {};

			if (dirty & /*$$scope, $theme*/ 524296) {
				actioncentersurface2_changes.$$scope = { dirty, ctx };
			}

			actioncentersurface2.$set(actioncentersurface2_changes);
			const actioncentersurface3_changes = {};

			if (dirty & /*$$scope, $wallpaper*/ 524304) {
				actioncentersurface3_changes.$$scope = { dirty, ctx };
			}

			actioncentersurface3.$set(actioncentersurface3_changes);
			const actioncentersurface4_changes = {};

			if (dirty & /*$$scope, $shouldShowNotch*/ 524292) {
				actioncentersurface4_changes.$$scope = { dirty, ctx };
			}

			actioncentersurface4.$set(actioncentersurface4_changes);

			if (!current || dirty & /*$theme*/ 8) {
				toggle_class(section, "dark", /*$theme*/ ctx[3].scheme === 'dark');
			}
		},
		i(local) {
			if (current) return;
			transition_in(actioncentersurface0.$$.fragment, local);
			transition_in(actioncentersurface1.$$.fragment, local);
			transition_in(actioncentersurface2.$$.fragment, local);
			transition_in(actioncentersurface3.$$.fragment, local);
			transition_in(actioncentersurface4.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(actioncentersurface0.$$.fragment, local);
			transition_out(actioncentersurface1.$$.fragment, local);
			transition_out(actioncentersurface2.$$.fragment, local);
			transition_out(actioncentersurface3.$$.fragment, local);
			transition_out(actioncentersurface4.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(section);
			destroy_component(actioncentersurface0);
			destroy_component(actioncentersurface1);
			destroy_component(actioncentersurface2);
			destroy_component(actioncentersurface3);
			destroy_component(actioncentersurface4);
			/*section_binding*/ ctx[11](null);
		}
	};
}

function instance$b($$self, $$props, $$invalidate) {
	let $activeApp;
	let $openApps;
	let $prefersReducedMotion;
	let $shouldShowNotch;
	let $theme;
	let $wallpaper;
	component_subscribe($$self, activeApp, $$value => $$invalidate(12, $activeApp = $$value));
	component_subscribe($$self, openApps, $$value => $$invalidate(13, $openApps = $$value));
	component_subscribe($$self, prefersReducedMotion, $$value => $$invalidate(1, $prefersReducedMotion = $$value));
	component_subscribe($$self, shouldShowNotch, $$value => $$invalidate(2, $shouldShowNotch = $$value));
	component_subscribe($$self, theme, $$value => $$invalidate(3, $theme = $$value));
	component_subscribe($$self, wallpaper, $$value => $$invalidate(4, $wallpaper = $$value));
	let { isThemeWarningDialogOpen } = $$props;
	let containerEl;

	function toggleTheme() {
		if (wallpapersConfig[$wallpaper.id].type === 'dynamic' && $wallpaper.canControlTheme) {
			$$invalidate(9, isThemeWarningDialogOpen = true);
			return;
		}

		set_store_value(theme, $theme.scheme = $theme.scheme === 'light' ? 'dark' : 'light', $theme);
	}

	function toggleNotch() {
		set_store_value(shouldShowNotch, $shouldShowNotch = !$shouldShowNotch, $shouldShowNotch);
	}

	function toggleMotionPreference() {
		set_store_value(prefersReducedMotion, $prefersReducedMotion = !$prefersReducedMotion, $prefersReducedMotion);
	}

	function openWallpapersApp() {
		set_store_value(openApps, $openApps.wallpapers = true, $openApps);
		set_store_value(activeApp, $activeApp = 'wallpapers', $activeApp);
	}

	onMount(() => containerEl?.focus());
	const click_handler = colorID => set_store_value(theme, $theme.primaryColor = colorID, $theme);

	function section_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			containerEl = $$value;
			$$invalidate(0, containerEl);
		});
	}

	$$self.$$set = $$props => {
		if ('isThemeWarningDialogOpen' in $$props) $$invalidate(9, isThemeWarningDialogOpen = $$props.isThemeWarningDialogOpen);
	};

	return [
		containerEl,
		$prefersReducedMotion,
		$shouldShowNotch,
		$theme,
		$wallpaper,
		toggleTheme,
		toggleNotch,
		toggleMotionPreference,
		openWallpapersApp,
		isThemeWarningDialogOpen,
		click_handler,
		section_binding
	];
}

class ActionCenter extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$b, create_fragment$b, safe_not_equal, { isThemeWarningDialogOpen: 9 });
	}
}

const ActionCenterToggle_svelte_svelte_type_style_lang = '';

/* src/svelte/components/TopBar/ActionCenterToggle.svelte generated by Svelte v3.53.1 */

function create_if_block$6(ctx) {
	let div;
	let actioncenter;
	let updating_isThemeWarningDialogOpen;
	let div_intro;
	let div_outro;
	let current;
	let mounted;
	let dispose;

	function actioncenter_isThemeWarningDialogOpen_binding(value) {
		/*actioncenter_isThemeWarningDialogOpen_binding*/ ctx[7](value);
	}

	let actioncenter_props = {};

	if (/*isThemeWarningDialogOpen*/ ctx[1] !== void 0) {
		actioncenter_props.isThemeWarningDialogOpen = /*isThemeWarningDialogOpen*/ ctx[1];
	}

	actioncenter = new ActionCenter({ props: actioncenter_props });
	binding_callbacks.push(() => bind(actioncenter, 'isThemeWarningDialogOpen', actioncenter_isThemeWarningDialogOpen_binding));

	return {
		c() {
			div = element("div");
			create_component(actioncenter.$$.fragment);
			attr(div, "class", "menu-parent svelte-1pwt7pn");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(actioncenter, div, null);
			current = true;

			if (!mounted) {
				dispose = action_destroyer(elevation.call(null, div, 'menubar-menu-parent'));
				mounted = true;
			}
		},
		p(ctx, dirty) {
			const actioncenter_changes = {};

			if (!updating_isThemeWarningDialogOpen && dirty & /*isThemeWarningDialogOpen*/ 2) {
				updating_isThemeWarningDialogOpen = true;
				actioncenter_changes.isThemeWarningDialogOpen = /*isThemeWarningDialogOpen*/ ctx[1];
				add_flush_callback(() => updating_isThemeWarningDialogOpen = false);
			}

			actioncenter.$set(actioncenter_changes);
		},
		i(local) {
			if (current) return;
			transition_in(actioncenter.$$.fragment, local);

			add_render_callback(() => {
				if (div_outro) div_outro.end(1);
				div_intro = create_in_transition(div, fadeIn, {});
				div_intro.start();
			});

			current = true;
		},
		o(local) {
			transition_out(actioncenter.$$.fragment, local);
			if (div_intro) div_intro.invalidate();
			div_outro = create_out_transition(div, fadeOut, {});
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(actioncenter);
			if (detaching && div_outro) div_outro.end();
			mounted = false;
			dispose();
		}
	};
}

// (33:0) <SystemDialog bind:this={themeWarningDialog} on:close={() => (isThemeWarningDialogOpen = false)}>
function create_default_slot$1(ctx) {
	let section;
	let img;
	let img_src_value;
	let t0;
	let h3;
	let t2;
	let p;
	let t4;
	let div;
	let button0;
	let t6;
	let button1;
	let mounted;
	let dispose;

	return {
		c() {
			section = element("section");
			img = element("img");
			t0 = space();
			h3 = element("h3");
			h3.textContent = "Current Wallpaper Settings prevent changing theme";
			t2 = space();
			p = element("p");
			p.textContent = "Head over to Wallpapers app to change this setting or choose a standalone wallpaper.";
			t4 = space();
			div = element("div");
			button0 = element("button");
			button0.textContent = "Close";
			t6 = space();
			button1 = element("button");
			button1.textContent = "Go to Wallpapers";
			attr(img, "height", "100");
			attr(img, "width", "100");
			if (!src_url_equal(img.src, img_src_value = "/app-icons/wallpapers/256.webp")) attr(img, "src", img_src_value);
			attr(img, "alt", "Wallpapers app logo");
			attr(h3, "class", "svelte-1pwt7pn");
			attr(p, "class", "svelte-1pwt7pn");
			attr(button0, "class", "svelte-1pwt7pn");
			attr(button1, "class", "confirm svelte-1pwt7pn");
			attr(div, "class", "buttons svelte-1pwt7pn");
			attr(section, "class", "theme-warning-section svelte-1pwt7pn");
		},
		m(target, anchor) {
			insert(target, section, anchor);
			append(section, img);
			append(section, t0);
			append(section, h3);
			append(section, t2);
			append(section, p);
			append(section, t4);
			append(section, div);
			append(div, button0);
			append(div, t6);
			append(div, button1);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*click_handler*/ ctx[8]),
					listen(button1, "click", /*click_handler_1*/ ctx[9])
				];

				mounted = true;
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(section);
			mounted = false;
			run_all(dispose);
		}
	};
}

function create_fragment$a(ctx) {
	let div;
	let button;
	let img;
	let img_src_value;
	let t0;
	let t1;
	let systemdialog;
	let current;
	let mounted;
	let dispose;
	let if_block = /*visible*/ ctx[2] && create_if_block$6(ctx);

	let systemdialog_props = {
		$$slots: { default: [create_default_slot$1] },
		$$scope: { ctx }
	};

	systemdialog = new SystemDialog({ props: systemdialog_props });
	/*systemdialog_binding*/ ctx[10](systemdialog);
	systemdialog.$on("close", /*close_handler*/ ctx[11]);

	return {
		c() {
			div = element("div");
			button = element("button");
			img = element("img");
			t0 = space();
			if (if_block) if_block.c();
			t1 = space();
			create_component(systemdialog.$$.fragment);
			attr(img, "alt", "config");
			attr(img, "class", "darkmode-invert");
			if (!src_url_equal(img.src, img_src_value = appIcon['config'])) attr(img, "src", img_src_value);
			attr(button, "class", "svelte-1pwt7pn");
			set_style(button, "--scale", /*visible*/ ctx[2] ? 1 : 0);
			attr(div, "class", "container svelte-1pwt7pn");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, button);
			append(button, img);
			append(div, t0);
			if (if_block) if_block.m(div, null);
			insert(target, t1, anchor);
			mount_component(systemdialog, target, anchor);
			current = true;

			if (!mounted) {
				dispose = [
					listen(button, "click", /*show*/ ctx[5]),
					listen(button, "focus", /*show*/ ctx[5]),
					action_destroyer(clickOutside.call(null, div, { callback: /*hide*/ ctx[6] })),
					action_destroyer(focusOutside.call(null, div, { callback: /*hide*/ ctx[6] }))
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*visible*/ 4) {
				set_style(button, "--scale", /*visible*/ ctx[2] ? 1 : 0);
			}

			if (/*visible*/ ctx[2]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*visible*/ 4) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$6(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div, null);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}

			const systemdialog_changes = {};

			if (dirty & /*$$scope, themeWarningDialog, $openApps, $activeApp*/ 4121) {
				systemdialog_changes.$$scope = { dirty, ctx };
			}

			systemdialog.$set(systemdialog_changes);
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			transition_in(systemdialog.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			transition_out(systemdialog.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block) if_block.d();
			if (detaching) detach(t1);
			/*systemdialog_binding*/ ctx[10](null);
			destroy_component(systemdialog, detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$a($$self, $$props, $$invalidate) {
	let $openApps;
	let $activeApp;
	component_subscribe($$self, openApps, $$value => $$invalidate(3, $openApps = $$value));
	component_subscribe($$self, activeApp, $$value => $$invalidate(4, $activeApp = $$value));
	let visible = false;
	let themeWarningDialog;

	/* LOGIC FOR THEME SWITCHING WHEN IT ISN'T ALLOWED */
	let isThemeWarningDialogOpen = false;

	function show() {
		$$invalidate(2, visible = true);
	}

	function hide() {
		$$invalidate(2, visible = false);
	}

	function actioncenter_isThemeWarningDialogOpen_binding(value) {
		isThemeWarningDialogOpen = value;
		$$invalidate(1, isThemeWarningDialogOpen);
	}

	const click_handler = () => themeWarningDialog.close();

	const click_handler_1 = () => {
		themeWarningDialog.close();
		set_store_value(openApps, $openApps.wallpapers = true, $openApps);
		set_store_value(activeApp, $activeApp = 'wallpapers', $activeApp);
	};

	function systemdialog_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			themeWarningDialog = $$value;
			$$invalidate(0, themeWarningDialog);
		});
	}

	const close_handler = () => $$invalidate(1, isThemeWarningDialogOpen = false);

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*isThemeWarningDialogOpen, themeWarningDialog*/ 3) {
			isThemeWarningDialogOpen && themeWarningDialog.open();
		}
	};

	return [
		themeWarningDialog,
		isThemeWarningDialogOpen,
		visible,
		$openApps,
		$activeApp,
		show,
		hide,
		actioncenter_isThemeWarningDialogOpen_binding,
		click_handler,
		click_handler_1,
		systemdialog_binding,
		close_handler
	];
}

class ActionCenterToggle extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});
	}
}

const Menu_svelte_svelte_type_style_lang = '';

/* src/svelte/components/TopBar/Menu.svelte generated by Svelte v3.53.1 */

function get_each_context$4(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[2] = list[i][1];
	return child_ctx;
}

// (8:4) {#if val.breakAfter}
function create_if_block$5(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			attr(div, "class", "divider svelte-a6d0qc");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (6:2) {#each Object.entries(menu) as [, val]}
function create_each_block$4(ctx) {
	let button;
	let t0_value = /*val*/ ctx[2].title + "";
	let t0;
	let button_disabled_value;
	let t1;
	let if_block_anchor;
	let if_block = /*val*/ ctx[2].breakAfter && create_if_block$5();

	return {
		c() {
			button = element("button");
			t0 = text(t0_value);
			t1 = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			attr(button, "class", "menu-item svelte-a6d0qc");
			button.disabled = button_disabled_value = /*val*/ ctx[2].disabled;
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t0);
			insert(target, t1, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*menu*/ 1 && t0_value !== (t0_value = /*val*/ ctx[2].title + "")) set_data(t0, t0_value);

			if (dirty & /*menu*/ 1 && button_disabled_value !== (button_disabled_value = /*val*/ ctx[2].disabled)) {
				button.disabled = button_disabled_value;
			}

			if (/*val*/ ctx[2].breakAfter) {
				if (if_block) ; else {
					if_block = create_if_block$5();
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) detach(button);
			if (detaching) detach(t1);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function create_fragment$9(ctx) {
	let section;
	let each_value = Object.entries(/*menu*/ ctx[0]);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
	}

	return {
		c() {
			section = element("section");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(section, "class", "container svelte-a6d0qc");
			toggle_class(section, "dark", /*$theme*/ ctx[1].scheme === 'dark');
		},
		m(target, anchor) {
			insert(target, section, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(section, null);
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*Object, menu*/ 1) {
				each_value = Object.entries(/*menu*/ ctx[0]);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$4(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$4(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(section, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (dirty & /*$theme*/ 2) {
				toggle_class(section, "dark", /*$theme*/ ctx[1].scheme === 'dark');
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(section);
			destroy_each(each_blocks, detaching);
		}
	};
}

function instance$9($$self, $$props, $$invalidate) {
	let $theme;
	component_subscribe($$self, theme, $$value => $$invalidate(1, $theme = $$value));
	let { menu } = $$props;

	$$self.$$set = $$props => {
		if ('menu' in $$props) $$invalidate(0, menu = $$props.menu);
	};

	return [menu, $theme];
}

class Menu extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$9, create_fragment$9, safe_not_equal, { menu: 0 });
	}
}

const MenuBar_svelte_svelte_type_style_lang = '';

/* src/svelte/components/TopBar/MenuBar.svelte generated by Svelte v3.53.1 */

function get_each_context$3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[7] = list[i][0];
	child_ctx[8] = list[i][1];
	return child_ctx;
}

// (26:10) {:else}
function create_else_block(ctx) {
	let t_value = /*menuConfig*/ ctx[8].title + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*$menuBarMenus*/ 2 && t_value !== (t_value = /*menuConfig*/ ctx[8].title + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (24:10) {#if menuID === 'apple'}
function create_if_block$4(ctx) {
	let img;
	let img_src_value;

	return {
		c() {
			img = element("img");
			attr(img, "alt", "start");
			attr(img, "class", "darkmode-invert");
			if (!src_url_equal(img.src, img_src_value = appIcon['start'])) attr(img, "src", img_src_value);
		},
		m(target, anchor) {
			insert(target, img, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(img);
		}
	};
}

// (12:2) {#each Object.entries($menuBarMenus) as [menuID, menuConfig]}
function create_each_block$3(ctx) {
	let div2;
	let div0;
	let button;
	let t0;
	let div1;
	let menu;
	let t1;
	let current;
	let mounted;
	let dispose;

	function select_block_type(ctx, dirty) {
		if (/*menuID*/ ctx[7] === 'apple') return create_if_block$4;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	function click_handler() {
		return /*click_handler*/ ctx[2](/*menuID*/ ctx[7]);
	}

	function mouseover_handler() {
		return /*mouseover_handler*/ ctx[3](/*menuID*/ ctx[7]);
	}

	function focus_handler() {
		return /*focus_handler*/ ctx[4](/*menuID*/ ctx[7]);
	}

	menu = new Menu({
			props: { menu: /*menuConfig*/ ctx[8].menu }
		});

	return {
		c() {
			div2 = element("div");
			div0 = element("div");
			button = element("button");
			if_block.c();
			t0 = space();
			div1 = element("div");
			create_component(menu.$$.fragment);
			t1 = space();
			attr(button, "class", "menu-button svelte-a59w5p");
			toggle_class(button, "default-menu", /*menuID*/ ctx[7] === 'default');
			toggle_class(button, "apple-icon-button", /*menuID*/ ctx[7] === 'apple');
			set_style(button, "--scale", /*$activeMenu*/ ctx[0] === /*menuID*/ ctx[7] ? 1 : 0);
			set_style(div0, "height", `100%`);
			attr(div1, "class", "menu-parent svelte-a59w5p");

			set_style(div1, "visibility", /*$activeMenu*/ ctx[0] === /*menuID*/ ctx[7]
			? 'visible'
			: 'hidden');
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, div0);
			append(div0, button);
			if_block.m(button, null);
			append(div2, t0);
			append(div2, div1);
			mount_component(menu, div1, null);
			append(div2, t1);
			current = true;

			if (!mounted) {
				dispose = [
					listen(button, "click", click_handler),
					listen(button, "mouseover", mouseover_handler),
					listen(button, "focus", focus_handler),
					action_destroyer(elevation.call(null, div1, 'menubar-menu-parent'))
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(button, null);
				}
			}

			if (!current || dirty & /*Object, $menuBarMenus*/ 2) {
				toggle_class(button, "default-menu", /*menuID*/ ctx[7] === 'default');
			}

			if (!current || dirty & /*Object, $menuBarMenus*/ 2) {
				toggle_class(button, "apple-icon-button", /*menuID*/ ctx[7] === 'apple');
			}

			if (dirty & /*$activeMenu, $menuBarMenus*/ 3) {
				set_style(button, "--scale", /*$activeMenu*/ ctx[0] === /*menuID*/ ctx[7] ? 1 : 0);
			}

			const menu_changes = {};
			if (dirty & /*$menuBarMenus*/ 2) menu_changes.menu = /*menuConfig*/ ctx[8].menu;
			menu.$set(menu_changes);

			if (dirty & /*$activeMenu, $menuBarMenus*/ 3) {
				set_style(div1, "visibility", /*$activeMenu*/ ctx[0] === /*menuID*/ ctx[7]
				? 'visible'
				: 'hidden');
			}
		},
		i(local) {
			if (current) return;
			transition_in(menu.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(menu.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div2);
			if_block.d();
			destroy_component(menu);
			mounted = false;
			run_all(dispose);
		}
	};
}

function create_fragment$8(ctx) {
	let div;
	let clickOutside_action;
	let focusOutside_action;
	let current;
	let mounted;
	let dispose;
	let each_value = Object.entries(/*$menuBarMenus*/ ctx[1]);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "container svelte-a59w5p");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;

			if (!mounted) {
				dispose = [
					action_destroyer(clickOutside_action = clickOutside.call(null, div, {
						callback: /*clickOutside_function*/ ctx[5]
					})),
					action_destroyer(focusOutside_action = focusOutside.call(null, div, {
						callback: /*focusOutside_function*/ ctx[6]
					}))
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*$activeMenu, Object, $menuBarMenus, appIcon*/ 3) {
				each_value = Object.entries(/*$menuBarMenus*/ ctx[1]);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$3(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$3(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}

			if (clickOutside_action && is_function(clickOutside_action.update) && dirty & /*$activeMenu*/ 1) clickOutside_action.update.call(null, {
				callback: /*clickOutside_function*/ ctx[5]
			});

			if (focusOutside_action && is_function(focusOutside_action.update) && dirty & /*$activeMenu*/ 1) focusOutside_action.update.call(null, {
				callback: /*focusOutside_function*/ ctx[6]
			});
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$8($$self, $$props, $$invalidate) {
	let $activeMenu;
	let $menuBarMenus;
	component_subscribe($$self, activeMenu, $$value => $$invalidate(0, $activeMenu = $$value));
	component_subscribe($$self, menuBarMenus, $$value => $$invalidate(1, $menuBarMenus = $$value));
	const click_handler = menuID => set_store_value(activeMenu, $activeMenu = menuID, $activeMenu);
	const mouseover_handler = menuID => $activeMenu && set_store_value(activeMenu, $activeMenu = menuID, $activeMenu);
	const focus_handler = menuID => set_store_value(activeMenu, $activeMenu = menuID, $activeMenu);
	const clickOutside_function = () => set_store_value(activeMenu, $activeMenu = '', $activeMenu);
	const focusOutside_function = () => set_store_value(activeMenu, $activeMenu = '', $activeMenu);

	return [
		$activeMenu,
		$menuBarMenus,
		click_handler,
		mouseover_handler,
		focus_handler,
		clickOutside_function,
		focusOutside_function
	];
}

class MenuBar extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});
	}
}

function toInteger(dirtyNumber) {
  if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
    return NaN;
  }

  var number = Number(dirtyNumber);

  if (isNaN(number)) {
    return number;
  }

  return number < 0 ? Math.ceil(number) : Math.floor(number);
}

function requiredArgs(required, args) {
  if (args.length < required) {
    throw new TypeError(required + ' argument' + (required > 1 ? 's' : '') + ' required, but only ' + args.length + ' present');
  }
}

function _typeof$1(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$1 = function _typeof(obj) { return typeof obj; }; } else { _typeof$1 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$1(obj); }
/**
 * @name toDate
 * @category Common Helpers
 * @summary Convert the given argument to an instance of Date.
 *
 * @description
 * Convert the given argument to an instance of Date.
 *
 * If the argument is an instance of Date, the function returns its clone.
 *
 * If the argument is a number, it is treated as a timestamp.
 *
 * If the argument is none of the above, the function returns Invalid Date.
 *
 * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
 *
 * @param {Date|Number} argument - the value to convert
 * @returns {Date} the parsed date in the local time zone
 * @throws {TypeError} 1 argument required
 *
 * @example
 * // Clone the date:
 * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
 * //=> Tue Feb 11 2014 11:30:30
 *
 * @example
 * // Convert the timestamp to date:
 * const result = toDate(1392098430000)
 * //=> Tue Feb 11 2014 11:30:30
 */

function toDate(argument) {
  requiredArgs(1, arguments);
  var argStr = Object.prototype.toString.call(argument); // Clone the date

  if (argument instanceof Date || _typeof$1(argument) === 'object' && argStr === '[object Date]') {
    // Prevent the date to lose the milliseconds when passed to new Date() in IE10
    return new Date(argument.getTime());
  } else if (typeof argument === 'number' || argStr === '[object Number]') {
    return new Date(argument);
  } else {
    if ((typeof argument === 'string' || argStr === '[object String]') && typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#string-arguments"); // eslint-disable-next-line no-console

      console.warn(new Error().stack);
    }

    return new Date(NaN);
  }
}

/**
 * @name addMilliseconds
 * @category Millisecond Helpers
 * @summary Add the specified number of milliseconds to the given date.
 *
 * @description
 * Add the specified number of milliseconds to the given date.
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of milliseconds to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} the new date with the milliseconds added
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Add 750 milliseconds to 10 July 2014 12:45:30.000:
 * const result = addMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
 * //=> Thu Jul 10 2014 12:45:30.750
 */

function addMilliseconds(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var timestamp = toDate(dirtyDate).getTime();
  var amount = toInteger(dirtyAmount);
  return new Date(timestamp + amount);
}

var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

/**
 * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
 * They usually appear for dates that denote time before the timezones were introduced
 * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
 * and GMT+01:00:00 after that date)
 *
 * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
 * which would lead to incorrect calculations.
 *
 * This function returns the timezone offset in milliseconds that takes seconds in account.
 */
function getTimezoneOffsetInMilliseconds(date) {
  var utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
  utcDate.setUTCFullYear(date.getFullYear());
  return date.getTime() - utcDate.getTime();
}

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }
/**
 * @name isDate
 * @category Common Helpers
 * @summary Is the given value a date?
 *
 * @description
 * Returns true if the given value is an instance of Date. The function works for dates transferred across iframes.
 *
 * @param {*} value - the value to check
 * @returns {boolean} true if the given value is a date
 * @throws {TypeError} 1 arguments required
 *
 * @example
 * // For a valid date:
 * const result = isDate(new Date())
 * //=> true
 *
 * @example
 * // For an invalid date:
 * const result = isDate(new Date(NaN))
 * //=> true
 *
 * @example
 * // For some value:
 * const result = isDate('2014-02-31')
 * //=> false
 *
 * @example
 * // For an object:
 * const result = isDate({})
 * //=> false
 */

function isDate(value) {
  requiredArgs(1, arguments);
  return value instanceof Date || _typeof(value) === 'object' && Object.prototype.toString.call(value) === '[object Date]';
}

/**
 * @name isValid
 * @category Common Helpers
 * @summary Is the given date valid?
 *
 * @description
 * Returns false if argument is Invalid Date and true otherwise.
 * Argument is converted to Date using `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
 * Invalid Date is a Date, whose time value is NaN.
 *
 * Time value of Date: http://es5.github.io/#x15.9.1.1
 *
 * @param {*} date - the date to check
 * @returns {Boolean} the date is valid
 * @throws {TypeError} 1 argument required
 *
 * @example
 * // For the valid date:
 * const result = isValid(new Date(2014, 1, 31))
 * //=> true
 *
 * @example
 * // For the value, convertable into a date:
 * const result = isValid(1393804800000)
 * //=> true
 *
 * @example
 * // For the invalid date:
 * const result = isValid(new Date(''))
 * //=> false
 */

function isValid(dirtyDate) {
  requiredArgs(1, arguments);

  if (!isDate(dirtyDate) && typeof dirtyDate !== 'number') {
    return false;
  }

  var date = toDate(dirtyDate);
  return !isNaN(Number(date));
}

/**
 * @name subMilliseconds
 * @category Millisecond Helpers
 * @summary Subtract the specified number of milliseconds from the given date.
 *
 * @description
 * Subtract the specified number of milliseconds from the given date.
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of milliseconds to be subtracted. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} the new date with the milliseconds subtracted
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Subtract 750 milliseconds from 10 July 2014 12:45:30.000:
 * const result = subMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
 * //=> Thu Jul 10 2014 12:45:29.250
 */

function subMilliseconds(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var amount = toInteger(dirtyAmount);
  return addMilliseconds(dirtyDate, -amount);
}

var MILLISECONDS_IN_DAY = 86400000;
function getUTCDayOfYear(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var timestamp = date.getTime();
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
  var startOfYearTimestamp = date.getTime();
  var difference = timestamp - startOfYearTimestamp;
  return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
}

function startOfUTCISOWeek(dirtyDate) {
  requiredArgs(1, arguments);
  var weekStartsOn = 1;
  var date = toDate(dirtyDate);
  var day = date.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function getUTCISOWeekYear(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getUTCFullYear();
  var fourthOfJanuaryOfNextYear = new Date(0);
  fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
  var startOfNextYear = startOfUTCISOWeek(fourthOfJanuaryOfNextYear);
  var fourthOfJanuaryOfThisYear = new Date(0);
  fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
  var startOfThisYear = startOfUTCISOWeek(fourthOfJanuaryOfThisYear);

  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

function startOfUTCISOWeekYear(dirtyDate) {
  requiredArgs(1, arguments);
  var year = getUTCISOWeekYear(dirtyDate);
  var fourthOfJanuary = new Date(0);
  fourthOfJanuary.setUTCFullYear(year, 0, 4);
  fourthOfJanuary.setUTCHours(0, 0, 0, 0);
  var date = startOfUTCISOWeek(fourthOfJanuary);
  return date;
}

var MILLISECONDS_IN_WEEK$1 = 604800000;
function getUTCISOWeek(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var diff = startOfUTCISOWeek(date).getTime() - startOfUTCISOWeekYear(date).getTime(); // Round the number of days to the nearest integer
  // because the number of milliseconds in a week is not constant
  // (e.g. it's different in the week of the daylight saving time clock shift)

  return Math.round(diff / MILLISECONDS_IN_WEEK$1) + 1;
}

function startOfUTCWeek(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;

  requiredArgs(1, arguments);
  var defaultOptions = getDefaultOptions();
  var weekStartsOn = toInteger((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  }

  var date = toDate(dirtyDate);
  var day = date.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function getUTCWeekYear(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$firstWeekCon, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;

  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getUTCFullYear();
  var defaultOptions = getDefaultOptions();
  var firstWeekContainsDate = toInteger((_ref = (_ref2 = (_ref3 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref !== void 0 ? _ref : 1); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  }

  var firstWeekOfNextYear = new Date(0);
  firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
  var startOfNextYear = startOfUTCWeek(firstWeekOfNextYear, options);
  var firstWeekOfThisYear = new Date(0);
  firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
  var startOfThisYear = startOfUTCWeek(firstWeekOfThisYear, options);

  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

function startOfUTCWeekYear(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$firstWeekCon, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;

  requiredArgs(1, arguments);
  var defaultOptions = getDefaultOptions();
  var firstWeekContainsDate = toInteger((_ref = (_ref2 = (_ref3 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref !== void 0 ? _ref : 1);
  var year = getUTCWeekYear(dirtyDate, options);
  var firstWeek = new Date(0);
  firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setUTCHours(0, 0, 0, 0);
  var date = startOfUTCWeek(firstWeek, options);
  return date;
}

var MILLISECONDS_IN_WEEK = 604800000;
function getUTCWeek(dirtyDate, options) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var diff = startOfUTCWeek(date, options).getTime() - startOfUTCWeekYear(date, options).getTime(); // Round the number of days to the nearest integer
  // because the number of milliseconds in a week is not constant
  // (e.g. it's different in the week of the daylight saving time clock shift)

  return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
}

function addLeadingZeros(number, targetLength) {
  var sign = number < 0 ? '-' : '';
  var output = Math.abs(number).toString();

  while (output.length < targetLength) {
    output = '0' + output;
  }

  return sign + output;
}

/*
 * |     | Unit                           |     | Unit                           |
 * |-----|--------------------------------|-----|--------------------------------|
 * |  a  | AM, PM                         |  A* |                                |
 * |  d  | Day of month                   |  D  |                                |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
 * |  m  | Minute                         |  M  | Month                          |
 * |  s  | Second                         |  S  | Fraction of second             |
 * |  y  | Year (abs)                     |  Y  |                                |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 */

var formatters$2 = {
  // Year
  y: function y(date, token) {
    // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
    // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
    // |----------|-------|----|-------|-------|-------|
    // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
    // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
    // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
    // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
    // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |
    var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

    var year = signedYear > 0 ? signedYear : 1 - signedYear;
    return addLeadingZeros(token === 'yy' ? year % 100 : year, token.length);
  },
  // Month
  M: function M(date, token) {
    var month = date.getUTCMonth();
    return token === 'M' ? String(month + 1) : addLeadingZeros(month + 1, 2);
  },
  // Day of the month
  d: function d(date, token) {
    return addLeadingZeros(date.getUTCDate(), token.length);
  },
  // AM or PM
  a: function a(date, token) {
    var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? 'pm' : 'am';

    switch (token) {
      case 'a':
      case 'aa':
        return dayPeriodEnumValue.toUpperCase();

      case 'aaa':
        return dayPeriodEnumValue;

      case 'aaaaa':
        return dayPeriodEnumValue[0];

      case 'aaaa':
      default:
        return dayPeriodEnumValue === 'am' ? 'a.m.' : 'p.m.';
    }
  },
  // Hour [1-12]
  h: function h(date, token) {
    return addLeadingZeros(date.getUTCHours() % 12 || 12, token.length);
  },
  // Hour [0-23]
  H: function H(date, token) {
    return addLeadingZeros(date.getUTCHours(), token.length);
  },
  // Minute
  m: function m(date, token) {
    return addLeadingZeros(date.getUTCMinutes(), token.length);
  },
  // Second
  s: function s(date, token) {
    return addLeadingZeros(date.getUTCSeconds(), token.length);
  },
  // Fraction of second
  S: function S(date, token) {
    var numberOfDigits = token.length;
    var milliseconds = date.getUTCMilliseconds();
    var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
    return addLeadingZeros(fractionalSeconds, token.length);
  }
};
const formatters$3 = formatters$2;

var dayPeriodEnum = {
  am: 'am',
  pm: 'pm',
  midnight: 'midnight',
  noon: 'noon',
  morning: 'morning',
  afternoon: 'afternoon',
  evening: 'evening',
  night: 'night'
};

/*
 * |     | Unit                           |     | Unit                           |
 * |-----|--------------------------------|-----|--------------------------------|
 * |  a  | AM, PM                         |  A* | Milliseconds in day            |
 * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
 * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
 * |  d  | Day of month                   |  D  | Day of year                    |
 * |  e  | Local day of week              |  E  | Day of week                    |
 * |  f  |                                |  F* | Day of week in month           |
 * |  g* | Modified Julian day            |  G  | Era                            |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
 * |  i! | ISO day of week                |  I! | ISO week of year               |
 * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
 * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
 * |  l* | (deprecated)                   |  L  | Stand-alone month              |
 * |  m  | Minute                         |  M  | Month                          |
 * |  n  |                                |  N  |                                |
 * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
 * |  p! | Long localized time            |  P! | Long localized date            |
 * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
 * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
 * |  s  | Second                         |  S  | Fraction of second             |
 * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
 * |  u  | Extended year                  |  U* | Cyclic year                    |
 * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
 * |  w  | Local week of year             |  W* | Week of month                  |
 * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
 * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
 * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 *
 * Letters marked by ! are non-standard, but implemented by date-fns:
 * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
 * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
 *   i.e. 7 for Sunday, 1 for Monday, etc.
 * - `I` is ISO week of year, as opposed to `w` which is local week of year.
 * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
 *   `R` is supposed to be used in conjunction with `I` and `i`
 *   for universal ISO week-numbering date, whereas
 *   `Y` is supposed to be used in conjunction with `w` and `e`
 *   for week-numbering date specific to the locale.
 * - `P` is long localized date format
 * - `p` is long localized time format
 */
var formatters = {
  // Era
  G: function G(date, token, localize) {
    var era = date.getUTCFullYear() > 0 ? 1 : 0;

    switch (token) {
      // AD, BC
      case 'G':
      case 'GG':
      case 'GGG':
        return localize.era(era, {
          width: 'abbreviated'
        });
      // A, B

      case 'GGGGG':
        return localize.era(era, {
          width: 'narrow'
        });
      // Anno Domini, Before Christ

      case 'GGGG':
      default:
        return localize.era(era, {
          width: 'wide'
        });
    }
  },
  // Year
  y: function y(date, token, localize) {
    // Ordinal number
    if (token === 'yo') {
      var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

      var year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize.ordinalNumber(year, {
        unit: 'year'
      });
    }

    return formatters$3.y(date, token);
  },
  // Local week-numbering year
  Y: function Y(date, token, localize, options) {
    var signedWeekYear = getUTCWeekYear(date, options); // Returns 1 for 1 BC (which is year 0 in JavaScript)

    var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear; // Two digit year

    if (token === 'YY') {
      var twoDigitYear = weekYear % 100;
      return addLeadingZeros(twoDigitYear, 2);
    } // Ordinal number


    if (token === 'Yo') {
      return localize.ordinalNumber(weekYear, {
        unit: 'year'
      });
    } // Padding


    return addLeadingZeros(weekYear, token.length);
  },
  // ISO week-numbering year
  R: function R(date, token) {
    var isoWeekYear = getUTCISOWeekYear(date); // Padding

    return addLeadingZeros(isoWeekYear, token.length);
  },
  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function u(date, token) {
    var year = date.getUTCFullYear();
    return addLeadingZeros(year, token.length);
  },
  // Quarter
  Q: function Q(date, token, localize) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

    switch (token) {
      // 1, 2, 3, 4
      case 'Q':
        return String(quarter);
      // 01, 02, 03, 04

      case 'QQ':
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th

      case 'Qo':
        return localize.ordinalNumber(quarter, {
          unit: 'quarter'
        });
      // Q1, Q2, Q3, Q4

      case 'QQQ':
        return localize.quarter(quarter, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)

      case 'QQQQQ':
        return localize.quarter(quarter, {
          width: 'narrow',
          context: 'formatting'
        });
      // 1st quarter, 2nd quarter, ...

      case 'QQQQ':
      default:
        return localize.quarter(quarter, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Stand-alone quarter
  q: function q(date, token, localize) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

    switch (token) {
      // 1, 2, 3, 4
      case 'q':
        return String(quarter);
      // 01, 02, 03, 04

      case 'qq':
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th

      case 'qo':
        return localize.ordinalNumber(quarter, {
          unit: 'quarter'
        });
      // Q1, Q2, Q3, Q4

      case 'qqq':
        return localize.quarter(quarter, {
          width: 'abbreviated',
          context: 'standalone'
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)

      case 'qqqqq':
        return localize.quarter(quarter, {
          width: 'narrow',
          context: 'standalone'
        });
      // 1st quarter, 2nd quarter, ...

      case 'qqqq':
      default:
        return localize.quarter(quarter, {
          width: 'wide',
          context: 'standalone'
        });
    }
  },
  // Month
  M: function M(date, token, localize) {
    var month = date.getUTCMonth();

    switch (token) {
      case 'M':
      case 'MM':
        return formatters$3.M(date, token);
      // 1st, 2nd, ..., 12th

      case 'Mo':
        return localize.ordinalNumber(month + 1, {
          unit: 'month'
        });
      // Jan, Feb, ..., Dec

      case 'MMM':
        return localize.month(month, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // J, F, ..., D

      case 'MMMMM':
        return localize.month(month, {
          width: 'narrow',
          context: 'formatting'
        });
      // January, February, ..., December

      case 'MMMM':
      default:
        return localize.month(month, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Stand-alone month
  L: function L(date, token, localize) {
    var month = date.getUTCMonth();

    switch (token) {
      // 1, 2, ..., 12
      case 'L':
        return String(month + 1);
      // 01, 02, ..., 12

      case 'LL':
        return addLeadingZeros(month + 1, 2);
      // 1st, 2nd, ..., 12th

      case 'Lo':
        return localize.ordinalNumber(month + 1, {
          unit: 'month'
        });
      // Jan, Feb, ..., Dec

      case 'LLL':
        return localize.month(month, {
          width: 'abbreviated',
          context: 'standalone'
        });
      // J, F, ..., D

      case 'LLLLL':
        return localize.month(month, {
          width: 'narrow',
          context: 'standalone'
        });
      // January, February, ..., December

      case 'LLLL':
      default:
        return localize.month(month, {
          width: 'wide',
          context: 'standalone'
        });
    }
  },
  // Local week of year
  w: function w(date, token, localize, options) {
    var week = getUTCWeek(date, options);

    if (token === 'wo') {
      return localize.ordinalNumber(week, {
        unit: 'week'
      });
    }

    return addLeadingZeros(week, token.length);
  },
  // ISO week of year
  I: function I(date, token, localize) {
    var isoWeek = getUTCISOWeek(date);

    if (token === 'Io') {
      return localize.ordinalNumber(isoWeek, {
        unit: 'week'
      });
    }

    return addLeadingZeros(isoWeek, token.length);
  },
  // Day of the month
  d: function d(date, token, localize) {
    if (token === 'do') {
      return localize.ordinalNumber(date.getUTCDate(), {
        unit: 'date'
      });
    }

    return formatters$3.d(date, token);
  },
  // Day of year
  D: function D(date, token, localize) {
    var dayOfYear = getUTCDayOfYear(date);

    if (token === 'Do') {
      return localize.ordinalNumber(dayOfYear, {
        unit: 'dayOfYear'
      });
    }

    return addLeadingZeros(dayOfYear, token.length);
  },
  // Day of week
  E: function E(date, token, localize) {
    var dayOfWeek = date.getUTCDay();

    switch (token) {
      // Tue
      case 'E':
      case 'EE':
      case 'EEE':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // T

      case 'EEEEE':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'formatting'
        });
      // Tu

      case 'EEEEEE':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'formatting'
        });
      // Tuesday

      case 'EEEE':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Local day of week
  e: function e(date, token, localize, options) {
    var dayOfWeek = date.getUTCDay();
    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

    switch (token) {
      // Numerical value (Nth day of week with current locale or weekStartsOn)
      case 'e':
        return String(localDayOfWeek);
      // Padded numerical value

      case 'ee':
        return addLeadingZeros(localDayOfWeek, 2);
      // 1st, 2nd, ..., 7th

      case 'eo':
        return localize.ordinalNumber(localDayOfWeek, {
          unit: 'day'
        });

      case 'eee':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // T

      case 'eeeee':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'formatting'
        });
      // Tu

      case 'eeeeee':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'formatting'
        });
      // Tuesday

      case 'eeee':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Stand-alone local day of week
  c: function c(date, token, localize, options) {
    var dayOfWeek = date.getUTCDay();
    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

    switch (token) {
      // Numerical value (same as in `e`)
      case 'c':
        return String(localDayOfWeek);
      // Padded numerical value

      case 'cc':
        return addLeadingZeros(localDayOfWeek, token.length);
      // 1st, 2nd, ..., 7th

      case 'co':
        return localize.ordinalNumber(localDayOfWeek, {
          unit: 'day'
        });

      case 'ccc':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'standalone'
        });
      // T

      case 'ccccc':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'standalone'
        });
      // Tu

      case 'cccccc':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'standalone'
        });
      // Tuesday

      case 'cccc':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'standalone'
        });
    }
  },
  // ISO day of week
  i: function i(date, token, localize) {
    var dayOfWeek = date.getUTCDay();
    var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    switch (token) {
      // 2
      case 'i':
        return String(isoDayOfWeek);
      // 02

      case 'ii':
        return addLeadingZeros(isoDayOfWeek, token.length);
      // 2nd

      case 'io':
        return localize.ordinalNumber(isoDayOfWeek, {
          unit: 'day'
        });
      // Tue

      case 'iii':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // T

      case 'iiiii':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'formatting'
        });
      // Tu

      case 'iiiiii':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'formatting'
        });
      // Tuesday

      case 'iiii':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // AM or PM
  a: function a(date, token, localize) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';

    switch (token) {
      case 'a':
      case 'aa':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        });

      case 'aaa':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        }).toLowerCase();

      case 'aaaaa':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'narrow',
          context: 'formatting'
        });

      case 'aaaa':
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // AM, PM, midnight, noon
  b: function b(date, token, localize) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue;

    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';
    }

    switch (token) {
      case 'b':
      case 'bb':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        });

      case 'bbb':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        }).toLowerCase();

      case 'bbbbb':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'narrow',
          context: 'formatting'
        });

      case 'bbbb':
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // in the morning, in the afternoon, in the evening, at night
  B: function B(date, token, localize) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue;

    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }

    switch (token) {
      case 'B':
      case 'BB':
      case 'BBB':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        });

      case 'BBBBB':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'narrow',
          context: 'formatting'
        });

      case 'BBBB':
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Hour [1-12]
  h: function h(date, token, localize) {
    if (token === 'ho') {
      var hours = date.getUTCHours() % 12;
      if (hours === 0) hours = 12;
      return localize.ordinalNumber(hours, {
        unit: 'hour'
      });
    }

    return formatters$3.h(date, token);
  },
  // Hour [0-23]
  H: function H(date, token, localize) {
    if (token === 'Ho') {
      return localize.ordinalNumber(date.getUTCHours(), {
        unit: 'hour'
      });
    }

    return formatters$3.H(date, token);
  },
  // Hour [0-11]
  K: function K(date, token, localize) {
    var hours = date.getUTCHours() % 12;

    if (token === 'Ko') {
      return localize.ordinalNumber(hours, {
        unit: 'hour'
      });
    }

    return addLeadingZeros(hours, token.length);
  },
  // Hour [1-24]
  k: function k(date, token, localize) {
    var hours = date.getUTCHours();
    if (hours === 0) hours = 24;

    if (token === 'ko') {
      return localize.ordinalNumber(hours, {
        unit: 'hour'
      });
    }

    return addLeadingZeros(hours, token.length);
  },
  // Minute
  m: function m(date, token, localize) {
    if (token === 'mo') {
      return localize.ordinalNumber(date.getUTCMinutes(), {
        unit: 'minute'
      });
    }

    return formatters$3.m(date, token);
  },
  // Second
  s: function s(date, token, localize) {
    if (token === 'so') {
      return localize.ordinalNumber(date.getUTCSeconds(), {
        unit: 'second'
      });
    }

    return formatters$3.s(date, token);
  },
  // Fraction of second
  S: function S(date, token) {
    return formatters$3.S(date, token);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function X(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();

    if (timezoneOffset === 0) {
      return 'Z';
    }

    switch (token) {
      // Hours and optional minutes
      case 'X':
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`

      case 'XXXX':
      case 'XX':
        // Hours and minutes without `:` delimiter
        return formatTimezone(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`

      case 'XXXXX':
      case 'XXX': // Hours and minutes with `:` delimiter

      default:
        return formatTimezone(timezoneOffset, ':');
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function x(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();

    switch (token) {
      // Hours and optional minutes
      case 'x':
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`

      case 'xxxx':
      case 'xx':
        // Hours and minutes without `:` delimiter
        return formatTimezone(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`

      case 'xxxxx':
      case 'xxx': // Hours and minutes with `:` delimiter

      default:
        return formatTimezone(timezoneOffset, ':');
    }
  },
  // Timezone (GMT)
  O: function O(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();

    switch (token) {
      // Short
      case 'O':
      case 'OO':
      case 'OOO':
        return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
      // Long

      case 'OOOO':
      default:
        return 'GMT' + formatTimezone(timezoneOffset, ':');
    }
  },
  // Timezone (specific non-location)
  z: function z(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();

    switch (token) {
      // Short
      case 'z':
      case 'zz':
      case 'zzz':
        return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
      // Long

      case 'zzzz':
      default:
        return 'GMT' + formatTimezone(timezoneOffset, ':');
    }
  },
  // Seconds timestamp
  t: function t(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timestamp = Math.floor(originalDate.getTime() / 1000);
    return addLeadingZeros(timestamp, token.length);
  },
  // Milliseconds timestamp
  T: function T(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timestamp = originalDate.getTime();
    return addLeadingZeros(timestamp, token.length);
  }
};

function formatTimezoneShort(offset, dirtyDelimiter) {
  var sign = offset > 0 ? '-' : '+';
  var absOffset = Math.abs(offset);
  var hours = Math.floor(absOffset / 60);
  var minutes = absOffset % 60;

  if (minutes === 0) {
    return sign + String(hours);
  }

  var delimiter = dirtyDelimiter || '';
  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}

function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
  if (offset % 60 === 0) {
    var sign = offset > 0 ? '-' : '+';
    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
  }

  return formatTimezone(offset, dirtyDelimiter);
}

function formatTimezone(offset, dirtyDelimiter) {
  var delimiter = dirtyDelimiter || '';
  var sign = offset > 0 ? '-' : '+';
  var absOffset = Math.abs(offset);
  var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
  var minutes = addLeadingZeros(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}

const formatters$1 = formatters;

var dateLongFormatter = function dateLongFormatter(pattern, formatLong) {
  switch (pattern) {
    case 'P':
      return formatLong.date({
        width: 'short'
      });

    case 'PP':
      return formatLong.date({
        width: 'medium'
      });

    case 'PPP':
      return formatLong.date({
        width: 'long'
      });

    case 'PPPP':
    default:
      return formatLong.date({
        width: 'full'
      });
  }
};

var timeLongFormatter = function timeLongFormatter(pattern, formatLong) {
  switch (pattern) {
    case 'p':
      return formatLong.time({
        width: 'short'
      });

    case 'pp':
      return formatLong.time({
        width: 'medium'
      });

    case 'ppp':
      return formatLong.time({
        width: 'long'
      });

    case 'pppp':
    default:
      return formatLong.time({
        width: 'full'
      });
  }
};

var dateTimeLongFormatter = function dateTimeLongFormatter(pattern, formatLong) {
  var matchResult = pattern.match(/(P+)(p+)?/) || [];
  var datePattern = matchResult[1];
  var timePattern = matchResult[2];

  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong);
  }

  var dateTimeFormat;

  switch (datePattern) {
    case 'P':
      dateTimeFormat = formatLong.dateTime({
        width: 'short'
      });
      break;

    case 'PP':
      dateTimeFormat = formatLong.dateTime({
        width: 'medium'
      });
      break;

    case 'PPP':
      dateTimeFormat = formatLong.dateTime({
        width: 'long'
      });
      break;

    case 'PPPP':
    default:
      dateTimeFormat = formatLong.dateTime({
        width: 'full'
      });
      break;
  }

  return dateTimeFormat.replace('{{date}}', dateLongFormatter(datePattern, formatLong)).replace('{{time}}', timeLongFormatter(timePattern, formatLong));
};

var longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter
};
const longFormatters$1 = longFormatters;

var protectedDayOfYearTokens = ['D', 'DD'];
var protectedWeekYearTokens = ['YY', 'YYYY'];
function isProtectedDayOfYearToken(token) {
  return protectedDayOfYearTokens.indexOf(token) !== -1;
}
function isProtectedWeekYearToken(token) {
  return protectedWeekYearTokens.indexOf(token) !== -1;
}
function throwProtectedError(token, format, input) {
  if (token === 'YYYY') {
    throw new RangeError("Use `yyyy` instead of `YYYY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === 'YY') {
    throw new RangeError("Use `yy` instead of `YY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === 'D') {
    throw new RangeError("Use `d` instead of `D` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === 'DD') {
    throw new RangeError("Use `dd` instead of `DD` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  }
}

var formatDistanceLocale = {
  lessThanXSeconds: {
    one: 'less than a second',
    other: 'less than {{count}} seconds'
  },
  xSeconds: {
    one: '1 second',
    other: '{{count}} seconds'
  },
  halfAMinute: 'half a minute',
  lessThanXMinutes: {
    one: 'less than a minute',
    other: 'less than {{count}} minutes'
  },
  xMinutes: {
    one: '1 minute',
    other: '{{count}} minutes'
  },
  aboutXHours: {
    one: 'about 1 hour',
    other: 'about {{count}} hours'
  },
  xHours: {
    one: '1 hour',
    other: '{{count}} hours'
  },
  xDays: {
    one: '1 day',
    other: '{{count}} days'
  },
  aboutXWeeks: {
    one: 'about 1 week',
    other: 'about {{count}} weeks'
  },
  xWeeks: {
    one: '1 week',
    other: '{{count}} weeks'
  },
  aboutXMonths: {
    one: 'about 1 month',
    other: 'about {{count}} months'
  },
  xMonths: {
    one: '1 month',
    other: '{{count}} months'
  },
  aboutXYears: {
    one: 'about 1 year',
    other: 'about {{count}} years'
  },
  xYears: {
    one: '1 year',
    other: '{{count}} years'
  },
  overXYears: {
    one: 'over 1 year',
    other: 'over {{count}} years'
  },
  almostXYears: {
    one: 'almost 1 year',
    other: 'almost {{count}} years'
  }
};

var formatDistance = function formatDistance(token, count, options) {
  var result;
  var tokenValue = formatDistanceLocale[token];

  if (typeof tokenValue === 'string') {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace('{{count}}', count.toString());
  }

  if (options !== null && options !== void 0 && options.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return 'in ' + result;
    } else {
      return result + ' ago';
    }
  }

  return result;
};

const formatDistance$1 = formatDistance;

function buildFormatLongFn(args) {
  return function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // TODO: Remove String()
    var width = options.width ? String(options.width) : args.defaultWidth;
    var format = args.formats[width] || args.formats[args.defaultWidth];
    return format;
  };
}

var dateFormats = {
  full: 'EEEE, MMMM do, y',
  long: 'MMMM do, y',
  medium: 'MMM d, y',
  short: 'MM/dd/yyyy'
};
var timeFormats = {
  full: 'h:mm:ss a zzzz',
  long: 'h:mm:ss a z',
  medium: 'h:mm:ss a',
  short: 'h:mm a'
};
var dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: '{{date}}, {{time}}',
  short: '{{date}}, {{time}}'
};
var formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: 'full'
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: 'full'
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: 'full'
  })
};
const formatLong$1 = formatLong;

var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: 'P'
};

var formatRelative = function formatRelative(token, _date, _baseDate, _options) {
  return formatRelativeLocale[token];
};

const formatRelative$1 = formatRelative;

function buildLocalizeFn(args) {
  return function (dirtyIndex, options) {
    var context = options !== null && options !== void 0 && options.context ? String(options.context) : 'standalone';
    var valuesArray;

    if (context === 'formatting' && args.formattingValues) {
      var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      var width = options !== null && options !== void 0 && options.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      var _defaultWidth = args.defaultWidth;

      var _width = options !== null && options !== void 0 && options.width ? String(options.width) : args.defaultWidth;

      valuesArray = args.values[_width] || args.values[_defaultWidth];
    }

    var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex; // @ts-ignore: For some reason TypeScript just don't want to match it, no matter how hard we try. I challenge you to try to remove it!

    return valuesArray[index];
  };
}

var eraValues = {
  narrow: ['B', 'A'],
  abbreviated: ['BC', 'AD'],
  wide: ['Before Christ', 'Anno Domini']
};
var quarterValues = {
  narrow: ['1', '2', '3', '4'],
  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
  wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter']
}; // Note: in English, the names of days of the week and months are capitalized.
// If you are making a new locale based on this one, check if the same is true for the language you're working on.
// Generally, formatted dates should look like they are in the middle of a sentence,
// e.g. in Spanish language the weekdays and months should be in the lowercase.

var monthValues = {
  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};
var dayValues = {
  narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};
var dayPeriodValues = {
  narrow: {
    am: 'a',
    pm: 'p',
    midnight: 'mi',
    noon: 'n',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
  },
  abbreviated: {
    am: 'AM',
    pm: 'PM',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
  },
  wide: {
    am: 'a.m.',
    pm: 'p.m.',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: 'a',
    pm: 'p',
    midnight: 'mi',
    noon: 'n',
    morning: 'in the morning',
    afternoon: 'in the afternoon',
    evening: 'in the evening',
    night: 'at night'
  },
  abbreviated: {
    am: 'AM',
    pm: 'PM',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'in the morning',
    afternoon: 'in the afternoon',
    evening: 'in the evening',
    night: 'at night'
  },
  wide: {
    am: 'a.m.',
    pm: 'p.m.',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'in the morning',
    afternoon: 'in the afternoon',
    evening: 'in the evening',
    night: 'at night'
  }
};

var ordinalNumber = function ordinalNumber(dirtyNumber, _options) {
  var number = Number(dirtyNumber); // If ordinal numbers depend on context, for example,
  // if they are different for different grammatical genders,
  // use `options.unit`.
  //
  // `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
  // 'day', 'hour', 'minute', 'second'.

  var rem100 = number % 100;

  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + 'st';

      case 2:
        return number + 'nd';

      case 3:
        return number + 'rd';
    }
  }

  return number + 'th';
};

var localize = {
  ordinalNumber: ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: 'wide'
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: 'wide',
    argumentCallback: function argumentCallback(quarter) {
      return quarter - 1;
    }
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: 'wide'
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: 'wide'
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: 'wide',
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: 'wide'
  })
};
const localize$1 = localize;

function buildMatchFn(args) {
  return function (string) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var width = options.width;
    var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    var matchResult = string.match(matchPattern);

    if (!matchResult) {
      return null;
    }

    var matchedString = matchResult[0];
    var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    var key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, function (pattern) {
      return pattern.test(matchedString);
    }) : findKey(parsePatterns, function (pattern) {
      return pattern.test(matchedString);
    });
    var value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? options.valueCallback(value) : value;
    var rest = string.slice(matchedString.length);
    return {
      value: value,
      rest: rest
    };
  };
}

function findKey(object, predicate) {
  for (var key in object) {
    if (object.hasOwnProperty(key) && predicate(object[key])) {
      return key;
    }
  }

  return undefined;
}

function findIndex(array, predicate) {
  for (var key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }

  return undefined;
}

function buildMatchPatternFn(args) {
  return function (string) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var matchResult = string.match(args.matchPattern);
    if (!matchResult) return null;
    var matchedString = matchResult[0];
    var parseResult = string.match(args.parsePattern);
    if (!parseResult) return null;
    var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    var rest = string.slice(matchedString.length);
    return {
      value: value,
      rest: rest
    };
  };
}

var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
var parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
var parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
var parseMonthPatterns = {
  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
};
var matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
var parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
var matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
var match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: function valueCallback(value) {
      return parseInt(value, 10);
    }
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseEraPatterns,
    defaultParseWidth: 'any'
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: 'any',
    valueCallback: function valueCallback(index) {
      return index + 1;
    }
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: 'any'
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseDayPatterns,
    defaultParseWidth: 'any'
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: 'any',
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: 'any'
  })
};
const match$1 = match;

/**
 * @type {Locale}
 * @category Locales
 * @summary English locale (United States).
 * @language English
 * @iso-639-2 eng
 * @author Sasha Koss [@kossnocorp]{@link https://github.com/kossnocorp}
 * @author Lesha Koss [@leshakoss]{@link https://github.com/leshakoss}
 */
var locale = {
  code: 'en-US',
  formatDistance: formatDistance$1,
  formatLong: formatLong$1,
  formatRelative: formatRelative$1,
  localize: localize$1,
  match: match$1,
  options: {
    weekStartsOn: 0
    /* Sunday */
    ,
    firstWeekContainsDate: 1
  }
};
const defaultLocale = locale;

// - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
//   (one of the certain letters followed by `o`)
// - (\w)\1* matches any sequences of the same letter
// - '' matches two quote characters in a row
// - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
//   except a single quote symbol, which ends the sequence.
//   Two quote characters do not end the sequence.
//   If there is no matching single quote
//   then the sequence will continue until the end of the string.
// - . matches any single character unmatched by previous parts of the RegExps

var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g; // This RegExp catches symbols escaped by quotes, and also
// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`

var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
/**
 * @name format
 * @category Common Helpers
 * @summary Format the date.
 *
 * @description
 * Return the formatted date string in the given format. The result may vary by locale.
 *
 * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
 * > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * The characters wrapped between two single quotes characters (') are escaped.
 * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
 * (see the last example)
 *
 * Format of the string is based on Unicode Technical Standard #35:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * with a few additions (see note 7 below the table).
 *
 * Accepted patterns:
 * | Unit                            | Pattern | Result examples                   | Notes |
 * |---------------------------------|---------|-----------------------------------|-------|
 * | Era                             | G..GGG  | AD, BC                            |       |
 * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
 * |                                 | GGGGG   | A, B                              |       |
 * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
 * |                                 | yy      | 44, 01, 00, 17                    | 5     |
 * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
 * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
 * |                                 | yyyyy   | ...                               | 3,5   |
 * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
 * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
 * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
 * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
 * |                                 | YYYYY   | ...                               | 3,5   |
 * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
 * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
 * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
 * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
 * |                                 | RRRRR   | ...                               | 3,5,7 |
 * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
 * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
 * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
 * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
 * |                                 | uuuuu   | ...                               | 3,5   |
 * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
 * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | QQ      | 01, 02, 03, 04                    |       |
 * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
 * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
 * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | qq      | 01, 02, 03, 04                    |       |
 * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
 * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
 * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | MM      | 01, 02, ..., 12                   |       |
 * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
 * |                                 | MMMM    | January, February, ..., December  | 2     |
 * |                                 | MMMMM   | J, F, ..., D                      |       |
 * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
 * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | LL      | 01, 02, ..., 12                   |       |
 * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
 * |                                 | LLLL    | January, February, ..., December  | 2     |
 * |                                 | LLLLL   | J, F, ..., D                      |       |
 * | Local week of year              | w       | 1, 2, ..., 53                     |       |
 * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | ww      | 01, 02, ..., 53                   |       |
 * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
 * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | II      | 01, 02, ..., 53                   | 7     |
 * | Day of month                    | d       | 1, 2, ..., 31                     |       |
 * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
 * |                                 | dd      | 01, 02, ..., 31                   |       |
 * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
 * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
 * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
 * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
 * |                                 | DDDD    | ...                               | 3     |
 * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
 * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
 * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
 * |                                 | ii      | 01, 02, ..., 07                   | 7     |
 * |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
 * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
 * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
 * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 7     |
 * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
 * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | ee      | 02, 03, ..., 01                   |       |
 * |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
 * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
 * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | cc      | 02, 03, ..., 01                   |       |
 * |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
 * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | AM, PM                          | a..aa   | AM, PM                            |       |
 * |                                 | aaa     | am, pm                            |       |
 * |                                 | aaaa    | a.m., p.m.                        | 2     |
 * |                                 | aaaaa   | a, p                              |       |
 * | AM, PM, noon, midnight          | b..bb   | AM, PM, noon, midnight            |       |
 * |                                 | bbb     | am, pm, noon, midnight            |       |
 * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
 * |                                 | bbbbb   | a, p, n, mi                       |       |
 * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
 * |                                 | BBBB    | at night, in the morning, ...     | 2     |
 * |                                 | BBBBB   | at night, in the morning, ...     |       |
 * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
 * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
 * |                                 | hh      | 01, 02, ..., 11, 12               |       |
 * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
 * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
 * |                                 | HH      | 00, 01, 02, ..., 23               |       |
 * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
 * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
 * |                                 | KK      | 01, 02, ..., 11, 00               |       |
 * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
 * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
 * |                                 | kk      | 24, 01, 02, ..., 23               |       |
 * | Minute                          | m       | 0, 1, ..., 59                     |       |
 * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | mm      | 00, 01, ..., 59                   |       |
 * | Second                          | s       | 0, 1, ..., 59                     |       |
 * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | ss      | 00, 01, ..., 59                   |       |
 * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
 * |                                 | SS      | 00, 01, ..., 99                   |       |
 * |                                 | SSS     | 000, 001, ..., 999                |       |
 * |                                 | SSSS    | ...                               | 3     |
 * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
 * |                                 | XX      | -0800, +0530, Z                   |       |
 * |                                 | XXX     | -08:00, +05:30, Z                 |       |
 * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
 * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
 * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
 * |                                 | xx      | -0800, +0530, +0000               |       |
 * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
 * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
 * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
 * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
 * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
 * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
 * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
 * | Seconds timestamp               | t       | 512969520                         | 7     |
 * |                                 | tt      | ...                               | 3,7   |
 * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
 * |                                 | TT      | ...                               | 3,7   |
 * | Long localized date             | P       | 04/29/1453                        | 7     |
 * |                                 | PP      | Apr 29, 1453                      | 7     |
 * |                                 | PPP     | April 29th, 1453                  | 7     |
 * |                                 | PPPP    | Friday, April 29th, 1453          | 2,7   |
 * | Long localized time             | p       | 12:00 AM                          | 7     |
 * |                                 | pp      | 12:00:00 AM                       | 7     |
 * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
 * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
 * | Combination of date and time    | Pp      | 04/29/1453, 12:00 AM              | 7     |
 * |                                 | PPpp    | Apr 29, 1453, 12:00:00 AM         | 7     |
 * |                                 | PPPppp  | April 29th, 1453 at ...           | 7     |
 * |                                 | PPPPpppp| Friday, April 29th, 1453 at ...   | 2,7   |
 * Notes:
 * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
 *    are the same as "stand-alone" units, but are different in some languages.
 *    "Formatting" units are declined according to the rules of the language
 *    in the context of a date. "Stand-alone" units are always nominative singular:
 *
 *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
 *
 *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
 *
 * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
 *    the single quote characters (see below).
 *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
 *    the output will be the same as default pattern for this unit, usually
 *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
 *    are marked with "2" in the last column of the table.
 *
 *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
 *
 * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
 *    The output will be padded with zeros to match the length of the pattern.
 *
 *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
 *
 * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
 *    These tokens represent the shortest form of the quarter.
 *
 * 5. The main difference between `y` and `u` patterns are B.C. years:
 *
 *    | Year | `y` | `u` |
 *    |------|-----|-----|
 *    | AC 1 |   1 |   1 |
 *    | BC 1 |   1 |   0 |
 *    | BC 2 |   2 |  -1 |
 *
 *    Also `yy` always returns the last two digits of a year,
 *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
 *
 *    | Year | `yy` | `uu` |
 *    |------|------|------|
 *    | 1    |   01 |   01 |
 *    | 14   |   14 |   14 |
 *    | 376  |   76 |  376 |
 *    | 1453 |   53 | 1453 |
 *
 *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
 *    except local week-numbering years are dependent on `options.weekStartsOn`
 *    and `options.firstWeekContainsDate` (compare [getISOWeekYear]{@link https://date-fns.org/docs/getISOWeekYear}
 *    and [getWeekYear]{@link https://date-fns.org/docs/getWeekYear}).
 *
 * 6. Specific non-location timezones are currently unavailable in `date-fns`,
 *    so right now these tokens fall back to GMT timezones.
 *
 * 7. These patterns are not in the Unicode Technical Standard #35:
 *    - `i`: ISO day of week
 *    - `I`: ISO week of year
 *    - `R`: ISO week-numbering year
 *    - `t`: seconds timestamp
 *    - `T`: milliseconds timestamp
 *    - `o`: ordinal number modifier
 *    - `P`: long localized date
 *    - `p`: long localized time
 *
 * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
 *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * 9. `D` and `DD` tokens represent days of the year but they are often confused with days of the month.
 *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * @param {Date|Number} date - the original date
 * @param {String} format - the string of tokens
 * @param {Object} [options] - an object with options.
 * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
 * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
 * @param {Number} [options.firstWeekContainsDate=1] - the day of January, which is
 * @param {Boolean} [options.useAdditionalWeekYearTokens=false] - if true, allows usage of the week-numbering year tokens `YY` and `YYYY`;
 *   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @param {Boolean} [options.useAdditionalDayOfYearTokens=false] - if true, allows usage of the day of year tokens `D` and `DD`;
 *   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @returns {String} the formatted date string
 * @throws {TypeError} 2 arguments required
 * @throws {RangeError} `date` must not be Invalid Date
 * @throws {RangeError} `options.locale` must contain `localize` property
 * @throws {RangeError} `options.locale` must contain `formatLong` property
 * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
 * @throws {RangeError} `options.firstWeekContainsDate` must be between 1 and 7
 * @throws {RangeError} use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} format string contains an unescaped latin alphabet character
 *
 * @example
 * // Represent 11 February 2014 in middle-endian format:
 * const result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
 * //=> '02/11/2014'
 *
 * @example
 * // Represent 2 July 2014 in Esperanto:
 * import { eoLocale } from 'date-fns/locale/eo'
 * const result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
 *   locale: eoLocale
 * })
 * //=> '2-a de julio 2014'
 *
 * @example
 * // Escape string by single quote characters:
 * const result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
 * //=> "3 o'clock"
 */

function format(dirtyDate, dirtyFormatStr, options) {
  var _ref, _options$locale, _ref2, _ref3, _ref4, _options$firstWeekCon, _options$locale2, _options$locale2$opti, _defaultOptions$local, _defaultOptions$local2, _ref5, _ref6, _ref7, _options$weekStartsOn, _options$locale3, _options$locale3$opti, _defaultOptions$local3, _defaultOptions$local4;

  requiredArgs(2, arguments);
  var formatStr = String(dirtyFormatStr);
  var defaultOptions = getDefaultOptions();
  var locale = (_ref = (_options$locale = options === null || options === void 0 ? void 0 : options.locale) !== null && _options$locale !== void 0 ? _options$locale : defaultOptions.locale) !== null && _ref !== void 0 ? _ref : defaultLocale;
  var firstWeekContainsDate = toInteger((_ref2 = (_ref3 = (_ref4 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale2 = options.locale) === null || _options$locale2 === void 0 ? void 0 : (_options$locale2$opti = _options$locale2.options) === null || _options$locale2$opti === void 0 ? void 0 : _options$locale2$opti.firstWeekContainsDate) !== null && _ref4 !== void 0 ? _ref4 : defaultOptions.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : 1); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  }

  var weekStartsOn = toInteger((_ref5 = (_ref6 = (_ref7 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale3 = options.locale) === null || _options$locale3 === void 0 ? void 0 : (_options$locale3$opti = _options$locale3.options) === null || _options$locale3$opti === void 0 ? void 0 : _options$locale3$opti.weekStartsOn) !== null && _ref7 !== void 0 ? _ref7 : defaultOptions.weekStartsOn) !== null && _ref6 !== void 0 ? _ref6 : (_defaultOptions$local3 = defaultOptions.locale) === null || _defaultOptions$local3 === void 0 ? void 0 : (_defaultOptions$local4 = _defaultOptions$local3.options) === null || _defaultOptions$local4 === void 0 ? void 0 : _defaultOptions$local4.weekStartsOn) !== null && _ref5 !== void 0 ? _ref5 : 0); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  }

  if (!locale.localize) {
    throw new RangeError('locale must contain localize property');
  }

  if (!locale.formatLong) {
    throw new RangeError('locale must contain formatLong property');
  }

  var originalDate = toDate(dirtyDate);

  if (!isValid(originalDate)) {
    throw new RangeError('Invalid time value');
  } // Convert the date in system timezone to the same date in UTC+00:00 timezone.
  // This ensures that when UTC functions will be implemented, locales will be compatible with them.
  // See an issue about UTC functions: https://github.com/date-fns/date-fns/issues/376


  var timezoneOffset = getTimezoneOffsetInMilliseconds(originalDate);
  var utcDate = subMilliseconds(originalDate, timezoneOffset);
  var formatterOptions = {
    firstWeekContainsDate: firstWeekContainsDate,
    weekStartsOn: weekStartsOn,
    locale: locale,
    _originalDate: originalDate
  };
  var result = formatStr.match(longFormattingTokensRegExp).map(function (substring) {
    var firstCharacter = substring[0];

    if (firstCharacter === 'p' || firstCharacter === 'P') {
      var longFormatter = longFormatters$1[firstCharacter];
      return longFormatter(substring, locale.formatLong);
    }

    return substring;
  }).join('').match(formattingTokensRegExp).map(function (substring) {
    // Replace two single quote characters with one single quote character
    if (substring === "''") {
      return "'";
    }

    var firstCharacter = substring[0];

    if (firstCharacter === "'") {
      return cleanEscapedString(substring);
    }

    var formatter = formatters$1[firstCharacter];

    if (formatter) {
      if (!(options !== null && options !== void 0 && options.useAdditionalWeekYearTokens) && isProtectedWeekYearToken(substring)) {
        throwProtectedError(substring, dirtyFormatStr, String(dirtyDate));
      }

      if (!(options !== null && options !== void 0 && options.useAdditionalDayOfYearTokens) && isProtectedDayOfYearToken(substring)) {
        throwProtectedError(substring, dirtyFormatStr, String(dirtyDate));
      }

      return formatter(utcDate, substring, locale.localize, formatterOptions);
    }

    if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
      throw new RangeError('Format string contains an unescaped latin alphabet character `' + firstCharacter + '`');
    }

    return substring;
  }).join('');
  return result;
}

function cleanEscapedString(input) {
  var matched = input.match(escapedStringRegExp);

  if (!matched) {
    return input;
  }

  return matched[1].replace(doubleQuoteRegExp, "'");
}

const createIntervalStore = (duration) => readable(new Date(), (setTime) => {
  let interval = setInterval(() => setTime(new Date()), duration);
  return () => clearInterval(interval);
});

/* src/svelte/components/TopBar/TopBarTime.svelte generated by Svelte v3.53.1 */

function create_fragment$7(ctx) {
	let div;
	let t0_value = format(/*$time*/ ctx[0], 'EEE MMM dd') + "";
	let t0;
	let t1;
	let t2_value = format(/*$time*/ ctx[0], 'h:mm aa') + "";
	let t2;

	return {
		c() {
			div = element("div");
			t0 = text(t0_value);
			t1 = text("  ");
			t2 = text(t2_value);
			set_style(div, "margin", `0 0.5rem`);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t0);
			append(div, t1);
			append(div, t2);
		},
		p(ctx, [dirty]) {
			if (dirty & /*$time*/ 1 && t0_value !== (t0_value = format(/*$time*/ ctx[0], 'EEE MMM dd') + "")) set_data(t0, t0_value);
			if (dirty & /*$time*/ 1 && t2_value !== (t2_value = format(/*$time*/ ctx[0], 'h:mm aa') + "")) set_data(t2, t2_value);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function instance$7($$self, $$props, $$invalidate) {
	let $time;
	const time = createIntervalStore(1000);
	component_subscribe($$self, time, value => $$invalidate(0, $time = value));
	return [$time, time];
}

class TopBarTime extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});
	}
}

const TopBar_svelte_svelte_type_style_lang = '';

/* src/svelte/components/TopBar/TopBar.svelte generated by Svelte v3.53.1 */

function create_if_block$3(ctx) {
	let div;
	let div_intro;
	let div_outro;
	let current;

	return {
		c() {
			div = element("div");
			div.innerHTML = `<span class="svelte-1ps6uxz"><img src="/emojis/wink.png" alt="Wink emoji" class="emoji svelte-1ps6uxz"/></span>`;
			attr(div, "class", "notch svelte-1ps6uxz");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			current = true;
		},
		i(local) {
			if (current) return;

			add_render_callback(() => {
				if (div_outro) div_outro.end(1);
				div_intro = create_in_transition(div, fadeIn, {});
				div_intro.start();
			});

			current = true;
		},
		o(local) {
			if (div_intro) div_intro.invalidate();
			div_outro = create_out_transition(div, fadeOut, {});
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (detaching && div_outro) div_outro.end();
		}
	};
}

function create_fragment$6(ctx) {
	let header;
	let menubar;
	let t0;
	let span;
	let t1;
	let t2;
	let actioncentertoggle;
	let t3;
	let button;
	let topbartime;
	let current;
	menubar = new MenuBar({});
	let if_block = /*$shouldShowNotch*/ ctx[0] && create_if_block$3();
	actioncentertoggle = new ActionCenterToggle({});
	topbartime = new TopBarTime({});

	return {
		c() {
			header = element("header");
			create_component(menubar.$$.fragment);
			t0 = space();
			span = element("span");
			t1 = space();
			if (if_block) if_block.c();
			t2 = space();
			create_component(actioncentertoggle.$$.fragment);
			t3 = space();
			button = element("button");
			create_component(topbartime.$$.fragment);
			set_style(span, "flex", `1 1 auto`);
			attr(button, "class", "svelte-1ps6uxz");
			attr(header, "class", "svelte-1ps6uxz");
		},
		m(target, anchor) {
			insert(target, header, anchor);
			mount_component(menubar, header, null);
			append(header, t0);
			append(header, span);
			append(header, t1);
			if (if_block) if_block.m(header, null);
			append(header, t2);
			mount_component(actioncentertoggle, header, null);
			append(header, t3);
			append(header, button);
			mount_component(topbartime, button, null);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*$shouldShowNotch*/ ctx[0]) {
				if (if_block) {
					if (dirty & /*$shouldShowNotch*/ 1) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$3();
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(header, t2);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(menubar.$$.fragment, local);
			transition_in(if_block);
			transition_in(actioncentertoggle.$$.fragment, local);
			transition_in(topbartime.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(menubar.$$.fragment, local);
			transition_out(if_block);
			transition_out(actioncentertoggle.$$.fragment, local);
			transition_out(topbartime.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(header);
			destroy_component(menubar);
			if (if_block) if_block.d();
			destroy_component(actioncentertoggle);
			destroy_component(topbartime);
		}
	};
}

function instance$6($$self, $$props, $$invalidate) {
	let $shouldShowNotch;
	component_subscribe($$self, shouldShowNotch, $$value => $$invalidate(0, $shouldShowNotch = $$value));
	return [$shouldShowNotch];
}

class TopBar extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});
	}
}

function smallerClosestValue(arr, value) {
  let prevVal = arr[0];
  for (const val of arr) {
    if (val > value)
      return prevVal;
    if (val == value)
      return val;
    prevVal = val;
  }
  return arr[arr.length - 1];
}

const Wallpaper_svelte_svelte_type_style_lang = '';

/* src/svelte/components/apps/WallpaperApp/Wallpaper.svelte generated by Svelte v3.53.1 */

function get_each_context$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[8] = list[i].thumbnail;
	return child_ctx;
}

// (65:2) {#each Object.values(wallpapersConfig) as { thumbnail }}
function create_each_block$2(ctx) {
	let link;

	return {
		c() {
			link = element("link");
			attr(link, "rel", "prefetch");
			attr(link, "href", /*thumbnail*/ ctx[8]);
		},
		m(target, anchor) {
			insert(target, link, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(link);
		}
	};
}

function create_fragment$5(ctx) {
	let each_1_anchor;
	let t0;
	let img;
	let img_src_value;
	let t1;
	let div;
	let style_background_image = `url(${/*visibleBackgroundImage*/ ctx[1]})`;
	let mounted;
	let dispose;
	let each_value = Object.values(wallpapersConfig);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
			t0 = space();
			img = element("img");
			t1 = space();
			div = element("div");
			if (!src_url_equal(img.src, img_src_value = /*$wallpaper*/ ctx[0].image)) attr(img, "src", img_src_value);
			attr(img, "aria-hidden", "true");
			attr(img, "alt", "");
			attr(img, "class", "svelte-o9ymqv");
			attr(div, "class", "background-cover svelte-o9ymqv");
			set_style(div, "background-image", style_background_image);
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(document.head, null);
			}

			append(document.head, each_1_anchor);
			insert(target, t0, anchor);
			insert(target, img, anchor);
			insert(target, t1, anchor);
			insert(target, div, anchor);

			if (!mounted) {
				dispose = [
					listen(img, "load", /*previewImageOnLoad*/ ctx[3]),
					action_destroyer(elevation.call(null, div, 'wallpaper'))
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*Object, wallpapersConfig*/ 0) {
				each_value = Object.values(wallpapersConfig);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (dirty & /*$wallpaper*/ 1 && !src_url_equal(img.src, img_src_value = /*$wallpaper*/ ctx[0].image)) {
				attr(img, "src", img_src_value);
			}

			if (dirty & /*visibleBackgroundImage*/ 2 && style_background_image !== (style_background_image = `url(${/*visibleBackgroundImage*/ ctx[1]})`)) {
				set_style(div, "background-image", style_background_image);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			destroy_each(each_blocks, detaching);
			detach(each_1_anchor);
			if (detaching) detach(t0);
			if (detaching) detach(img);
			if (detaching) detach(t1);
			if (detaching) detach(div);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$5($$self, $$props, $$invalidate) {
	let $wallpaper;
	let $theme;
	let $interval;
	component_subscribe($$self, wallpaper, $$value => $$invalidate(0, $wallpaper = $$value));
	component_subscribe($$self, theme, $$value => $$invalidate(5, $theme = $$value));
	let visibleBackgroundImage = wallpapersConfig.ventura.thumbnail;
	const interval = createIntervalStore(5 * 1000);
	component_subscribe($$self, interval, value => $$invalidate(4, $interval = value));

	function handleWallpaper() {
		const date = new Date();
		const hour = date.getHours();
		const wallpaperTimestampsMap = wallpapersConfig[$wallpaper.id].timestamps.wallpaper;
		const timestamps = Object.keys(wallpaperTimestampsMap);
		const minTimestamp = Math.min(...timestamps);
		const maxTimestamp = Math.max(...timestamps);

		if (hour > maxTimestamp || hour < minTimestamp) {
			// Go for the min timestamp value
			if (wallpaperTimestampsMap[maxTimestamp]) {
				set_store_value(wallpaper, $wallpaper.image = wallpaperTimestampsMap[maxTimestamp], $wallpaper);
			}

			return;
		}

		// Now set the right timestamp
		const chosenTimeStamp = smallerClosestValue(timestamps, hour);

		if (wallpaperTimestampsMap[chosenTimeStamp]) {
			set_store_value(wallpaper, $wallpaper.image = wallpaperTimestampsMap[chosenTimeStamp], $wallpaper);
		}
	}

	function handleTheme() {
		if (!$wallpaper.canControlTheme) return;
		const date = new Date();
		const hour = date.getHours();
		const themeTimestampsMap = wallpapersConfig[$wallpaper.id].timestamps.theme;
		const timestamps = Object.keys(themeTimestampsMap);
		const minTimestamp = Math.min(...timestamps);
		const maxTimestamp = Math.max(...timestamps);

		if (hour > maxTimestamp || hour < minTimestamp) {
			// Go for the min timestamp value
			set_store_value(theme, $theme.scheme = 'dark', $theme);

			return;
		}

		// Now set the right timestamp
		const chosenTimeStamp = smallerClosestValue(timestamps, hour);

		set_store_value(theme, $theme.scheme = themeTimestampsMap?.[chosenTimeStamp] || 'light', $theme);
	}

	function previewImageOnLoad() {
		$$invalidate(1, visibleBackgroundImage = $wallpaper.image);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$interval, $wallpaper*/ 17) {
			$: {

				if (wallpapersConfig[$wallpaper.id].type === 'standalone') {
					set_store_value(wallpaper, $wallpaper.image = wallpapersConfig[$wallpaper.id].thumbnail, $wallpaper);
					break $;
				}

				/** Only dynamic and light/dark wallpaper logic to tackle */
				// Now check if user really wants the change to happen.
				handleTheme();

				handleWallpaper();
			}
		}
	};

	return [$wallpaper, visibleBackgroundImage, interval, previewImageOnLoad, $interval];
}

class Wallpaper extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});
	}
}

const waitFor = (time) => new Promise((res) => setTimeout(res, time));

const BootupScreen_svelte_svelte_type_style_lang = '';

/* src/svelte/components/Desktop/BootupScreen.svelte generated by Svelte v3.53.1 */

function create_if_block$2(ctx) {
	let div2;
	let img;
	let img_src_value;
	let t;
	let div1;
	let div0;
	let style_transform = `translateX(-${/*$progressVal*/ ctx[1]}%)`;
	let div1_aria_valuenow_value;
	let div2_outro;
	let current;
	let mounted;
	let dispose;

	return {
		c() {
			div2 = element("div");
			img = element("img");
			t = space();
			div1 = element("div");
			div0 = element("div");
			attr(img, "alt", "start");
			attr(img, "class", "darkmode-invert");
			if (!src_url_equal(img.src, img_src_value = appIcon['start'])) attr(img, "src", img_src_value);
			attr(div0, "class", "indicator svelte-hbc6yw");
			set_style(div0, "transform", style_transform);
			attr(div1, "class", "progress svelte-hbc6yw");
			attr(div1, "role", "progressbar");
			attr(div1, "aria-valuenow", div1_aria_valuenow_value = 100 - /*$progressVal*/ ctx[1]);
			attr(div1, "aria-valuemin", 0);
			attr(div1, "aria-valuemax", 100);
			attr(div1, "aria-valuetext", "Loading up macOS Web");
			attr(div2, "class", "splash-screen svelte-hbc6yw");
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, img);
			append(div2, t);
			append(div2, div1);
			append(div1, div0);
			current = true;

			if (!mounted) {
				dispose = action_destroyer(elevation.call(null, div2, 'bootup-screen'));
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*$progressVal*/ 2 && style_transform !== (style_transform = `translateX(-${/*$progressVal*/ ctx[1]}%)`)) {
				set_style(div0, "transform", style_transform);
			}

			if (!current || dirty & /*$progressVal*/ 2 && div1_aria_valuenow_value !== (div1_aria_valuenow_value = 100 - /*$progressVal*/ ctx[1])) {
				attr(div1, "aria-valuenow", div1_aria_valuenow_value);
			}
		},
		i(local) {
			if (current) return;
			if (div2_outro) div2_outro.end(1);
			current = true;
		},
		o(local) {
			div2_outro = create_out_transition(div2, fadeOut, { duration: 500 });
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div2);
			if (detaching && div2_outro) div2_outro.end();
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$4(ctx) {
	let if_block_anchor;
	let current;
	let if_block = !(/*hiddenSplashScreen*/ ctx[0] || false) && create_if_block$2(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (!(/*hiddenSplashScreen*/ ctx[0] || false)) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*hiddenSplashScreen*/ 1) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$2(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$4($$self, $$props, $$invalidate) {
	let $progressVal;
	let hiddenSplashScreen = false;
	let progressVal = tweened(100, { duration: 3000, easing: quintInOut });
	component_subscribe($$self, progressVal, value => $$invalidate(1, $progressVal = value));

	onMount(async () => {
		set_store_value(progressVal, $progressVal = 0, $progressVal);
		await waitFor(3000);
		$$invalidate(0, hiddenSplashScreen = true);
	});

	return [hiddenSplashScreen, $progressVal, progressVal];
}

class BootupScreen extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});
	}
}

const contextMenuConfig = {
  default: {
    "new-folder": {
      title: "New Folder",
      breakAfter: true
    },
    "get-info": {
      title: "Get Info",
      breakAfter: false
    },
    "change-desktop-bg": {
      title: "Change Desktop Background",
      breakAfter: true
    },
    "use-stacks": {
      title: "Use Stacks",
      breakAfter: false
    },
    "sort-by": {
      title: "Sort By",
      breakAfter: false
    },
    "clean-up": {
      title: "Clean Up",
      breakAfter: false
    },
    "clean-up-by": {
      title: "Clean Up By",
      breakAfter: false
    },
    "show-view-options": {
      title: "Show View Options",
      breakAfter: false
    }
  }
};

const ContextMenu_svelte_svelte_type_style_lang = '';

/* src/svelte/components/Desktop/ContextMenu.svelte generated by Svelte v3.53.1 */

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[7] = list[i];
	return child_ctx;
}

// (30:0) {#if isMenuVisible}
function create_if_block$1(ctx) {
	let div;
	let div_outro;
	let style_transform = `translate(${/*xPos*/ ctx[0]}px, ${/*yPos*/ ctx[1]}px)`;
	let current;
	let mounted;
	let dispose;
	let each_value = Object.values(contextMenuConfig.default);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "container svelte-15fvump");
			toggle_class(div, "dark", /*$theme*/ ctx[3].scheme === 'dark');
			set_style(div, "transform", style_transform);
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;

			if (!mounted) {
				dispose = action_destroyer(elevation.call(null, div, 'context-menu'));
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*Object, contextMenuConfig*/ 0) {
				each_value = Object.values(contextMenuConfig.default);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (!current || dirty & /*$theme*/ 8) {
				toggle_class(div, "dark", /*$theme*/ ctx[3].scheme === 'dark');
			}

			if (dirty & /*xPos, yPos*/ 3 && style_transform !== (style_transform = `translate(${/*xPos*/ ctx[0]}px, ${/*yPos*/ ctx[1]}px)`)) {
				set_style(div, "transform", style_transform);
			}
		},
		i(local) {
			if (current) return;
			if (div_outro) div_outro.end(1);
			current = true;
		},
		o(local) {
			div_outro = create_out_transition(div, fadeOut, {});
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_each(each_blocks, detaching);
			if (detaching && div_outro) div_outro.end();
			mounted = false;
			dispose();
		}
	};
}

// (41:6) {#if contents.breakAfter}
function create_if_block_1(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			attr(div, "class", "divider svelte-15fvump");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (38:4) {#each Object.values(contextMenuConfig.default) as contents}
function create_each_block$1(ctx) {
	let button;
	let t0_value = /*contents*/ ctx[7].title + "";
	let t0;
	let t1;
	let if_block_anchor;
	let if_block = /*contents*/ ctx[7].breakAfter && create_if_block_1();

	return {
		c() {
			button = element("button");
			t0 = text(t0_value);
			t1 = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			attr(button, "class", "menu-item svelte-15fvump");
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t0);
			insert(target, t1, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(button);
			if (detaching) detach(t1);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function create_fragment$3(ctx) {
	let t;
	let if_block_anchor;
	let current;
	let mounted;
	let dispose;
	let if_block = /*isMenuVisible*/ ctx[2] && create_if_block$1(ctx);

	return {
		c() {
			t = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			insert(target, t, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;

			if (!mounted) {
				dispose = [
					listen(document.body, "contextmenu", prevent_default(/*handleContextMenu*/ ctx[4])),
					listen(document.body, "click", /*hideMenu*/ ctx[5])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (/*isMenuVisible*/ ctx[2]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*isMenuVisible*/ 4) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(t);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	let $theme;
	component_subscribe($$self, theme, $$value => $$invalidate(3, $theme = $$value));
	let { targetElement } = $$props;
	let xPos = 0;
	let yPos = 0;
	let isMenuVisible = false;

	function handleContextMenu(e) {
		if (!targetElement?.contains(e.target)) return $$invalidate(2, isMenuVisible = false);
		let x = e.pageX;
		let y = e.pageY;

		// Open to other side if rest of space is too small
		if (window.innerWidth - x < 250) x -= 250;

		if (window.innerHeight - y < 300) y -= 250;
		$$invalidate(0, xPos = x);
		$$invalidate(1, yPos = y);
		$$invalidate(2, isMenuVisible = true);
	}

	function hideMenu() {
		$$invalidate(2, isMenuVisible = false);
	}

	$$self.$$set = $$props => {
		if ('targetElement' in $$props) $$invalidate(6, targetElement = $$props.targetElement);
	};

	return [xPos, yPos, isMenuVisible, $theme, handleContextMenu, hideMenu, targetElement];
}

class ContextMenu extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$3, create_fragment$3, safe_not_equal, { targetElement: 6 });
	}
}

const scriptRel = 'modulepreload';const assetsURL = function(dep) { return "/"+dep };const seen = {};const __vitePreload = function preload(baseModule, deps, importerUrl) {
    // @ts-ignore
    if (!true || !deps || deps.length === 0) {
        return baseModule();
    }
    return Promise.all(deps.map((dep) => {
        // @ts-ignore
        dep = assetsURL(dep);
        // @ts-ignore
        if (dep in seen)
            return;
        // @ts-ignore
        seen[dep] = true;
        const isCss = dep.endsWith('.css');
        const cssSelector = isCss ? '[rel="stylesheet"]' : '';
        // @ts-ignore check if the file is already preloaded by SSR markup
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
            return;
        }
        // @ts-ignore
        const link = document.createElement('link');
        // @ts-ignore
        link.rel = isCss ? 'stylesheet' : scriptRel;
        if (!isCss) {
            link.as = 'script';
            link.crossOrigin = '';
        }
        link.href = dep;
        // @ts-ignore
        document.head.appendChild(link);
        if (isCss) {
            return new Promise((res, rej) => {
                link.addEventListener('load', res);
                link.addEventListener('error', () => rej(new Error(`Unable to preload CSS for ${dep}`)));
            });
        }
    })).then(() => baseModule());
};

function registerSW(options = {}) {
  const {
    immediate = false,
    onNeedRefresh,
    onOfflineReady,
    onRegistered,
    onRegisteredSW,
    onRegisterError
  } = options;
  let wb;
  let registration;
  let registerPromise;
  let sendSkipWaitingMessage;
  const updateServiceWorker = async (reloadPage = true) => {
    await registerPromise;
    {
      if (reloadPage) {
        wb == null ? void 0 : wb.addEventListener("controlling", (event) => {
          if (event.isUpdate)
            window.location.reload();
        });
      }
      await (sendSkipWaitingMessage == null ? void 0 : sendSkipWaitingMessage());
    }
  };
  async function register() {
    if ("serviceWorker" in navigator) {
      const { Workbox, messageSW } = await __vitePreload(() => import('./workbox-window.prod.es5.js'),true?[]:void 0);
      sendSkipWaitingMessage = async () => {
        if (registration && registration.waiting) {
          await messageSW(registration.waiting, { type: "SKIP_WAITING" });
        }
      };
      wb = new Workbox("/sw.js", { scope: "/", type: "classic" });
      wb.addEventListener("activated", (event) => {
        if (event.isUpdate)
          ;
        else onOfflineReady == null ? void 0 : onOfflineReady();
      });
      {
        const showSkipWaitingPrompt = () => {
          onNeedRefresh == null ? void 0 : onNeedRefresh();
        };
        wb.addEventListener("waiting", showSkipWaitingPrompt);
        wb.addEventListener("externalwaiting", showSkipWaitingPrompt);
      }
      wb.register({ immediate }).then((r) => {
        registration = r;
        if (onRegisteredSW)
          onRegisteredSW("/sw.js", r);
        else
          onRegistered == null ? void 0 : onRegistered(r);
      }).catch((e) => {
        onRegisterError == null ? void 0 : onRegisterError(e);
      });
    }
  }
  registerPromise = register();
  return updateServiceWorker;
}

// src/client/build/svelte.ts
function useRegisterSW(options = {}) {
  const {
    immediate = true,
    onNeedRefresh,
    onOfflineReady,
    onRegistered,
    onRegisteredSW,
    onRegisterError
  } = options;
  const needRefresh = writable$1(false);
  const offlineReady = writable$1(false);
  const updateServiceWorker = registerSW({
    immediate,
    onOfflineReady() {
      offlineReady.set(true);
      onOfflineReady == null ? void 0 : onOfflineReady();
    },
    onNeedRefresh() {
      needRefresh.set(true);
      onNeedRefresh == null ? void 0 : onNeedRefresh();
    },
    onRegistered,
    onRegisteredSW,
    onRegisterError
  });
  return {
    needRefresh,
    offlineReady,
    updateServiceWorker
  };
}

const SystemUpdate_svelte_svelte_type_style_lang = '';

/* src/svelte/components/Desktop/SystemUpdate.svelte generated by Svelte v3.53.1 */

function create_default_slot(ctx) {
	let section;
	let img;
	let img_src_value;
	let t0;
	let h3;
	let t2;
	let p;
	let t4;
	let div;
	let button0;
	let t6;
	let button1;
	let mounted;
	let dispose;

	return {
		c() {
			section = element("section");
			img = element("img");
			t0 = space();
			h3 = element("h3");
			h3.textContent = "Updates Available";
			t2 = space();
			p = element("p");
			p.textContent = "Do you want to restart to install these updates now?";
			t4 = space();
			div = element("div");
			button0 = element("button");
			button0.textContent = "Later";
			t6 = space();
			button1 = element("button");
			button1.textContent = "Update";
			attr(img, "width", "128");
			attr(img, "height", "128");
			if (!src_url_equal(img.src, img_src_value = "/app-icons/system-preferences/256.webp")) attr(img, "src", img_src_value);
			attr(img, "alt", "AppStore app");
			attr(img, "draggable", "false");
			attr(h3, "class", "svelte-1smtkur");
			attr(p, "class", "svelte-1smtkur");
			attr(button0, "class", "svelte-1smtkur");
			attr(button1, "class", "confirm svelte-1smtkur");
			attr(div, "class", "buttons svelte-1smtkur");
			attr(section, "class", "system-update-section svelte-1smtkur");
		},
		m(target, anchor) {
			insert(target, section, anchor);
			append(section, img);
			append(section, t0);
			append(section, h3);
			append(section, t2);
			append(section, p);
			append(section, t4);
			append(section, div);
			append(div, button0);
			append(div, t6);
			append(div, button1);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*close*/ ctx[2]),
					listen(button1, "click", /*handleUpdateApp*/ ctx[3])
				];

				mounted = true;
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(section);
			mounted = false;
			run_all(dispose);
		}
	};
}

function create_fragment$2(ctx) {
	let systemdialog;
	let t0;
	let div;
	let current;

	let systemdialog_props = {
		$$slots: { default: [create_default_slot] },
		$$scope: { ctx }
	};

	systemdialog = new SystemDialog({ props: systemdialog_props });
	/*systemdialog_binding*/ ctx[5](systemdialog);

	return {
		c() {
			create_component(systemdialog.$$.fragment);
			t0 = space();
			div = element("div");
			div.textContent = `${buildDate}`;
			attr(div, "class", "pwa-date svelte-1smtkur");
		},
		m(target, anchor) {
			mount_component(systemdialog, target, anchor);
			insert(target, t0, anchor);
			insert(target, div, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const systemdialog_changes = {};

			if (dirty & /*$$scope*/ 256) {
				systemdialog_changes.$$scope = { dirty, ctx };
			}

			systemdialog.$set(systemdialog_changes);
		},
		i(local) {
			if (current) return;
			transition_in(systemdialog.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(systemdialog.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			/*systemdialog_binding*/ ctx[5](null);
			destroy_component(systemdialog, detaching);
			if (detaching) detach(t0);
			if (detaching) detach(div);
		}
	};
}

const buildDate = '2022-12-01T08:51:15.264Z';

function instance$2($$self, $$props, $$invalidate) {
	let $needRefresh;
	let $systemNeedsUpdate;
	component_subscribe($$self, systemNeedsUpdate, $$value => $$invalidate(6, $systemNeedsUpdate = $$value));
	let systemUpdateDialog;

	// Will store the update event, so we can use this value on AppStore to show the badge.
	// If the user click on Later instead Restart, the dialog is closed but the update is still there.
	// We don't need to store it on localStorage since the new sw is on skip waiting state, and so
	// a refresh or reopening the browser will prompt again the dialog to restart.
	// Once updateServiceWorker is called, there is a full reload, so the app will be loaded again.
	const { needRefresh, updateServiceWorker } = useRegisterSW({
		onRegistered(swr) {
			console.log(`SW registered: ${swr}`);
		},
		onRegisterError(error) {
			console.log('SW registration error', error);
		}
	});

	component_subscribe($$self, needRefresh, value => $$invalidate(4, $needRefresh = value));

	function close() {
		systemUpdateDialog.close();
		needRefresh.set(false);
	}

	async function handleUpdateApp() {
		updateServiceWorker();
	}

	function systemdialog_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			systemUpdateDialog = $$value;
			$$invalidate(0, systemUpdateDialog);
		});
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$needRefresh, systemUpdateDialog*/ 17) {
			$needRefresh && systemUpdateDialog?.open();
		}

		if ($$self.$$.dirty & /*$needRefresh*/ 16) {
			set_store_value(systemNeedsUpdate, $systemNeedsUpdate = $needRefresh, $systemNeedsUpdate);
		}
	};

	return [
		systemUpdateDialog,
		needRefresh,
		close,
		handleUpdateApp,
		$needRefresh,
		systemdialog_binding
	];
}

class SystemUpdate extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
	}
}

const WindowsArea_svelte_svelte_type_style_lang = '';

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[5] = list[i];
	return child_ctx;
}

function get_then_context(ctx) {
	ctx[8] = ctx[9].default;
}

// (23:4) {#if $openApps[appID] && appsConfig[appID].shouldOpenWindow}
function create_if_block(ctx) {
	let await_block_anchor;
	let current;

	let info = {
		ctx,
		current: null,
		token: null,
		hasCatch: false,
		pending: create_pending_block,
		then: create_then_block,
		catch: create_catch_block,
		value: 9,
		blocks: [,,,]
	};

	handle_promise(__vitePreload(() => import('./Window.js'),true?["Window.js","Window.css"]:void 0), info);

	return {
		c() {
			await_block_anchor = empty();
			info.block.c();
		},
		m(target, anchor) {
			insert(target, await_block_anchor, anchor);
			info.block.m(target, info.anchor = anchor);
			info.mount = () => await_block_anchor.parentNode;
			info.anchor = await_block_anchor;
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			update_await_block_branch(info, ctx, dirty);
		},
		i(local) {
			if (current) return;
			transition_in(info.block);
			current = true;
		},
		o(local) {
			for (let i = 0; i < 3; i += 1) {
				const block = info.blocks[i];
				transition_out(block);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(await_block_anchor);
			info.block.d(detaching);
			info.token = null;
			info = null;
		}
	};
}

// (1:0) <script lang="ts">import { appsConfig }
function create_catch_block(ctx) {
	return {
		c: noop,
		m: noop,
		p: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (24:65)          <Window {appID}
function create_then_block(ctx) {
	get_then_context(ctx);
	let window;
	let t;
	let current;
	window = new /*Window*/ ctx[8]({ props: { appID: /*appID*/ ctx[5] } });

	return {
		c() {
			create_component(window.$$.fragment);
			t = space();
		},
		m(target, anchor) {
			mount_component(window, target, anchor);
			insert(target, t, anchor);
			current = true;
		},
		p(ctx, dirty) {
			get_then_context(ctx);
		},
		i(local) {
			if (current) return;
			transition_in(window.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(window.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(window, detaching);
			if (detaching) detach(t);
		}
	};
}

// (1:0) <script lang="ts">import { appsConfig }
function create_pending_block(ctx) {
	return {
		c: noop,
		m: noop,
		p: noop,
		i: noop,
		o: noop,
		d: noop
	};
}

// (22:2) {#each Object.keys(appsConfig) as appID}
function create_each_block(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*$openApps*/ ctx[0][/*appID*/ ctx[5]] && appsConfig[/*appID*/ ctx[5]].shouldOpenWindow && create_if_block(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (/*$openApps*/ ctx[0][/*appID*/ ctx[5]] && appsConfig[/*appID*/ ctx[5]].shouldOpenWindow) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*$openApps*/ 1) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function create_fragment$1(ctx) {
	let section;
	let current;
	let each_value = Object.keys(appsConfig);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			section = element("section");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(section, "id", "windows-area");
			attr(section, "class", "svelte-4t28ks");
		},
		m(target, anchor) {
			insert(target, section, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(section, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (dirty & /*Object, appsConfig, $openApps*/ 1) {
				each_value = Object.keys(appsConfig);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(section, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(section);
			destroy_each(each_blocks, detaching);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let $appZIndices;
	let $activeAppZIndex;
	let $activeApp;
	let $openApps;
	component_subscribe($$self, appZIndices, $$value => $$invalidate(1, $appZIndices = $$value));
	component_subscribe($$self, activeAppZIndex, $$value => $$invalidate(3, $activeAppZIndex = $$value));
	component_subscribe($$self, activeApp, $$value => $$invalidate(2, $activeApp = $$value));
	component_subscribe($$self, openApps, $$value => $$invalidate(0, $openApps = $$value));

	function normalizeAppZIndices() {
		if (!Object.values($appZIndices).some(zIndex => zIndex > 50)) return;

		// Get the lowest non-zero z-index
		const lowestZIndex = Math.min(...[...new Set(Object.values($appZIndices))].filter(val => val !== 0));

		set_store_value(activeAppZIndex, $activeAppZIndex -= lowestZIndex, $activeAppZIndex);
		const keys = Object.keys($appZIndices);

		for (const app of keys) {
			if ($appZIndices[app] >= lowestZIndex) {
				set_store_value(appZIndices, $appZIndices[app] -= lowestZIndex, $appZIndices);
			}
		}
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$activeApp, $activeAppZIndex*/ 12) {
			(set_store_value(activeAppZIndex, $activeAppZIndex += 2, $activeAppZIndex));
		}

		if ($$self.$$.dirty & /*$appZIndices*/ 2) {
			(normalizeAppZIndices());
		}
	};

	return [$openApps, $appZIndices, $activeApp];
}

class WindowsArea extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
	}
}

const Desktop_svelte_svelte_type_style_lang = '';

/* src/svelte/components/Desktop/Desktop.svelte generated by Svelte v3.53.1 */

function create_fragment(ctx) {
	let div;
	let main;
	let topbar;
	let t0;
	let windowsarea;
	let t1;
	let dock;
	let t2;
	let wallpaper;
	let t3;
	let bootupscreen;
	let t4;
	let systemupdate;
	let t5;
	let contextmenu;
	let current;
	topbar = new TopBar({});
	windowsarea = new WindowsArea({});
	dock = new Dock({});
	wallpaper = new Wallpaper({});
	bootupscreen = new BootupScreen({});
	systemupdate = new SystemUpdate({});

	contextmenu = new ContextMenu({
			props: { targetElement: /*mainEl*/ ctx[0] }
		});

	return {
		c() {
			div = element("div");
			main = element("main");
			create_component(topbar.$$.fragment);
			t0 = space();
			create_component(windowsarea.$$.fragment);
			t1 = space();
			create_component(dock.$$.fragment);
			t2 = space();
			create_component(wallpaper.$$.fragment);
			t3 = space();
			create_component(bootupscreen.$$.fragment);
			t4 = space();
			create_component(systemupdate.$$.fragment);
			t5 = space();
			create_component(contextmenu.$$.fragment);
			attr(main, "class", "svelte-bhy00h");
			attr(div, "class", "container svelte-bhy00h");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, main);
			mount_component(topbar, main, null);
			append(main, t0);
			mount_component(windowsarea, main, null);
			append(main, t1);
			mount_component(dock, main, null);
			append(div, t2);
			mount_component(wallpaper, div, null);
			append(div, t3);
			mount_component(bootupscreen, div, null);
			append(div, t4);
			mount_component(systemupdate, div, null);
			append(div, t5);
			mount_component(contextmenu, div, null);
			/*div_binding*/ ctx[1](div);
			current = true;
		},
		p(ctx, [dirty]) {
			const contextmenu_changes = {};
			if (dirty & /*mainEl*/ 1) contextmenu_changes.targetElement = /*mainEl*/ ctx[0];
			contextmenu.$set(contextmenu_changes);
		},
		i(local) {
			if (current) return;
			transition_in(topbar.$$.fragment, local);
			transition_in(windowsarea.$$.fragment, local);
			transition_in(dock.$$.fragment, local);
			transition_in(wallpaper.$$.fragment, local);
			transition_in(bootupscreen.$$.fragment, local);
			transition_in(systemupdate.$$.fragment, local);
			transition_in(contextmenu.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(topbar.$$.fragment, local);
			transition_out(windowsarea.$$.fragment, local);
			transition_out(dock.$$.fragment, local);
			transition_out(wallpaper.$$.fragment, local);
			transition_out(bootupscreen.$$.fragment, local);
			transition_out(systemupdate.$$.fragment, local);
			transition_out(contextmenu.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(topbar);
			destroy_component(windowsarea);
			destroy_component(dock);
			destroy_component(wallpaper);
			destroy_component(bootupscreen);
			destroy_component(systemupdate);
			destroy_component(contextmenu);
			/*div_binding*/ ctx[1](null);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let mainEl;

	function div_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			mainEl = $$value;
			$$invalidate(0, mainEl);
		});
	}

	return [mainEl, div_binding];
}

class Desktop extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

const global$1 = '';

new Desktop({
  target: document.getElementById("root")
});

export { wallpapersConfig as $, createEventDispatcher as A, set_style as B, action_destroyer as C, elevation as D, is_function as E, create_out_transition as F, isAppBeingDragged as G, appsInFullscreen as H, openApps as I, prefersReducedMotion as J, activeAppZIndex as K, appZIndices as L, theme as M, onMount as N, set_store_value as O, sineInOut as P, waitFor as Q, binding_callbacks as R, SvelteComponent as S, src_url_equal as T, spring as U, assign as V, set_svg_attributes as W, get_spread_update as X, exclude_internal_props as Y, text as Z, __vitePreload as _, insert as a, set_data as a0, destroy_each as a1, wallpaper as a2, isDockHidden as a3, requiredArgs as a4, toDate as a5, toInteger as a6, update_keyed_each as a7, destroy_block as a8, format as a9, transition_in as b, check_outros as c, detach as d, empty as e, create_component as f, group_outros as g, handle_promise as h, init as i, destroy_component as j, svg_element as k, attr as l, mount_component as m, noop as n, append as o, appsConfig as p, element as q, space as r, safe_not_equal as s, transition_out as t, update_await_block_branch as u, toggle_class as v, listen as w, run_all as x, component_subscribe as y, activeApp as z };
