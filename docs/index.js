import { t as tick, w as writable, S as SvelteComponent, i as init, s as safe_not_equal, e as element, a as space, b as attr, c as toggle_class, d as set_style, f as src_url_equal, h as insert, j as append, k as action_destroyer, l as listen, n as noop, m as detach, r as run_all, o as component_subscribe, p as spring, q as tweened, u as sineInOut, v as onDestroy, x as set_store_value, y as binding_callbacks, z as add_render_callback, A as transition_in, B as group_outros, C as check_outros, D as transition_out, E as destroy_each, F as globals, G as create_component, H as mount_component, I as destroy_component, J as sineIn, K as sineOut, L as empty, M as createEventDispatcher, N as create_slot, O as stop_propagation, P as update_slot_base, Q as get_all_dirty_from_scope, R as get_slot_changes, T as is_function, U as create_in_transition, V as create_out_transition, W as assign, X as svg_element, Y as set_svg_attributes, Z as get_spread_update, _ as exclude_internal_props, $ as bubble, a0 as onMount, a1 as text, a2 as set_data, a3 as bind, a4 as add_flush_callback, a5 as readable, a6 as quintInOut, a7 as prevent_default, a8 as handle_promise, a9 as update_await_block_branch } from './node_modules/svelte@3.53.1.js';
import { w as writable$1 } from './node_modules/svelte-local-storage-store@0.3.1_svelte@3.53.1.js';
import { b as bug, s as search, a as bar, f as folder, i as image, c as file, d as document$1, e as edit, g as download, u as upload, h as check, j as close, k as calendar$1, l as browser, m as comment, n as comment_o, o as github, p as heart, q as heart_o, r as star, t as star_o, v as moon, w as sunny_o, x as print, y as play, z as pause, A as stop, B as sync, C as fork, D as code, E as app_menu, F as cart, G as info, H as share, I as warning, J as question, K as gear, L as home, M as smile, N as arrow_up, O as arrow_right, P as arrow_left, Q as arrow_down, R as bell, S as terminal$1 } from './node_modules/feathericon@1.0.2.js';
import { i as interpolate } from './node_modules/popmotion@11.0.5.js';
import { f as format } from './node_modules/date-fns@2.29.3.js';
import './node_modules/style-value-types@5.1.2.js';
import './node_modules/hey-listen@1.0.8.js';

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

const name = "macos-svelte";
const version = "13.0.0";
const homepage = "https://github.com/milahu/svelte-web-desktop";
const type = "module";
const scripts = {
	dev: "vite",
	build: "vite build && ./fix-build.sh",
	serve: "vite preview",
	check: "svelte-check --tsconfig ./tsconfig.json"
};
const devDependencies = {
	"@codemirror/commands": "^6.1.2",
	"@codemirror/language": "^6.3.1",
	"@codemirror/state": "^6.1.4",
	"@codemirror/view": "^6.6.0",
	"@iconify-json/gg": "^1.1.3",
	"@iconify-json/ic": "^1.1.10",
	"@iconify-json/icon-park-outline": "^1.1.7",
	"@iconify-json/mdi": "^1.1.36",
	"@iconify-json/pepicons": "^1.1.8",
	"@iconify-json/ph": "^1.1.3",
	"@iconify-json/uil": "^1.1.3",
	"@sveltejs/vite-plugin-svelte": "1.0.9",
	autoprefixer: "^10.4.13",
	esprima: "^4.0.1",
	feathericon: "^1.0.2",
	postcss: "^8.4.19",
	"queue-microtask": "^1.2.3",
	sass: "^1.56.1",
	svelte: "^3.53.1",
	"svelte-check": "^2.10.0",
	"svelte-preprocess": "^4.10.7",
	typescript: "^4.9.3",
	vite: "3.1.7",
	"vite-imagetools": "^4.0.11",
	"vite-plugin-pwa": "^0.13.3",
	"workbox-window": "^6.5.4"
};
const dependencies = {
	"@fontsource/inter": "^4.5.14",
	"@neodrag/svelte": "^1.2.4",
	"date-fns": "^2.29.3",
	popmotion: "^11.0.5",
	"svelte-local-storage-store": "^0.3.1",
	"unplugin-icons": "^0.14.14"
};
const pkg = {
	name: name,
	version: version,
	homepage: homepage,
	type: type,
	scripts: scripts,
	devDependencies: devDependencies,
	dependencies: dependencies
};

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
const calendar = createAppConfig({
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
const sourceUrl = pkg.homepage;
const viewSource = createAppConfig({
  title: `View Source`,
  resizable: true,
  shouldOpenWindow: false,
  externalAction: () => window.open(sourceUrl, "_blank")
});
const appstore = createAppConfig({
  title: "App Store",
  resizable: true
});
const terminal = createAppConfig({
  title: "Terminal",
  expandable: true,
  resizable: true,
  height: 300,
  width: 480
});
const appsConfig = {
  finder,
  wallpapers,
  calculator,
  calendar,
  vscode,
  terminal,
  appstore,
  "view-source": viewSource
};

const openApps = writable({
  wallpapers: false,
  finder: true,
  vscode: false,
  calculator: false,
  appstore: false,
  calendar: false,
  "view-source": true,
  terminal: false
});
const activeApp = writable("finder");
const activeAppZIndex = writable(-2);
const appZIndices = writable({
  wallpapers: 0,
  finder: 0,
  vscode: 0,
  calculator: 0,
  appstore: 0,
  calendar: 0,
  "view-source": 0,
  terminal: 0
});
const isAppBeingDragged = writable(false);
const appsInFullscreen = writable({
  wallpapers: false,
  finder: false,
  vscode: false,
  calculator: false,
  appstore: false,
  calendar: false,
  "view-source": false,
  terminal: false
});

const systemNeedsUpdate = writable(false);

const isDockHidden = writable(false);

const prefersReducedMotion = writable$1(
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

const theme = writable$1("macos:theme-settings", {
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
appIcon["calendar"] = calendar$1;
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
appIcon["terminal"] = terminal$1;

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
const menuBarMenus = writable(
  menuConfigs.finder
);
const activeMenu = writable("");
const shouldShowNotch = writable$1("macos:setting:should-show-notch", false);

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

const wallpaper = writable$1("macos:wallpaper-settings:v2", {
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

const scriptRel = 'modulepreload';const assetsURL = function(dep,importerUrl) { return new URL(dep, importerUrl).href };const seen = {};const __vitePreload = function preload(baseModule, deps, importerUrl) {
    // @ts-ignore
    if (!true || !deps || deps.length === 0) {
        return baseModule();
    }
    return Promise.all(deps.map((dep) => {
        // @ts-ignore
        dep = assetsURL(dep, importerUrl);
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
      const { Workbox, messageSW } = await __vitePreload(() => import('./node_modules/workbox-window@6.5.4.js'),true?[]:void 0,import.meta.url);
      sendSkipWaitingMessage = async () => {
        if (registration && registration.waiting) {
          await messageSW(registration.waiting, { type: "SKIP_WAITING" });
        }
      };
      wb = new Workbox("./sw.js", { scope: "./", type: "classic" });
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
          onRegisteredSW("./sw.js", r);
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
  const needRefresh = writable(false);
  const offlineReady = writable(false);
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

const buildDate = '2022-12-05T13:48:57.634Z';

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
	console.log('useRegisterSW');

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

	handle_promise(__vitePreload(() => import('./Window.js'),true?["Window.js","Window.css","node_modules/svelte@3.53.1.js","node_modules/@neodrag_svelte@1.2.4.js","node_modules/svelte-local-storage-store@0.3.1_svelte@3.53.1.js","node_modules/feathericon@1.0.2.js","node_modules/popmotion@11.0.5.js","node_modules/style-value-types@5.1.2.js","node_modules/hey-listen@1.0.8.js","node_modules/date-fns@2.29.3.js"]:void 0,import.meta.url), info);

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

const global = '';

new Desktop({
  target: document.getElementById("root")
});

export { __vitePreload as _, appsConfig as a, activeApp as b, appsInFullscreen as c, activeAppZIndex as d, elevation as e, appZIndices as f, wallpapersConfig as g, wallpaper as h, isAppBeingDragged as i, isDockHidden as j, openApps as o, prefersReducedMotion as p, theme as t, waitFor as w };
